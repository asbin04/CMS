package com.company.project.projects.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDeploymentDto {
    private String id;
    private String deploymentId;
    private String projectId;
    private String releaseVersion;
    private LocalDate deploymentDate;
    private String environment;
    private String deploymentOwner;
    private String preDeploymentChecklist;
    private String backupCompleted;
    private String rollbackPlan;
    private String smokeTest;
    private String status;
    private String clientSignOff;
    private LocalDate goLiveDate;
    private String handoverStatus;
    private String releaseNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public String getDeploymentId() {
        return deploymentId != null ? deploymentId : id;
    }
}

