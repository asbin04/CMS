package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDevelopmentRequest {

    @Size(max = 50, message = "Project ID cannot exceed 50 characters")
    @JsonAlias({"project", "projectId"})
    private String projectId;

    @Size(max = 50, message = "Requirement ID cannot exceed 50 characters")
    @JsonAlias({"requirement", "requirementId"})
    private String requirementId;

    @Size(max = 50, message = "Task ID cannot exceed 50 characters")
    @JsonAlias({"task", "taskId", "ticketId"})
    private String taskId;

    @Size(max = 50, message = "Developer ID cannot exceed 50 characters")
    private String developerId;

    @JsonAlias({"developer", "developerName"})
    @Size(max = 255, message = "Developer name cannot exceed 255 characters")
    private String developerName;

    @Size(max = 500, message = "Repository URL cannot exceed 500 characters")
    private String repositoryUrl;

    @Size(max = 255, message = "Branch name cannot exceed 255 characters")
    private String branch;

    @Size(max = 50, message = "Environment cannot exceed 50 characters")
    private String environment;

    @Size(max = 50, message = "Build version cannot exceed 50 characters")
    private String buildVersion;

    @Size(max = 50, message = "Code review status cannot exceed 50 characters")
    private String codeReviewStatus;

    private LocalDate qaHandoffDate;

    @Size(max = 50, message = "Release ID cannot exceed 50 characters")
    private String releaseId;

    @Size(max = 50, message = "Development status cannot exceed 50 characters")
    private String status;

    private String technicalNotes;

    @Size(max = 500, message = "Documentation link cannot exceed 500 characters")
    private String documentationLink;
}

