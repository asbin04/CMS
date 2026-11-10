package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimesheetKpisResponse {
    private BigDecimal totalHours;
    private BigDecimal totalHoursLogged;
    private BigDecimal billableHours;
    private BigDecimal billableAmount;
    private Long pendingApprovals;
    private Long approvedTimesheets;
    private Double utilizationRate;

    @Builder.Default
    private String totalHoursTrend = "+12.5% this month";

    @Builder.Default
    private String billableHoursTrend = "+8.3% this month";

    @Builder.Default
    private String billableAmountTrend = "+15.2% this month";

    @Builder.Default
    private String pendingApprovalsTrend = "Needs review";

    public BigDecimal getTotalHours() {
        return totalHours != null ? totalHours : totalHoursLogged;
    }

    public BigDecimal getTotalHoursLogged() {
        return totalHoursLogged != null ? totalHoursLogged : totalHours;
    }
}
