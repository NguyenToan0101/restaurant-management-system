package com.example.backend.dto;

import com.example.backend.entities.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillDTO {
    private UUID billId;
    private UUID orderId;
    private UUID branchId;
    private BigDecimal finalPrice;
    private String note;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidTime;
    private Instant createdAt;
    private OrderDTO order;
    private String restaurantName;
    private String branchName;
    private String branchAddress;
    private String branchPhone;
}
