package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowKpisResponse {

    private String period;
    private String periodCode;

    private BigDecimal openingCash;
    private BigDecimal totalInflows;
    private BigDecimal totalOutflows;
    private BigDecimal closingCash;
    private BigDecimal netCashFlow;

    private boolean hasData;
    private Instant lastUpdated;

    public static CashFlowKpisResponse empty() {
        return CashFlowKpisResponse.builder()
                .period("-")
                .periodCode("-")
                .openingCash(BigDecimal.ZERO)
                .totalInflows(BigDecimal.ZERO)
                .totalOutflows(BigDecimal.ZERO)
                .closingCash(BigDecimal.ZERO)
                .netCashFlow(BigDecimal.ZERO)
                .hasData(false)
                .lastUpdated(Instant.now())
                .build();
    }
}

