package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_deployments", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDeploymentEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "release_version", length = 50, nullable = false)
    private String releaseVersion;

    @Column(name = "deployment_date", nullable = false)
    private LocalDate deploymentDate;

    @Column(name = "environment", length = 50, nullable = false)
    private String environment;

    @Column(name = "deployment_owner", length = 100, nullable = false)
    private String deploymentOwner;

    @Column(name = "pre_deployment_checklist", length = 50, nullable = false)
    @Builder.Default
    private String preDeploymentChecklist = "Completed";

    @Column(name = "backup_completed", length = 10, nullable = false)
    @Builder.Default
    private String backupCompleted = "Yes";

    @Column(name = "rollback_plan", length = 50, nullable = false)
    @Builder.Default
    private String rollbackPlan = "Available";

    @Column(name = "smoke_test", length = 50, nullable = false)
    @Builder.Default
    private String smokeTest = "Successful";

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "Live";

    @Column(name = "client_sign_off", length = 50, nullable = false)
    @Builder.Default
    private String clientSignOff = "Completed";

    @Column(name = "go_live_date")
    private LocalDate goLiveDate;

    @Column(name = "handover_status", length = 50, nullable = false)
    @Builder.Default
    private String handoverStatus = "Handed Over";

    @Column(name = "release_notes", columnDefinition = "TEXT")
    private String releaseNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

