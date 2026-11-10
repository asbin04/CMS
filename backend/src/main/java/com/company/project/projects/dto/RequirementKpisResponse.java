package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequirementKpisResponse {
    private Long totalRequirements;
    private Long inProgress;
    private Long completed;
    private Long pendingApproval;
    private Long scopeFrozen;

    @Builder.Default
    private String totalRequirementsTrend = "+4 this month";
}
