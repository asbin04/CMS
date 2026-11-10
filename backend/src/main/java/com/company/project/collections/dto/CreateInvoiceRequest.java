package com.company.project.collections.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvoiceRequest {

    private String invoiceId;

    private String clientId;

    private String client;

    private String clientName;

    @NotBlank(message = "Invoice date is required")
    private String invoiceDate;

    @NotBlank(message = "Due date is required")
    private String dueDate;

    @PositiveOrZero(message = "Outstanding amount cannot be negative")
    private BigDecimal outstanding;

    private String statusOverride;

    private Boolean autoAssignIfTaken;

    // V19 Finance Attributes
    private String projectId;

    private String contractId;

    @PositiveOrZero(message = "Amount before tax cannot be negative")
    private BigDecimal amountBeforeTax;

    @PositiveOrZero(message = "Tax rate cannot be negative")
    private BigDecimal taxRate;

    @PositiveOrZero(message = "Tax amount cannot be negative")
    private BigDecimal taxAmount;

    @PositiveOrZero(message = "Total invoice amount cannot be negative")
    private BigDecimal invoiceAmount;

    private Integer paymentTermsDays;

    private String notes;

    public String getEffectiveClientName() {
        if (clientName != null && !clientName.trim().isEmpty()) {
            return clientName.trim();
        }
        if (client != null && !client.trim().isEmpty()) {
            return client.trim();
        }
        return "Unknown Client";
    }
}
