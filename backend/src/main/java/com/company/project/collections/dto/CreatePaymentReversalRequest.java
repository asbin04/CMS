package com.company.project.collections.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentReversalRequest {

    @NotNull(message = "Reversal amount is required")
    @Positive(message = "Reversal amount must be greater than zero")
    private BigDecimal reversalAmount;

    @NotBlank(message = "Reversal reason is required")
    private String reason;

    private String referenceId;

    private String idempotencyKey;

    private String createdBy;
}

