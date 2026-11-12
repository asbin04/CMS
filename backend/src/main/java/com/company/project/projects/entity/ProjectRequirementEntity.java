package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_requirements", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRequirementEntity {

    @Id
    @Column(name = "requirement_id", length = 50, nullable = false)
    private String requirementId;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "client_id", length = 64, nullable = false)
    private String clientId;

    @Column(name = "requirement_date", nullable = false)
    private LocalDate requirementDate;

    @Column(name = "requirement_type", length = 100, nullable = false)
    private String requirementType;

    @Column(name = "feature_name", length = 255, nullable = false)
    private String featureName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "priority", length = 50, nullable = false)
    @Builder.Default
    private String priority = "Medium";

    @Column(name = "owner_id", length = 50, nullable = false)
    private String ownerId;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "In Progress";

    @Column(name = "scope_freeze", nullable = false)
    @Builder.Default
    private Boolean scopeFreeze = false;

    @Column(name = "scope_frozen_at")
    private OffsetDateTime scopeFrozenAt;

    @Column(name = "scope_frozen_by", length = 100)
    private String scopeFrozenBy;

    @Column(name = "assigned_approver", length = 100)
    @Builder.Default
    private String assignedApprover = "Admin – Akshit Ujjain";

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "completion_percentage", nullable = false)
    @Builder.Default
    private Integer completionPercentage = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

