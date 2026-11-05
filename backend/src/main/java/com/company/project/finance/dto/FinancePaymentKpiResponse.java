package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancePaymentKpiResponse {
    // Total Payments
    private BigDecimal totalPayments;
    private Double totalPaymentsGrowth;
    private String totalPaymentsTrend; // "up" or "down"

    // Pending Payments
    private BigDecimal pendingPayments;
    private Double pendingPaymentsGrowth;
    private String pendingPaymentsTrend; // "up" or "down"

    // Matched Payments
    private BigDecimal matchedPayments;
    private Double matchedPaymentsGrowth;
    private String matchedPaymentsTrend; // "up" or "down"

    // Payment Variance
    private BigDecimal paymentVariance;
    private Double paymentVarianceGrowth;
    private String paymentVarianceTrend; // "up" or "down"

    // Dynamic metadata
    private String lastUpdatedFormatted;
    private Long totalRecordCount;
}

