package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionOverviewDto {
    private String leadToOpportunity;
    private String opportunityToProposal;
    private String proposalToContract;
    private String overallConversion;
    private double rawLeadToOpportunity;
    private double rawOpportunityToProposal;
    private double rawProposalToContract;
    private double rawOverallConversion;
}

