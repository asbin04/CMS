package com.company.project.settings.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_login_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_key", nullable = false, length = 150)
    private String userKey;

    @Column(name = "event_type", nullable = false, length = 60)
    private String eventType;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "device_name", length = 150)
    private String deviceName;

    @Column(name = "browser", length = 100)
    private String browser;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "details", length = 255)
    private String details;

    @Column(name = "occurred_at", nullable = false)
    @Builder.Default
    private Instant occurredAt = Instant.now();
}

