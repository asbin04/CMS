package com.company.project.collections.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReversalResponse {

    private String id;
    private String paymentId;
    private String invoiceId;
    private String reversalDate;
    private BigDecimal amount;
    private String reason;
    private String referenceId;
    private String idempotencyKey;
    private String createdBy;
    private String createdAt;

    // Post-reversal financial & status feedback
    private BigDecimal invoiceOutstanding;
    private BigDecimal invoiceAmountPaid;
    private String invoiceStatus;
    private String collectionStatus;
    private String status;
}

