package com.company.project.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollKpiResponse {
    private Long totalEmployees;
    private String totalEmployeesTrend;
    private Boolean totalEmployeesTrendPositive;

    private BigDecimal totalPayrollCost;
    private String formattedTotalPayrollCost;
    private String totalPayrollCostTrend;
    private Boolean totalPayrollCostTrendPositive;

    private BigDecimal netPayDisbursed;
    private String formattedNetPayDisbursed;
    private String netPayDisbursedTrend;
    private Boolean netPayDisbursedTrendPositive;

    private Long pendingPayrolls;
    private String pendingPayrollsTrend;
    private Boolean pendingPayrollsTrendPositive;

    private String lastUpdated;
}

