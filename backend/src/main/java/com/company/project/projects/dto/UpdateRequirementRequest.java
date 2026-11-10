package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRequirementRequest {
    private String projectId;
    private String clientId;
    private LocalDate requirementDate;
    private String date;

    private String requirementType;
    private String type;

    private String featureName;
    private String requirementFeature;

    private String description;
    private String priority;
    private String ownerId;
    private String status;

    private Boolean scopeFreeze;
    private String scopeFreezeText;

    @JsonAlias({"assigned_approver", "approver", "intendedApprover"})
    private String assignedApprover;

    @JsonAlias({"approved_by"})
    private String approvedBy;

    @JsonAlias({"approval_date", "approvedDate"})
    private LocalDate approvalDate;
    private String approvalDateString;

    @Min(value = 0, message = "completionPercentage must be >= 0")
    @Max(value = 100, message = "completionPercentage must be <= 100")
    private Integer completionPercentage;

    public LocalDate getApprovalDate() {
        if (approvalDate != null) return approvalDate;
        if (approvalDateString != null && !approvalDateString.isBlank()) {
            try {
                return LocalDate.parse(approvalDateString.trim());
            } catch (Exception ignored) {}
        }
        return null;
    }
}

