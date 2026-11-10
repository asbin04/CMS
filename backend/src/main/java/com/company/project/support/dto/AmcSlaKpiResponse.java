package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmcSlaKpiResponse {
    private long totalContracts;
    private long activeContracts;
    private long expiringContracts;
    private long renewalOverdueContracts;
    private BigDecimal totalContractValue;
    private String formattedContractValue;
    private long renewalDue30Days;
    private long upcoming31to90Days;
    private long overdueRenewals;
    private long greater90Days;
}

