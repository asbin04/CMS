package com.company.project.projects.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompletionPercentageRequest {
    @NotNull(message = "completionPercentage is required")
    @Min(value = 0, message = "completionPercentage must be >= 0")
    @Max(value = 100, message = "completionPercentage must be <= 100")
    private Integer completionPercentage;
}

