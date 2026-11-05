package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancePaymentDto {
    private String id;
    private LocalDate paymentDate;
    private String invoiceId;
    private String clientId;
    private String clientName;
    private BigDecimal amount;
    private BigDecimal invoiceAmount;
    private String mode;
    private String referenceNo;
    private String status;
    private BigDecimal varianceAmount;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}

