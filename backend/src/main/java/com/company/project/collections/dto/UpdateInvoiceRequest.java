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
public class UpdateInvoiceRequest {

    private String client;
    private String clientName;
    private String clientId;
    private String projectId;
    private String contractId;
    private String invoiceDate;
    private String dueDate;
    private BigDecimal amountBeforeTax;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private Integer paymentTermsDays;
    private String notes;
}

