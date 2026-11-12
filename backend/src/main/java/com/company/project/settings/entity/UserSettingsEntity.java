package com.company.project.settings.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_key", nullable = false, unique = true, length = 150)
    private String userKey;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "role_label", nullable = false, length = 50)
    @Builder.Default
    private String roleLabel = "ADMIN";

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "job_title", length = 100)
    private String jobTitle;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "mfa_enabled", nullable = false)
    @Builder.Default
    private boolean mfaEnabled = false;

    @Column(name = "mfa_method", nullable = false, length = 50)
    @Builder.Default
    private String mfaMethod = "Authenticator App";

    @Column(name = "mfa_updated_at")
    private Instant mfaUpdatedAt;

    @Column(name = "email_notifications", nullable = false)
    @Builder.Default
    private boolean emailNotifications = true;

    @Column(name = "in_app_notifications", nullable = false)
    @Builder.Default
    private boolean inAppNotifications = true;

    @Column(name = "task_approval_alerts", nullable = false)
    @Builder.Default
    private boolean taskApprovalAlerts = true;

    @Column(name = "marketing_updates", nullable = false)
    @Builder.Default
    private boolean marketingUpdates = false;

    @Column(name = "theme", nullable = false, length = 20)
    @Builder.Default
    private String theme = "light";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

