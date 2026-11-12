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
public class OpportunitiesPerformanceDto {
    private long totalOpportunities;
    private long openOpportunities;
    private BigDecimal pipelineValue;
    private BigDecimal weightedPipeline;
    private BigDecimal wonOpportunityValue;
    private String formattedTotalOpportunities;
    private String formattedOpenOpportunities;
    private String formattedPipelineValue;
    private String formattedWeightedPipeline;
    private String formattedWonOpportunityValue;
}

