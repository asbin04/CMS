package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardKpisDto {
    private long totalLeads;
    private long totalOpportunities;
    private BigDecimal totalProposalsValue;
    private String formattedProposalsValue;
    private long activeContracts;
}

