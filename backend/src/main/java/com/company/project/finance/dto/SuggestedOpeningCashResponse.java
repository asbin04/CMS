package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedOpeningCashResponse {

    private String periodCode;
    private BigDecimal suggestedOpeningCash;
    private String previousPeriod;
    private String previousPeriodCode;
    private boolean isManualEntry;
}

