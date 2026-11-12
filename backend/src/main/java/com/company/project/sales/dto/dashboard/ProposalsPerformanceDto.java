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
public class ProposalsPerformanceDto {
    private BigDecimal totalProposalValue;
    private BigDecimal acceptedProposalValue;
    private double proposalWinRate;
    private String formattedTotalProposalValue;
    private String formattedAcceptedProposalValue;
    private String formattedProposalWinRate;
}

