package com.company.project.projects.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverrideLaborCostRequest {

    private BigDecimal estimatedLaborCost;
    private BigDecimal laborCostOverride;

    @NotBlank(message = "reason is required for labor cost override")
    private String reason;

    public BigDecimal getEstimatedLaborCost() {
        return estimatedLaborCost != null ? estimatedLaborCost : laborCostOverride;
    }

    public BigDecimal getLaborCostOverride() {
        return laborCostOverride != null ? laborCostOverride : estimatedLaborCost;
    }
}
