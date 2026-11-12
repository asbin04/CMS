package com.company.project.settings.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_sessions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_key", nullable = false, length = 150)
    private String userKey;

    @Column(name = "token_fingerprint", length = 128)
    private String tokenFingerprint;

    @Column(name = "device_name", nullable = false, length = 150)
    private String deviceName;

    @Column(name = "browser", nullable = false, length = 100)
    private String browser;

    @Column(name = "ip_address", nullable = false, length = 64)
    private String ipAddress;

    @Column(name = "location", length = 150)
    private String location;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "last_active_at", nullable = false)
    @Builder.Default
    private Instant lastActiveAt = Instant.now();

    @Column(name = "revoked_at")
    private Instant revokedAt;
}

