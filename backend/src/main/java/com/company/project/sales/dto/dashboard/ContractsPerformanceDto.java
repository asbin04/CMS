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
public class ContractsPerformanceDto {
    private long activeContracts;
    private BigDecimal contractedValue;
    private String formattedActiveContracts;
    private String formattedContractedValue;
}

