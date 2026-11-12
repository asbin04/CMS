package com.company.project.settings.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.settings.dto.*;
import com.company.project.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
@RequiredArgsConstructor
@Tag(name = "Settings API", description = "Endpoints for user profile, security settings, sessions, login history, notifications, and appearance")
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get current authenticated user's settings, profile, security, notifications, and appearance")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> getSettings(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(ApiResponse.success(
                "User settings retrieved successfully",
                settingsService.getCurrentSettings(servletRequest)
        ));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current user's profile details")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Profile updated successfully",
                settingsService.updateProfile(request, servletRequest)
        ));
    }

    @PutMapping("/password")
    @Operation(summary = "Change current user's account password")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Password changed successfully",
                settingsService.changePassword(request, servletRequest)
        ));
    }

    @PutMapping("/mfa")
    @Operation(summary = "Update Multi-Factor Authentication preference")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> updateMfa(
            @Valid @RequestBody UpdateMfaRequest request,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Multi-Factor Authentication updated successfully",
                settingsService.updateMfa(request, servletRequest)
        ));
    }

    @GetMapping("/sessions")
    @Operation(summary = "List active sessions for the current user")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> getSessions(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(ApiResponse.success(
                "Active sessions retrieved successfully",
                settingsService.getSessions(servletRequest)
        ));
    }

    @PostMapping("/sessions/{sessionId}/revoke")
    @Operation(summary = "Revoke an active session belonging to the current user")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> revokeSession(
            @PathVariable UUID sessionId,
            HttpServletRequest servletRequest
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Session revoked successfully",
                settingsService.revokeSession(sessionId, servletRequest)
        ));
    }

    @PostMapping("/sessions/revoke-others")
    @Operation(summary = "Revoke all other active sessions except the current session")
    public ResponseEntity<ApiResponse<List<UserSessionDto>>> revokeOtherSessions(HttpServletRequest servletRequest) {
        return ResponseEntity.ok(ApiResponse.success(
                "Other active sessions revoked successfully",
                settingsService.revokeOtherSessions(servletRequest)
        ));
    }

    @GetMapping("/login-history")
    @Operation(summary = "Get recent login and security event history for the current user")
    public ResponseEntity<ApiResponse<List<LoginHistoryItemDto>>> getLoginHistory() {
        return ResponseEntity.ok(ApiResponse.success(
                "Login history retrieved successfully",
                settingsService.getLoginHistory()
        ));
    }

    @PutMapping("/notifications")
    @Operation(summary = "Update notification preferences for the current user")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> updateNotifications(
            @Valid @RequestBody UpdateNotificationsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Notification preferences updated successfully",
                settingsService.updateNotifications(request)
        ));
    }

    @PutMapping("/appearance")
    @Operation(summary = "Update display theme preference for the current user")
    public ResponseEntity<ApiResponse<SettingsResponseDto>> updateAppearance(
            @Valid @RequestBody UpdateAppearanceRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Appearance preference updated successfully",
                settingsService.updateAppearance(request)
        ));
    }
}

