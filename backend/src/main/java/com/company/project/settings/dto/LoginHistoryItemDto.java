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
public class LoginHistoryItemDto {
    private UUID id;
    private String eventType;
    private String status;
    private String deviceName;
    private String browser;
    private String ipAddress;
    private String details;
    private Instant occurredAt;
}

