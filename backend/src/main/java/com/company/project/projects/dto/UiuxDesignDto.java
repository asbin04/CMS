package com.company.project.projects.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UiuxDesignDto {
    private String id;
    private String projectId;
    private String requirementId;
    private String screenFeature;
    private String designType;
    private String version;
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

