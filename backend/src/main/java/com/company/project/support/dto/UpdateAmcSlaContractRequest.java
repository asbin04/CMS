package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAmcSlaContractRequest {
    private String clientId;
    private String clientName;
    private String projectId;
    private String projectName;
    private String serviceType;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate renewalDate;
    private BigDecimal contractValue;
    private String responseSla;
    private String resolutionSla;
    private String coverageHours;
    private String status;
    private String penaltyClause;
    private String renewalAlert;
    private String assignedManager;
    private String notes;
}

