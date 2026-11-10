package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RequirementResponse {
    private String requirementId;
    private String projectId;
    private String clientId;
    private LocalDate requirementDate;
    private String date; // Alias for frontend
    private String requirementType;
    private String type; // Alias for frontend
    private String featureName;
    private String requirementFeature; // Alias for frontend
    private String description;
    private String priority;
    private String ownerId;
    private String ownerName;
    private String status;
    private Boolean scopeFreeze;
    private String scopeFreezeText; // "Yes" / "No"
    private OffsetDateTime scopeFrozenAt;
    private String scopeFrozenBy;
    private String assignedApprover;
    private String approvedBy;
    private LocalDate approvalDate;
    private Integer completionPercentage;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

