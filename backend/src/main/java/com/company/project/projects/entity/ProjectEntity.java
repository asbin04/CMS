package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "projects", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "project_code", length = 50, nullable = false, unique = true)
    private String projectCode;

    @Column(name = "project_name", length = 255, nullable = false)
    private String projectName;

    @Column(name = "client_id", length = 50, nullable = false)
    private String clientId;

    @Column(name = "project_manager", length = 100, nullable = false)
    private String projectManager;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "planned_end_date", nullable = false)
    private LocalDate plannedEndDate;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "In Progress";

    @Column(name = "priority", length = 50, nullable = false)
    @Builder.Default
    private String priority = "Medium";

    @Column(name = "health", length = 50, nullable = false)
    @Builder.Default
    private String health = "On Track";

    @Column(name = "contract_value", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal contractValue = BigDecimal.ZERO;

    @Column(name = "tasks_completed", nullable = false)
    @Builder.Default
    private Integer tasksCompleted = 0;

    @Column(name = "tasks_total", nullable = false)
    @Builder.Default
    private Integer tasksTotal = 0;

    @Column(name = "progress", nullable = false)
    @Builder.Default
    private Integer progress = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public String getDescription() {
        return projectName;
    }

    public String getProjectId() {
        return projectCode != null ? projectCode : id;
    }

    public void setProjectId(String projectId) {
        if (this.projectCode == null) {
            this.projectCode = projectId;
        }
        if (this.id == null) {
            this.id = projectId;
        }
    }

    public static class ProjectEntityBuilder {
        public ProjectEntityBuilder projectId(String projectId) {
            this.projectCode = projectId;
            this.id = projectId;
            return this;
        }
    }
}
