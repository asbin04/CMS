package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProjectDeploymentRequest {
    private String projectId;
    private String releaseVersion;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deploymentDate;
    private String environment;
    private String deploymentOwner;
    private String preDeploymentChecklist;
    private String backupCompleted;
    private String rollbackPlan;
    private String smokeTest;
    private String status;
    private String clientSignOff;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate goLiveDate;
    private String handoverStatus;
    private String releaseNotes;
}

