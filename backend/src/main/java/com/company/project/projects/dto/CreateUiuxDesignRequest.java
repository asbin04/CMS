package com.company.project.projects.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUiuxDesignRequest {

    private String id; // Optional, auto-generated if blank

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Requirement ID is required")
    private String requirementId;

    @NotBlank(message = "Screen / Feature name is required")
    private String screenFeature;

    @NotBlank(message = "Design type is required")
    private String designType;

    private String version;

    @NotBlank(message = "Designer name is required")
    private String designer;

    private String designerInitials;

    private String tool;

    private String prototypeUrl;

    private String clientFeedback;

    private LocalDate feedbackDate;

    private String approvalStatus;

    private String approvedBy;

    private LocalDate approvalDate;

    private String changeRequest;

    private String status;

    private String notes;
}

