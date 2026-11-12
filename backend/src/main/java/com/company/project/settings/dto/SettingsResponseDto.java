package com.company.project.settings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponseDto {

    private ProfileDto profile;
    private SecurityDto security;
    private NotificationsDto notifications;
    private AppearanceDto appearance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDto {
        private String username;
        private String displayName;
        private String role;
        private String department;
        private String employeeId;
        private String email;
        private String phone;
        private String jobTitle;
        private String avatarUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityDto {
        private Instant passwordChangedAt;
        private boolean mfaEnabled;
        private String mfaMethod;
        private long activeSessionCount;
        private Instant lastLoginAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationsDto {
        private boolean emailNotifications;
        private boolean inAppNotifications;
        private boolean taskApprovalAlerts;
        private boolean marketingUpdates;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppearanceDto {
        private String theme;
    }
}

