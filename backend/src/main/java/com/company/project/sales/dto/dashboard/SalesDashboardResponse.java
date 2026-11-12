package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesDashboardResponse {
    private String period;
    private String lastUpdated;
    private SalesDashboardKpisDto kpis;
    private SalesPerformanceDto performance;
    private List<FunnelStageDto> funnelStages;
    private ConversionOverviewDto conversion;
    private SalesConversionFunnelDto funnel;
    private List<WorkflowStageDto> workflowStages;
    private SalesWorkflowDto workflow;
}

