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
public class ExpenseKpiResponse {
    private BigDecimal totalExpenses;
    private BigDecimal approvedExpenses;
    private BigDecimal pendingApproval;
    private BigDecimal rejectedExpenses;
    private BigDecimal thisMonthExpenses;

    private int totalExpensesTrend;
    private int approvedExpensesTrend;
    private int pendingApprovalTrend;
    private int rejectedExpensesTrend;
    private int thisMonthExpensesTrend;

    private long totalCount;
}

