package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_tasks", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTaskEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "milestone", length = 100, nullable = false)
    @Builder.Default
    private String milestone = "General";

    @Column(name = "task_name", length = 255, nullable = false)
    private String taskName;

    @Column(name = "assigned_to", length = 100, nullable = false)
    @Builder.Default
    private String assignedTo = "Unassigned";

    @Column(name = "priority", length = 50, nullable = false)
    @Builder.Default
    private String priority = "Medium";

    @Column(name = "start_date", nullable = false)
    @Builder.Default
    private LocalDate startDate = LocalDate.now();

    @Column(name = "due_date", nullable = false)
    @Builder.Default
    private LocalDate dueDate = LocalDate.now().plusWeeks(2);

    @Column(name = "estimated_hours", precision = 6, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal estimatedHours = BigDecimal.ZERO;

    @Column(name = "actual_hours", precision = 6, scale = 1, nullable = false)
    @Builder.Default
    private BigDecimal actualHours = BigDecimal.ZERO;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "In Progress";

    @Column(name = "progress", nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @Column(name = "dependencies", length = 100)
    @Builder.Default
    private String dependencies = "None";

    @Column(name = "subtasks_completed", nullable = false)
    @Builder.Default
    private Integer subtasksCompleted = 0;

    @Column(name = "subtasks_total", nullable = false)
    @Builder.Default
    private Integer subtasksTotal = 0;

    @Column(name = "health", length = 50, nullable = false)
    @Builder.Default
    private String health = "On Track";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public String getTaskId() {
        return id;
    }

    public void setTaskId(String taskId) {
        this.id = taskId;
    }

    public Boolean getBillableDefault() {
        return true;
    }

    public static class ProjectTaskEntityBuilder {
        public ProjectTaskEntityBuilder taskId(String taskId) {
            this.id = taskId;
            return this;
        }

        public ProjectTaskEntityBuilder billableDefault(boolean billableDefault) {
            return this;
        }
    }
}
