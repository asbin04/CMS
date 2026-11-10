package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "uiux_designs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UiuxDesignEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "requirement_id", length = 50, nullable = false)
    private String requirementId;

    @Column(name = "screen_feature", length = 255, nullable = false)
    private String screenFeature;

    @Column(name = "design_type", length = 50, nullable = false)
    @Builder.Default
    private String designType = "UI Design";

    @Column(name = "version", length = 50, nullable = false)
    @Builder.Default
    private String version = "v1.0";

    @Column(name = "designer", length = 100, nullable = false)
    private String designer;

    @Column(name = "designer_initials", length = 10, nullable = false)
    private String designerInitials;

    @Column(name = "tool", length = 50, nullable = false)
    @Builder.Default
    private String tool = "Figma";

    @Column(name = "prototype_url", length = 500)
    private String prototypeUrl;

    @Column(name = "client_feedback", length = 500)
    private String clientFeedback;

    @Column(name = "feedback_date")
    private LocalDate feedbackDate;

    @Column(name = "approval_status", length = 50, nullable = false)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "change_request", length = 50)
    private String changeRequest;

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "In Progress";

    @Column(name = "notes", length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

