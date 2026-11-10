package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private String projectId;
    private String id;
    private String projectCode;
    private String projectName;
    private String name;
    private String clientId;
    private String projectManager;
    private LocalDate startDate;
    private LocalDate plannedEndDate;
    private String status;
    private String priority;
    private String health;
    private BigDecimal contractValue;
    private Integer tasksCompleted;
    private Integer tasksTotal;
    private Integer progress;
    private Integer daysRemaining;
    private String scheduleStatus;
    private String description;
    private OffsetDateTime createdAt;

    public String getId() {
        return id != null ? id : (projectId != null ? projectId : projectCode);
    }

    public String getProjectId() {
        return projectId != null ? projectId : (projectCode != null ? projectCode : id);
    }

    public String getProjectCode() {
        return projectCode != null ? projectCode : (projectId != null ? projectId : id);
    }

    public String getName() {
        return name != null ? name : projectName;
    }

    public String getProjectName() {
        return projectName != null ? projectName : name;
    }
}
