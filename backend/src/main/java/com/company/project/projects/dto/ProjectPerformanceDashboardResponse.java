package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPerformanceDashboardResponse {
    private OverviewKpis overview;
    private FinancialKpis financials;
    private DeliveryPerformance delivery;
    private DeliveryFlow deliveryFlow;
    private ProjectDistribution distribution;
    private KeyInsights keyInsights;
    private List<ProjectProfitabilityRow> profitability;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OverviewKpis {
        private long activeProjects;
        private long atRiskProjects;
        private long delayedProjects;
        private long dueSoonProjects;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialKpis {
        private BigDecimal contractRevenueValue;
        private String contractRevenueFormatted;
        private BigDecimal totalProjectCost;
        private String totalProjectCostFormatted;
        private BigDecimal estimatedProjectProfit;
        private String estimatedProjectProfitFormatted;
        private BigDecimal overallProjectMargin;
        private String overallProjectMarginFormatted;
        @Builder.Default
        private String costTypeDisclosure = "Billable Cost (Logged Hours x Billable Rate)";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryPerformance {
        private BigDecimal loggedHours;
        private String loggedHoursFormatted;
        private BigDecimal billableAmount;
        private String billableAmountFormatted;
        private long openTasks;
        private long overdueTasks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryFlow {
        private long projectsCount;
        private long milestonesCount;
        private long tasksCount;
        private long timesheetsCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectDistribution {
        private long totalProjects;
        private DistributionItem onTrack;
        private DistributionItem atRisk;
        private DistributionItem delayed;
        private DistributionItem upcoming;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DistributionItem {
        private long count;
        private double percentage;
        private String formatted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyInsights {
        private String atRiskPercentage;
        private String delayedPercentage;
        private long dueSoonCount;
        private List<String> bulletPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectProfitabilityRow {
        private int sNo;
        private String projectId;
        private String projectCode;
        private String projectName;
        private BigDecimal revenue;
        private String revenueFormatted;
        private BigDecimal totalCost;
        private String totalCostFormatted;
        private BigDecimal profit;
        private String profitFormatted;
        private BigDecimal margin;
        private String marginFormatted;
        private String health;
        private String status;
    }
}

