package com.example.backend.services;

import com.example.backend.dto.*;
import com.example.backend.dto.request.*;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.*;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderItemCustomizationRepository orderItemCustomizationRepository;
    private final AreaTableRepository areaTableRepository;
    private final MenuItemRepository menuItemRepository;
    private final CustomizationRepository customizationRepository;
    private final MediaService mediaService;
    private final PromotionService promotionService;

    public OrderService(OrderRepository orderRepository,
                        OrderLineRepository orderLineRepository,
                        OrderItemRepository orderItemRepository,
                        OrderItemCustomizationRepository orderItemCustomizationRepository,
                        AreaTableRepository areaTableRepository,
                        MenuItemRepository menuItemRepository,
                        CustomizationRepository customizationRepository,
                        MediaService mediaService,
                        PromotionService promotionService) {
        this.orderRepository = orderRepository;
        this.orderLineRepository = orderLineRepository;
        this.orderItemRepository = orderItemRepository;
        this.orderItemCustomizationRepository = orderItemCustomizationRepository;
        this.areaTableRepository = areaTableRepository;
        this.menuItemRepository = menuItemRepository;
        this.customizationRepository = customizationRepository;
        this.mediaService = mediaService;
        this.promotionService = promotionService;
    }

    @Transactional
    public OrderDTO createOrder(CreateOrderRequest request) {
        AreaTable table = areaTableRepository.findById(request.getAreaTableId())
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND));

        Optional<Order> existingOrder = orderRepository.findByAreaTable_AreaTableIdAndStatus(
                request.getAreaTableId(), OrderStatus.EATING);
        if (existingOrder.isPresent()) {
            return addItemsToOrder(existingOrder.get().getOrderId(),
                    new AddItemsToOrderRequest(request.getItems()));
        }

        Order order = new Order();
        order.setAreaTable(table);
        order.setStatus(OrderStatus.EATING);
        order.setTotalPrice(BigDecimal.ZERO);
        order.setCreatedAt(Instant.now());
        order = orderRepository.save(order);

        OrderLine orderLine = createOrderLine(order, request.getItems());
        recalculateOrderTotals(order);

        table.setStatus(TableStatus.OCCUPIED);
        areaTableRepository.save(table);

        return toOrderDTO(order);
    }

    @Transactional
    public OrderDTO addItemsToOrder(UUID orderId, AddItemsToOrderRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() != OrderStatus.EATING) {
            throw new AppException(ErrorCode.ORDER_ALREADY_COMPLETED);
        }

        OrderLine orderLine = createOrderLine(order, request.getItems());
        recalculateOrderTotals(order);

        return toOrderDTO(order);
    }

    private OrderLine createOrderLine(Order order, List<CreateOrderItemRequest> items) {
        OrderLine orderLine = new OrderLine();
        orderLine.setOrder(order);
        orderLine.setOrderLineStatus(OrderLineStatus.PENDING);
        orderLine.setTotalPrice(BigDecimal.ZERO);
        orderLine.setCreatedAt(Instant.now());
        orderLine = orderLineRepository.save(orderLine);

        // Manually synchronize bi-directional relationship for recalculateOrderTotals to work
        order.getOrderLines().add(orderLine);

        BigDecimal lineTotal = BigDecimal.ZERO;

        for (CreateOrderItemRequest itemReq : items) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

            BigDecimal discountedPrice = promotionService.calculateItemDiscountedPrice(menuItem);
            BigDecimal unitPrice = menuItem.getPrice();
            BigDecimal itemPrice = discountedPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrderLine(orderLine);
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setNote(itemReq.getNote());
            orderItem.setStatus(EntityStatus.ACTIVE);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setDiscountedUnitPrice(discountedPrice);
            orderItem.setTotalPrice(itemPrice);
            orderItem = orderItemRepository.save(orderItem);

            // Synchronize bi-directional relationship
            orderLine.getOrderItems().add(orderItem);

            if (itemReq.getCustomizations() != null) {
                for (CreateOrderItemCustomizationRequest custReq : itemReq.getCustomizations()) {
                    Customization customization = customizationRepository.findById(custReq.getCustomizationId())
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND));

                    BigDecimal custPrice = customization.getPrice()
                            .multiply(BigDecimal.valueOf(custReq.getQuantity()));

                    OrderItemCustomization oic = new OrderItemCustomization();
                    oic.setOrderItem(orderItem);
                    oic.setCustomization(customization);
                    oic.setQuantity(custReq.getQuantity());
                    oic.setTotalPrice(custPrice);
                    orderItemCustomizationRepository.save(oic);

                    itemPrice = itemPrice.add(custPrice);
                }
            }

            orderItem.setTotalPrice(itemPrice);
            orderItemRepository.save(orderItem);
            lineTotal = lineTotal.add(itemPrice);
        }

        orderLine.setTotalPrice(lineTotal);
        return orderLineRepository.save(orderLine);
    }

    @Transactional
    public OrderDTO updateOrderItem(UUID orderItemId, UpdateOrderItemRequest request) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Re-snapshot prices at update time (keep behavior consistent with add-items flow)
        BigDecimal basePrice = promotionService.calculateItemDiscountedPrice(orderItem.getMenuItem());
        BigDecimal unitPrice = orderItem.getMenuItem().getPrice();
        BigDecimal custTotal = orderItem.getOrderItemCustomizations().stream()
                .map(OrderItemCustomization::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal perItemPrice = basePrice.add(
                custTotal.divide(BigDecimal.valueOf(Math.max(orderItem.getQuantity(), 1)),
                        2, java.math.RoundingMode.HALF_UP));

        orderItem.setQuantity(request.getQuantity());
        orderItem.setNote(request.getNote());
        orderItem.setUnitPrice(unitPrice);
        orderItem.setDiscountedUnitPrice(basePrice);
        orderItem.setTotalPrice(perItemPrice.multiply(BigDecimal.valueOf(request.getQuantity())));
        orderItemRepository.save(orderItem);

        recalculateOrderTotals(orderItem.getOrderLine().getOrder());

        return toOrderDTO(orderItem.getOrderLine().getOrder());
    }

    @Transactional
    public OrderDTO removeOrderItem(UUID orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Order order = orderItem.getOrderLine().getOrder();
        orderItem.setStatus(EntityStatus.DELETED);
        orderItemRepository.save(orderItem);

        recalculateOrderTotals(order);
        return toOrderDTO(order);
    }

    private void recalculateOrderTotals(Order order) {
        BigDecimal orderTotal = BigDecimal.ZERO;
        for (OrderLine line : order.getOrderLines()) {
            BigDecimal lineTotal = BigDecimal.ZERO;
            for (OrderItem item : line.getOrderItems()) {
                if (item.getStatus() != EntityStatus.DELETED) {
                    lineTotal = lineTotal.add(item.getTotalPrice());
                }
            }
            line.setTotalPrice(lineTotal);
            orderLineRepository.save(line);
            orderTotal = orderTotal.add(lineTotal);
        }
        order.setTotalPrice(orderTotal);
        orderRepository.save(order);
    }

    public OrderDTO getOrderById(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return toOrderDTO(order);
    }

    public OrderDTO getActiveOrderByTable(UUID tableId) {
        Order order = orderRepository.findByAreaTable_AreaTableIdAndStatus(tableId, OrderStatus.EATING)
                .orElse(null);
        return order != null ? toOrderDTO(order) : null;
    }

    public List<OrderDTO> getOrdersByBranch(UUID branchId) {
        return orderRepository.findByBranchId(branchId).stream()
                .map(this::toHistoricalOrderDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getActiveOrdersByBranch(UUID branchId) {
        return orderRepository.findByBranchIdAndStatus(branchId, OrderStatus.EATING).stream()
                .map(this::toOrderDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO cancelOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        AreaTable table = order.getAreaTable();
        table.setStatus(TableStatus.FREE);
        areaTableRepository.save(table);

        return toOrderDTO(order);
    }

    public List<OrderDTO> getOrderHistory(UUID branchId) {
        return orderRepository.findHistoryByBranchId(branchId).stream()
                .map(this::toHistoricalOrderDTO)
                .collect(Collectors.toList());
    }

    public Page<OrderSummaryDTO> searchOrders(UUID branchId, OrderStatus status, String searchTerm, 
                                            Instant startDate, Instant endDate, Pageable pageable) {
        String formattedSearchTerm = (searchTerm == null || searchTerm.isEmpty()) ? null : "%" + searchTerm.toLowerCase() + "%";
        return orderRepository.searchOrders(branchId, status, formattedSearchTerm, startDate, endDate, pageable)
                .map(this::toOrderSummaryDTO);
    }

    public List<OrderLineDTO> getCurrentOrderLines(UUID branchId) {
        return orderLineRepository.findCurrentOrderLinesByBranchId(branchId).stream()
                .map(this::toOrderLineDTO)
                .collect(Collectors.toList());
    }

    public OrderLineDTO getOrderLineById(UUID orderLineId) {
        OrderLine orderLine = orderLineRepository.findById(orderLineId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return toOrderLineDTO(orderLine);
    }

    @Transactional
    public OrderLineDTO updateOrderLineStatus(UUID orderLineId, OrderLineStatus status) {
        OrderLine orderLine = orderLineRepository.findById(orderLineId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        
        orderLine.setOrderLineStatus(status);
        orderLine = orderLineRepository.save(orderLine);
        
        // Potential logic: if all lines are completed, update order status?
        // For now just update the line.
        
        return toOrderLineDTO(orderLine);
    }

    private OrderLineDTO toOrderLineDTO(OrderLine line) {
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        if (line.getOrderItems() != null) {
            for (OrderItem item : line.getOrderItems()) {
                if (item.getStatus() == EntityStatus.DELETED) continue;

                String imageUrl = null;
                try {
                    imageUrl = mediaService.getImageUrlByTarget(
                            item.getMenuItem().getMenuItemId(), "MENU_ITEM_IMAGE");
                } catch (Exception ignored) {}

                List<OrderItemCustomizationDTO> custDTOs = new ArrayList<>();
                if (item.getOrderItemCustomizations() != null) {
                    for (OrderItemCustomization oic : item.getOrderItemCustomizations()) {
                        custDTOs.add(OrderItemCustomizationDTO.builder()
                                .orderItemCustomizationId(oic.getOrderItemCustomizationId())
                                .customizationId(oic.getCustomization().getCustomizationId())
                                .customizationName(oic.getCustomization().getName())
                                .quantity(oic.getQuantity())
                                .totalPrice(oic.getTotalPrice())
                                .build());
                    }
                }

                itemDTOs.add(OrderItemDTO.builder()
                        .orderItemId(item.getOrderItemId())
                        .menuItemId(item.getMenuItem().getMenuItemId())
                        .menuItemName(item.getMenuItem().getName())
                        .menuItemImageUrl(imageUrl)
                        .menuItemPrice(item.getUnitPrice() != null ? item.getUnitPrice() : item.getMenuItem().getPrice())
                        .discountedPrice(item.getDiscountedUnitPrice() != null ? item.getDiscountedUnitPrice() : promotionService.calculateItemDiscountedPrice(item.getMenuItem()))
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .note(item.getNote())
                        .customizations(custDTOs)
                        .build());
            }
        }

        return OrderLineDTO.builder()
                .orderLineId(line.getOrderLineId())
                .orderId(line.getOrder().getOrderId())
                .orderLineStatus(line.getOrderLineStatus())
                .totalPrice(line.getTotalPrice())
                .createdAt(line.getCreatedAt())
                .tableName(line.getOrder().getAreaTable().getTag())
                .orderItems(itemDTOs)
                .build();
    }

    private OrderDTO toOrderDTO(Order order) {
        List<OrderLineDTO> lineDTOs = new ArrayList<>();

        if (order.getOrderLines() != null) {
            for (OrderLine line : order.getOrderLines()) {
                lineDTOs.add(toOrderLineDTO(line));
            }
        }

        return OrderDTO.builder()
                .orderId(order.getOrderId())
                .areaTableId(order.getAreaTable().getAreaTableId())
                .tableName(order.getAreaTable().getTag())
                .areaName(order.getAreaTable().getArea().getName())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderLines(lineDTOs)
                .build();
    }

    // For history views (manager/waiter), we want a stable snapshot that does NOT
    // recalculate item discounts based on current promotions. This prevents
    // newly-activated promotions from affecting old completed orders.
    private OrderDTO toHistoricalOrderDTO(Order order) {
        List<OrderLineDTO> lineDTOs = new ArrayList<>();

        if (order.getOrderLines() != null) {
            for (OrderLine line : order.getOrderLines()) {
                lineDTOs.add(toHistoricalOrderLineDTO(line));
            }
        }

        return OrderDTO.builder()
                .orderId(order.getOrderId())
                .areaTableId(order.getAreaTable().getAreaTableId())
                .tableName(order.getAreaTable().getTag())
                .areaName(order.getAreaTable().getArea().getName())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .orderLines(lineDTOs)
                .build();
    }

    private OrderLineDTO toHistoricalOrderLineDTO(OrderLine line) {
        List<OrderItemDTO> itemDTOs = new ArrayList<>();
        if (line.getOrderItems() != null) {
            for (OrderItem item : line.getOrderItems()) {
                if (item.getStatus() == EntityStatus.DELETED) continue;

                List<OrderItemCustomizationDTO> custDTOs = new ArrayList<>();
                if (item.getOrderItemCustomizations() != null) {
                    for (OrderItemCustomization oic : item.getOrderItemCustomizations()) {
                        custDTOs.add(OrderItemCustomizationDTO.builder()
                                .orderItemCustomizationId(oic.getOrderItemCustomizationId())
                                .customizationId(oic.getCustomization().getCustomizationId())
                                .customizationName(oic.getCustomization().getName())
                                .quantity(oic.getQuantity())
                                .totalPrice(oic.getTotalPrice())
                                .build());
                    }
                }

                java.math.BigDecimal menuPrice = item.getMenuItem() != null
                        ? item.getMenuItem().getPrice()
                        : java.math.BigDecimal.ZERO;

                itemDTOs.add(OrderItemDTO.builder()
                        .orderItemId(item.getOrderItemId())
                        .menuItemId(item.getMenuItem().getMenuItemId())
                        .menuItemName(item.getMenuItem().getName())
                        .menuItemImageUrl(null)
                        .menuItemPrice(menuPrice)
                        .discountedPrice(menuPrice)
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .note(item.getNote())
                        .customizations(custDTOs)
                        .build());
            }
        }

        return OrderLineDTO.builder()
                .orderLineId(line.getOrderLineId())
                .orderId(line.getOrder().getOrderId())
                .orderLineStatus(line.getOrderLineStatus())
                .totalPrice(line.getTotalPrice())
                .createdAt(line.getCreatedAt())
                .tableName(line.getOrder().getAreaTable().getTag())
                .orderItems(itemDTOs)
                .build();
    }

    private OrderSummaryDTO toOrderSummaryDTO(Order order) {
        return OrderSummaryDTO.builder()
                .orderId(order.getOrderId())
                .areaTableId(order.getAreaTable().getAreaTableId())
                .tableName(order.getAreaTable().getTag())
                .areaName(order.getAreaTable().getArea().getName())
                .status(order.getStatus())
                .totalPrice(order.getTotalPrice())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
