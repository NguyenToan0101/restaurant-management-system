package com.example.backend.services;

import com.example.backend.dto.BillDTO;
import com.example.backend.dto.request.ConfirmPaymentRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    public BillService(BillRepository billRepository,
                       OrderRepository orderRepository,
                       BranchRepository branchRepository,
                       AreaTableRepository areaTableRepository,
                       OrderService orderService) {
        this.billRepository = billRepository;
        this.orderRepository = orderRepository;
        this.branchRepository = branchRepository;
        this.areaTableRepository = areaTableRepository;
        this.orderService = orderService;
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

        Bill bill = new Bill();
        bill.setOrder(order);
        bill.setBranch(branch);
        bill.setFinalPrice(order.getTotalPrice());
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setNote(request.getNote());
        bill.setPaidTime(LocalDateTime.now());
        bill = billRepository.save(bill);

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

    private BillDTO toBillDTO(Bill bill) {
        Branch branch = bill.getBranch();
        return BillDTO.builder()
                .billId(bill.getBillId())
                .orderId(bill.getOrder() != null ? bill.getOrder().getOrderId() : null)
                .branchId(branch.getBranchId())
                .finalPrice(bill.getFinalPrice())
                .note(bill.getNote())
                .paymentMethod(bill.getPaymentMethod())
                .paidTime(bill.getPaidTime())
                .createdAt(bill.getCreatedAt())
                .order(bill.getOrder() != null ? orderService.getOrderById(bill.getOrder().getOrderId()) : null)
                .restaurantName(branch.getRestaurant() != null ? branch.getRestaurant().getName() : null)
                .branchName(branch.getAddress())
                .branchAddress(branch.getAddress())
                .branchPhone(branch.getBranchPhone())
                .build();
    }
}
