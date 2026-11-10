package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_uats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectUatEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "requirement_id", length = 50, nullable = false)
    private String requirementId;

    @Column(name = "test_date", nullable = false)
    private LocalDate testDate;

    @Column(name = "test_case", length = 50, nullable = false)
    private String testCase;

    @Column(name = "expected_result", columnDefinition = "TEXT", nullable = false)
    private String expectedResult;

    @Column(name = "actual_result", columnDefinition = "TEXT", nullable = false)
    private String actualResult;

    @Column(name = "tester_name", length = 100, nullable = false)
    private String testerName;

    @Column(name = "tester_initials", length = 10, nullable = false)
    private String testerInitials;

    @Column(name = "tester_color", length = 20, nullable = false)
    @Builder.Default
    private String testerColor = "indigo";

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "Passed";

    @Column(name = "defect_id", length = 50)
    private String defectId;

    @Column(name = "client_approval", length = 50, nullable = false)
    @Builder.Default
    private String clientApproval = "Pending";

    @Column(name = "approval_date")
    private LocalDate approvalDate;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

