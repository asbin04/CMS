package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProjectDeploymentRequest {

    private String deploymentId;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Release version is required")
    private String releaseVersion;

    @NotNull(message = "Deployment date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate deploymentDate;

    @NotBlank(message = "Environment is required")
    private String environment;

    @NotBlank(message = "Deployment owner is required")
    private String deploymentOwner;

    @Builder.Default
    private String preDeploymentChecklist = "Completed";

    @Builder.Default
    private String backupCompleted = "Yes";

    @Builder.Default
    private String rollbackPlan = "Available";

    @Builder.Default
    private String smokeTest = "Successful";

    @Builder.Default
    private String status = "Live";

    @Builder.Default
    private String clientSignOff = "Completed";

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate goLiveDate;

    @Builder.Default
    private String handoverStatus = "Handed Over";

    private String releaseNotes;
}

