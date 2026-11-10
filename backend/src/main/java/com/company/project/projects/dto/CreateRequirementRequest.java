package com.company.project.projects.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRequirementRequest {

    @NotBlank(message = "projectId is required")
    private String projectId;

    private String clientId;

    private LocalDate requirementDate;
    private String date; // Accepts date string or requirementDate

    @com.fasterxml.jackson.annotation.JsonAlias({"type"})
    private String requirementType;
    private String type; // Alias for requirementType

    @com.fasterxml.jackson.annotation.JsonAlias({"title", "requirementFeature"})
    private String featureName;
    private String requirementFeature; // Alias for featureName
    private String title; // Alias for featureName

    private String description;

    @Builder.Default
    private String priority = "Medium";

    @NotBlank(message = "ownerId is required")
    private String ownerId;

    @Builder.Default
    private String status = "In Progress";

    private Boolean scopeFreeze;
    private String scopeFreezeText; // "Yes" / "No"

    @com.fasterxml.jackson.annotation.JsonAlias({"assigned_approver", "approver", "intendedApprover"})
    private String assignedApprover;

    @com.fasterxml.jackson.annotation.JsonAlias({"approved_by"})
    private String approvedBy;

    @com.fasterxml.jackson.annotation.JsonAlias({"approval_date", "approvedDate"})
    private LocalDate approvalDate;
    private String approvalDateString;

    @Min(value = 0, message = "completionPercentage must be >= 0")
    @Max(value = 100, message = "completionPercentage must be <= 100")
    @Builder.Default
    private Integer completionPercentage = 0;

    public String getFeatureName() {
        if (featureName != null && !featureName.isBlank()) return featureName;
        if (requirementFeature != null && !requirementFeature.isBlank()) return requirementFeature;
        return title;
    }

    public String getRequirementType() {
        if (requirementType != null && !requirementType.isBlank()) return requirementType;
        return type != null && !type.isBlank() ? type : "Feature";
    }

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

