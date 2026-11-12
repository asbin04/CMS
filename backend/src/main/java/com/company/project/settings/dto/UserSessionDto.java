package com.company.project.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSessionDto {
    private UUID id;
    private String deviceName;
    private String browser;
    private String ipAddress;
    private String location;
    private boolean current;
    private boolean active;
    private Instant createdAt;
    private Instant lastActiveAt;
}

