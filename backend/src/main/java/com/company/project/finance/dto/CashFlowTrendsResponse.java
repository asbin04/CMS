package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowTrendsResponse {

    private TrendsKpisDto kpis;

    @Builder.Default
    private List<MonthlyTrendDto> monthlyTrends = new ArrayList<>();

    private OutflowBreakdownDto outflowBreakdown;

    @Builder.Default
    private List<PeriodPositionDto> periodPositions = new ArrayList<>();

    @Builder.Default
    private List<String> keyInsights = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendsKpisDto {
        private BigDecimal avgMonthlyInflow;
        private BigDecimal avgMonthlyOutflow;
        private BigDecimal netCashFlow;
        private BigDecimal closingCashLatest;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrendDto {
        private String period;
        private String periodCode;
        private BigDecimal totalInflows;
        private BigDecimal totalOutflows;
        private BigDecimal closingCash;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OutflowBreakdownDto {
        private BigDecimal totalOutflows;
        @Builder.Default
        private List<OutflowCategoryDto> categories = new ArrayList<>();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OutflowCategoryDto {
        private String name;
        private BigDecimal amount;
        private BigDecimal percentage;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodPositionDto {
        private String period;
        private String periodCode;
        private BigDecimal inflows;
        private BigDecimal outflows;
        private BigDecimal netCashFlow;
        private BigDecimal closingCash;
    }
}

