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
public class FinanceInvoiceKpiResponse {

    private Long totalInvoices;
    private Double totalInvoicesTrend;

    private BigDecimal totalInvoiceValue;
    private Double totalInvoiceValueTrend;

    private BigDecimal paidAmount;
    private Double paidAmountTrend;

    private BigDecimal outstandingAmount;
    private Double outstandingAmountTrend;
}

