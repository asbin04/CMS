package com.company.project.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateAmcSlaContractRequest {

    private String contractCode;

    @NotBlank(message = "Client ID is required")
    private String clientId;

    private String clientName;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    private String projectName;

    @NotBlank(message = "Service Type is required")
    private String serviceType;

    @NotNull(message = "Start Date is required")
    private LocalDate startDate;

    @NotNull(message = "End Date is required")
    private LocalDate endDate;

    @NotNull(message = "Renewal Date is required")
    private LocalDate renewalDate;

    @NotNull(message = "Contract Value is required")
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

