package com.company.project.sales.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPerformanceDto {
    private LeadsPerformanceDto leads;
    private OpportunitiesPerformanceDto opportunities;
    private ProposalsPerformanceDto proposals;
    private ContractsPerformanceDto contracts;
}

