package com.company.project.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class RecordPaymentRequest {

    private LocalDate paymentDate;

    @NotBlank(message = "Invoice ID is required")
    private String invoiceId;

    @NotBlank(message = "Client ID is required")
    private String clientId;

    private String clientName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private BigDecimal invoiceAmount;

    @NotBlank(message = "Payment mode is required")
    private String mode;

    @NotBlank(message = "Reference number is required")
    private String referenceNo;

    @NotBlank(message = "Status is required")
    private String status;

    private BigDecimal varianceAmount;

    private String notes;
}

