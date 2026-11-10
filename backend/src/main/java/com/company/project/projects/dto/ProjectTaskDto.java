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
public class ProjectTaskDto {
    private String id;
    private String taskId;
    private String projectId;
    private String milestone;
    private String taskName;
    private String name;
    private String assignedTo;
    private String priority;
    private LocalDate startDate;
    private LocalDate dueDate;
    private BigDecimal estimatedHours;
    private BigDecimal actualHours;
    private String status;
    private Integer progress;
    private String dependencies;
    private Integer subtasksCompleted;
    private Integer subtasksTotal;
    private String health;
    private Boolean billable;
    private Boolean billableDefault;
    private Integer daysRemaining;
    private OffsetDateTime createdAt;

    public String getId() {
        return id != null ? id : taskId;
    }

    public String getTaskId() {
        return taskId != null ? taskId : id;
    }

    public String getName() {
        return name != null ? name : taskName;
    }

    public String getTaskName() {
        return taskName != null ? taskName : name;
    }

    public Boolean getBillable() {
        return billable != null ? billable : billableDefault;
    }

    public Boolean getBillableDefault() {
        return billableDefault != null ? billableDefault : billable;
    }
}
