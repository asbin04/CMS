package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_developments", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDevelopmentEntity {

    @Id
    @Column(name = "development_id", length = 50, nullable = false)
    private String developmentId;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "requirement_id", length = 50, nullable = false)
    private String requirementId;

    @Column(name = "task_id", length = 50, nullable = false)
    private String taskId;

    @Column(name = "developer_id", length = 50)
    private String developerId;

    @Column(name = "developer_name", length = 255, nullable = false)
    private String developerName;

    @Column(name = "repository_url", length = 500, nullable = false)
    private String repositoryUrl;

    @Column(name = "branch", length = 255, nullable = false)
    private String branch;

    @Column(name = "environment", length = 50, nullable = false)
    private String environment;

    @Column(name = "build_version", length = 50, nullable = false)
    private String buildVersion;

    @Column(name = "code_review_status", length = 50, nullable = false)
    @Builder.Default
    private String codeReviewStatus = "In Review";

    @Column(name = "qa_handoff_date")
    private LocalDate qaHandoffDate;

    @Column(name = "release_id", length = 50, nullable = false)
    @Builder.Default
    private String releaseId = "-";

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "In Progress";

    @Column(name = "technical_notes", columnDefinition = "TEXT")
    private String technicalNotes;

    @Column(name = "documentation_link", length = 500)
    private String documentationLink;

    @Column(name = "created_by", length = 100, nullable = false)
    @Builder.Default
    private String createdBy = "SYSTEM";

    @Column(name = "updated_by", length = 100, nullable = false)
    @Builder.Default
    private String updatedBy = "SYSTEM";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

