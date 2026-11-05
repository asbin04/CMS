package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentRequest {
    private LocalDate paymentDate;
    private String mode;
    private String referenceNo;
    private String status;
    private BigDecimal amount;
    private BigDecimal varianceAmount;
    private String notes;
}

