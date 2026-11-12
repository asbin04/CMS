package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeadsPerformanceDto {
    private long totalLeads;
    private long openLeads;
    private long wonLeads;
    private long lostLeads;
    private double leadWonPct;
    private String formattedTotalLeads;
    private String formattedOpenLeads;
    private String formattedWonLeads;
    private String formattedLeadWonPct;
}

