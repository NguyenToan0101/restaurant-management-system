package com.example.backend.services;

import com.example.backend.dto.*;
import com.example.backend.dto.request.ConfirmPaymentRequest;
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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillService {

        private final BillRepository billRepository;
        private final OrderRepository orderRepository;
        private final BranchRepository branchRepository;
        private final AreaTableRepository areaTableRepository;
        private final OrderService orderService;
        private final PromotionRepository promotionRepository;
        private final PromotionUsageRepository promotionUsageRepository;

        public BillService(BillRepository billRepository,
                        OrderRepository orderRepository,
                        BranchRepository branchRepository,
                        AreaTableRepository areaTableRepository,
                        OrderService orderService,
                        PromotionRepository promotionRepository,
                        PromotionUsageRepository promotionUsageRepository) {
                this.billRepository = billRepository;
                this.orderRepository = orderRepository;
                this.branchRepository = branchRepository;
                this.areaTableRepository = areaTableRepository;
                this.orderService = orderService;
                this.promotionRepository = promotionRepository;
                this.promotionUsageRepository = promotionUsageRepository;
        }

        @Transactional
        public BillDTO confirmPayment(ConfirmPaymentRequest request) {
                Order order = orderRepository.findById(request.getOrderId())
                                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

                if (order.getStatus() != OrderStatus.EATING) {
                        throw new AppException(ErrorCode.ORDER_ALREADY_COMPLETED);
                }

                Branch branch = branchRepository.findById(request.getBranchId())
                                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

                order.setStatus(OrderStatus.COMPLETED);
                orderRepository.save(order);

                AreaTable table = order.getAreaTable();
                table.setStatus(TableStatus.FREE);
                areaTableRepository.save(table);

                BigDecimal totalAmount = order.getTotalPrice();
                BigDecimal discountAmount = BigDecimal.ZERO;
                Promotion appliedPromotion = null;

                if (request.getPromotionCode() != null && !request.getPromotionCode().isEmpty()) {
                        appliedPromotion = promotionRepository.findByCodeAndStatus(request.getPromotionCode(), PromotionStatus.ACTIVE)
                                        .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

                        // Validate dates
                        if (appliedPromotion.getStartDate().isAfter(Instant.now()) || appliedPromotion.getEndDate().isBefore(Instant.now())) {
                                throw new AppException(ErrorCode.PROMOTION_EXPIRED);
                        }

                        // Validate restaurant
                        if (!appliedPromotion.getRestaurant().getRestaurantId().equals(branch.getRestaurant().getRestaurantId())) {
                                throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
                        }

                        // Validate min order value
                        if (appliedPromotion.getMinOrderValue() != null && totalAmount.compareTo(appliedPromotion.getMinOrderValue()) < 0) {
                                throw new AppException(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET);
                        }

                        // Calculate discount
                        if (appliedPromotion.getDiscountType() == DiscountType.PERCENTAGE) {
                                discountAmount = totalAmount.multiply(appliedPromotion.getDiscountValue()).divide(new BigDecimal(100), 2, java.math.RoundingMode.HALF_UP);
                                if (appliedPromotion.getMaxDiscountValue() != null && discountAmount.compareTo(appliedPromotion.getMaxDiscountValue()) > 0) {
                                        discountAmount = appliedPromotion.getMaxDiscountValue();
                                }
                        } else {
                                discountAmount = appliedPromotion.getDiscountValue();
                        }

                        // Ensure discount doesn't exceed total
                        if (discountAmount.compareTo(totalAmount) > 0) {
                                discountAmount = totalAmount;
                        }
                }

                Bill bill = new Bill();
                bill.setOrder(order);
                bill.setBranch(branch);
                bill.setFinalPrice(totalAmount.subtract(discountAmount));
                bill.setPromotion(appliedPromotion);
                bill.setDiscountAmount(discountAmount);
                bill.setPaymentMethod(request.getPaymentMethod());
                bill.setNote(request.getNote());
                bill.setPaidTime(Instant.now());
                bill = billRepository.save(bill);

                // Record usage
                if (appliedPromotion != null) {
                        PromotionUsage usage = new PromotionUsage();
                        usage.setPromotion(appliedPromotion);
                        usage.setOrder(order);
                        usage.setUsedAt(Instant.now());
                        usage.setDiscountAmount(discountAmount);
                        promotionUsageRepository.save(usage);
                }

                return toBillDTO(bill);
        }

        public BillDTO getBillByOrderId(UUID orderId) {
                Bill bill = billRepository.findByOrder_OrderId(orderId)
                                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
                return toBillDTO(bill);
        }

        public List<BillDTO> getBillsByBranch(UUID branchId) {
                return billRepository.findByBranch_BranchIdOrderByPaidTimeDesc(branchId).stream()
                                .map(this::toBillDTO)
                                .collect(Collectors.toList());
        }

        public BillDTO getBillById(UUID billId) {
                Bill bill = billRepository.findById(billId)
                                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_FOUND));
                return toBillDTO(bill);
        }

        public List<BillDTO> getBillingHistory(UUID branchId, Instant startDate, Instant endDate) {
                return billRepository.findByBranchAndDateRange(branchId, startDate, endDate).stream()
                                .map(this::toBillDTO)
                                .collect(Collectors.toList());
        }

        public Page<BillSummaryDTO> searchBills(UUID branchId, Instant startDate, Instant endDate,
                        PaymentMethod paymentMethod, String searchTerm, Pageable pageable) {
                String formattedSearchTerm = (searchTerm == null || searchTerm.isEmpty()) ? null
                                : "%" + searchTerm.toLowerCase() + "%";
                return billRepository
                                .searchBills(branchId, startDate, endDate, paymentMethod, formattedSearchTerm, pageable)
                                .map(this::toBillSummaryDTO);
        }

        private BillDTO toBillDTO(Bill bill) {
                Branch branch = bill.getBranch();
                return BillDTO.builder()
                                .billId(bill.getBillId())
                                .orderId(bill.getOrder() != null ? bill.getOrder().getOrderId() : null)
                                .branchId(branch.getBranchId())
                                .tableName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getTag()
                                                : "N/A")
                                .areaName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getArea().getName()
                                                : "N/A")
                                .finalPrice(bill.getFinalPrice())
                                .discountAmount(bill.getDiscountAmount())
                                .promotionCode(bill.getPromotion() != null ? bill.getPromotion().getCode() : null)
                                .promotionName(bill.getPromotion() != null ? bill.getPromotion().getName() : null)
                                .note(bill.getNote())
                                .paymentMethod(bill.getPaymentMethod())
                                .paidTime(bill.getPaidTime())
                                .createdAt(bill.getCreatedAt())
                                // Important: for historical bills, build a snapshot that does NOT
                                // recalculate current promotions, otherwise newly-activated promotions
                                // would appear on old receipts.
                                .order(buildOrderSnapshotForBill(bill.getOrder()))
                                .restaurantName(branch.getRestaurant() != null ? branch.getRestaurant().getName()
                                                : null)
                                // We don't have a branch name column; returning "Branch at {address}"
                                // duplicates branchAddress and confuses receipts.
                                .branchName(null)
                                .branchAddress(branch.getAddress())
                                .branchPhone(branch.getBranchPhone())
                                .build();
        }

        private OrderDTO buildOrderSnapshotForBill(Order order) {
                if (order == null) {
                        return null;
                }

                List<OrderLineDTO> lineDTOs = order.getOrderLines().stream()
                                .map(this::buildOrderLineSnapshotForBill)
                                .collect(Collectors.toList());

                return OrderDTO.builder()
                                .orderId(order.getOrderId())
                                .areaTableId(order.getAreaTable() != null ? order.getAreaTable().getAreaTableId()
                                                : null)
                                .tableName(order.getAreaTable() != null ? order.getAreaTable().getTag() : null)
                                .areaName(order.getAreaTable() != null && order.getAreaTable().getArea() != null
                                                ? order.getAreaTable().getArea().getName()
                                                : null)
                                .status(order.getStatus())
                                .totalPrice(order.getTotalPrice())
                                .createdAt(order.getCreatedAt())
                                .updatedAt(order.getUpdatedAt())
                                .orderLines(lineDTOs)
                                .build();
        }

        private OrderLineDTO buildOrderLineSnapshotForBill(OrderLine line) {
                List<OrderItemDTO> itemDTOs = line.getOrderItems().stream()
                                .filter(item -> item.getStatus() != EntityStatus.DELETED)
                                .map(this::buildOrderItemSnapshotForBill)
                                .collect(Collectors.toList());

                return OrderLineDTO.builder()
                                .orderLineId(line.getOrderLineId())
                                .orderId(line.getOrder() != null ? line.getOrder().getOrderId() : null)
                                .orderLineStatus(line.getOrderLineStatus())
                                .totalPrice(line.getTotalPrice())
                                .createdAt(line.getCreatedAt())
                                .tableName(line.getOrder() != null && line.getOrder().getAreaTable() != null
                                                ? line.getOrder().getAreaTable().getTag()
                                                : null)
                                .orderItems(itemDTOs)
                                .build();
        }

        private OrderItemDTO buildOrderItemSnapshotForBill(OrderItem item) {
                List<OrderItemCustomizationDTO> custDTOs = item.getOrderItemCustomizations().stream()
                                .map(oic -> OrderItemCustomizationDTO.builder()
                                                .orderItemCustomizationId(oic.getOrderItemCustomizationId())
                                                .customizationId(oic.getCustomization().getCustomizationId())
                                                .customizationName(oic.getCustomization().getName())
                                                .quantity(oic.getQuantity())
                                                .totalPrice(oic.getTotalPrice())
                                                .build())
                                .collect(Collectors.toList());

                // Use the stored menu item price for both menuItemPrice and discountedPrice so
                // the UI does not show newly-activated promotions on historical bills.
                java.math.BigDecimal menuPrice = item.getMenuItem() != null ? item.getMenuItem().getPrice()
                                : java.math.BigDecimal.ZERO;

                return OrderItemDTO.builder()
                                .orderItemId(item.getOrderItemId())
                                .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getMenuItemId() : null)
                                .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : null)
                                .menuItemImageUrl(null)
                                .menuItemPrice(menuPrice)
                                .discountedPrice(menuPrice)
                                .quantity(item.getQuantity())
                                .totalPrice(item.getTotalPrice())
                                .note(item.getNote())
                                .customizations(custDTOs)
                                .build();
        }

        private BillSummaryDTO toBillSummaryDTO(Bill bill) {
                return BillSummaryDTO.builder()
                                .billId(bill.getBillId())
                                .orderId(bill.getOrder() != null ? bill.getOrder().getOrderId() : null)
                                .tableName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getTag()
                                                : "N/A")
                                .areaName(bill.getOrder() != null && bill.getOrder().getAreaTable() != null
                                                ? bill.getOrder().getAreaTable().getArea().getName()
                                                : "N/A")
                                .finalPrice(bill.getFinalPrice())
                                .paymentMethod(bill.getPaymentMethod())
                                .paidTime(bill.getPaidTime())
                                .build();
        }
}
