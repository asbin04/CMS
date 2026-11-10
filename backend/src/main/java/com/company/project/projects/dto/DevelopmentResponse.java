package com.company.project.projects.dto;

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
public class DevelopmentResponse {

    private String developmentId;
    private String projectId;
    private String requirementId;
    private String taskId;
    private String developerId;
    private String developerName;
    private String repositoryUrl;
    private String branch;
    private String environment;
    private String buildVersion;
    private String codeReviewStatus;
    private LocalDate qaHandoffDate;
    private String releaseId;
    private String status;
    private String technicalNotes;
    private String documentationLink;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

