package com.company.project.settings.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.settings.dto.*;
import com.company.project.settings.service.SettingsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SettingsController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class SettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SettingsService settingsService;

    private SettingsResponseDto sampleSettings() {
        return SettingsResponseDto.builder()
                .profile(SettingsResponseDto.ProfileDto.builder()
                        .username("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                        .displayName("Akshit Ujjain")
                        .role("CEO")
                        .department("Management")
                        .employeeId("KSS0001")
                        .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                        .phone("+91 98765 43210")
                        .jobTitle("CEO")
                        .avatarUrl("data:image/png;base64,iVBORw0KGgo=")
                        .build())
                .security(SettingsResponseDto.SecurityDto.builder()
                        .passwordChangedAt(Instant.parse("2026-08-12T10:00:00Z"))
                        .mfaEnabled(true)
                        .mfaMethod("Authenticator App")
                        .activeSessionCount(2L)
                        .lastLoginAt(Instant.parse("2026-10-12T05:54:00Z"))
                        .build())
                .notifications(SettingsResponseDto.NotificationsDto.builder()
                        .emailNotifications(true)
                        .inAppNotifications(true)
                        .taskApprovalAlerts(true)
                        .marketingUpdates(false)
                        .build())
                .appearance(SettingsResponseDto.AppearanceDto.builder()
                        .theme("light")
                        .build())
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/settings returns complete user settings payload")
    void getSettingsSuccess() throws Exception {
        when(settingsService.getCurrentSettings(any())).thenReturn(sampleSettings());

        mockMvc.perform(get("/api/v1/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.profile.displayName").value("Akshit Ujjain"))
                .andExpect(jsonPath("$.data.security.mfaEnabled").value(true))
                .andExpect(jsonPath("$.data.notifications.emailNotifications").value(true))
                .andExpect(jsonPath("$.data.appearance.theme").value("light"));
    }

    @Test
    @DisplayName("PUT endpoints update profile, notifications, and appearance with validation")
    void updateEndpointsSuccess() throws Exception {
        SettingsResponseDto updated = sampleSettings();
        updated.getAppearance().setTheme("dark");

        when(settingsService.updateProfile(any(), any())).thenReturn(updated);
        when(settingsService.updateNotifications(any())).thenReturn(updated);
        when(settingsService.updateAppearance(any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/settings/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(UpdateProfileRequest.builder()
                                .displayName("Akshit Ujjain")
                                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                                .avatarUrl("data:image/png;base64,iVBORw0KGgo=")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.profile.avatarUrl").value("data:image/png;base64,iVBORw0KGgo="));

        mockMvc.perform(put("/api/v1/settings/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(UpdateNotificationsRequest.builder()
                                .emailNotifications(true)
                                .inAppNotifications(true)
                                .taskApprovalAlerts(true)
                                .marketingUpdates(false)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(put("/api/v1/settings/appearance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(UpdateAppearanceRequest.builder()
                                .theme("dark")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.appearance.theme").value("dark"));
    }

    @Test
    @DisplayName("Sessions and login history endpoints return structured lists and support revocation")
    void sessionsAndLoginHistorySuccess() throws Exception {
        UUID sessionId = UUID.randomUUID();
        when(settingsService.getSessions(any())).thenReturn(List.of(
                UserSessionDto.builder()
                        .id(sessionId)
                        .deviceName("Windows PC")
                        .browser("Google Chrome")
                        .ipAddress("127.0.0.1")
                        .current(true)
                        .active(true)
                        .createdAt(Instant.now())
                        .lastActiveAt(Instant.now())
                        .build()
        ));
        when(settingsService.revokeSession(any(), any())).thenReturn(List.of());
        when(settingsService.getLoginHistory()).thenReturn(List.of(
                LoginHistoryItemDto.builder()
                        .id(UUID.randomUUID())
                        .eventType("LOGIN_SUCCESS")
                        .status("SUCCESS")
                        .deviceName("Windows PC")
                        .browser("Google Chrome")
                        .ipAddress("127.0.0.1")
                        .details("Signed in with password")
                        .occurredAt(Instant.now())
                        .build()
        ));

        mockMvc.perform(get("/api/v1/settings/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].browser").value("Google Chrome"));

        mockMvc.perform(post("/api/v1/settings/sessions/" + sessionId + "/revoke"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        mockMvc.perform(get("/api/v1/settings/login-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].eventType").value("LOGIN_SUCCESS"));
    }
}

