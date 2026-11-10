package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketTrendsResponse {
    private long totalTickets;
    private String totalTicketsTrend;
    private double resolutionRate;
    private String resolutionRateTrend;
    private String avgResponseHours;
    private String avgResponseHoursTrend;
    private String avgResolutionHours;
    private String avgResolutionHoursTrend;
    private double slaCompliance;
    private String slaComplianceTrend;

    private List<VolumeTrendItem> volumeTrends;
    private SlaPerformanceData slaPerformance;
    private List<TypeBreakdownItem> typeBreakdown;
    private List<PriorityDistributionItem> priorityDistribution;
    private List<String> keyInsights;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VolumeTrendItem {
        private String month;
        private int resolved;
        private int inProgress;
        private int pending;
        private int total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SlaPerformanceData {
        private double complianceRate;
        private int withinSlaCount;
        private double withinSlaPercentage;
        private int slaBreachCount;
        private double slaBreachPercentage;
        private String improvementNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeBreakdownItem {
        private String type;
        private int count;
        private double percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriorityDistributionItem {
        private String priority;
        private int count;
        private String color;
    }
}

