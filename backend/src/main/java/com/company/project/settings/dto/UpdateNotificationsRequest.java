package com.company.project.settings.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationsRequest {

    @NotNull(message = "emailNotifications is required")
    private Boolean emailNotifications;

    @NotNull(message = "inAppNotifications is required")
    private Boolean inAppNotifications;

    @NotNull(message = "taskApprovalAlerts is required")
    private Boolean taskApprovalAlerts;

    @NotNull(message = "marketingUpdates is required")
    private Boolean marketingUpdates;
}

