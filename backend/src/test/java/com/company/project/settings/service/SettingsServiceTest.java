package com.company.project.settings.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.hr.entity.EmployeeEntity;
import com.company.project.hr.repository.EmployeeRepository;
import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import com.company.project.settings.dto.*;
import com.company.project.settings.entity.UserLoginHistoryEntity;
import com.company.project.settings.entity.UserSessionEntity;
import com.company.project.settings.entity.UserSettingsEntity;
import com.company.project.settings.repository.UserLoginHistoryRepository;
import com.company.project.settings.repository.UserSessionRepository;
import com.company.project.settings.repository.UserSettingsRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SettingsServiceTest {

    @Mock
    private UserSettingsRepository userSettingsRepository;

    @Mock
    private UserSessionRepository userSessionRepository;

    @Mock
    private UserLoginHistoryRepository userLoginHistoryRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private HttpServletRequest servletRequest;

    @InjectMocks
    private SettingsService settingsService;

    private AppUser appUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        appUser = AppUser.builder()
                .id(userId)
                .username("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .displayName("Akshit Ujjain")
                .role("ADMIN")
                .status("ACTIVE")
                .passwordHash("$2a$10$hashed")
                .passwordChangedAt(Instant.parse("2026-08-12T10:00:00Z"))
                .build();

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "akshit.ujjain@kalpanaaasoftwaresolutions.in",
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
                )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Lazily initializes settings from AppUser and linked EmployeeEntity on first fetch")
    void getCurrentSettingsInitializesFromDb() {
        EmployeeEntity employee = EmployeeEntity.builder()
                .employeeId("KSS0001")
                .workEmail("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .phone("+91 98765 43210")
                .department("Management")
                .designation("CEO")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.empty());
        when(userSettingsRepository.findByEmailIgnoreCase(any())).thenReturn(Optional.empty());
        when(employeeRepository.findByWorkEmail("akshit.ujjain@kalpanaaasoftwaresolutions.in"))
                .thenReturn(Optional.of(employee));
        when(userSettingsRepository.save(any(UserSettingsEntity.class)))
                .thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getHeader("Authorization")).thenReturn("Bearer sample-jwt-token");
        when(servletRequest.getHeader("User-Agent")).thenReturn("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0");
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(userSessionRepository.findByTokenFingerprint(any())).thenReturn(Optional.empty());
        when(userSessionRepository.countByUserKeyIgnoreCaseAndActiveTrue(any())).thenReturn(1L);
        when(userLoginHistoryRepository.findTop1ByUserKeyIgnoreCaseAndEventTypeOrderByOccurredAtDesc(any(), any()))
                .thenReturn(Optional.of(UserLoginHistoryEntity.builder()
                        .occurredAt(Instant.parse("2026-10-12T05:54:00Z"))
                        .build()));

        SettingsResponseDto response = settingsService.getCurrentSettings(servletRequest);

        assertThat(response.getProfile().getDisplayName()).isEqualTo("Akshit Ujjain");
        assertThat(response.getProfile().getEmployeeId()).isEqualTo("KSS0001");
        assertThat(response.getProfile().getDepartment()).isEqualTo("Management");
        assertThat(response.getProfile().getPhone()).isEqualTo("+91 98765 43210");
        assertThat(response.getProfile().getJobTitle()).isEqualTo("CEO");
        assertThat(response.getSecurity().getActiveSessionCount()).isEqualTo(1L);
        assertThat(response.getAppearance().getTheme()).isEqualTo("light");
        verify(userSessionRepository).save(any(UserSessionEntity.class));
    }

    @Test
    @DisplayName("updateProfile persists fields and syncs AppUser displayName")
    void updateProfilePersistsAndSyncsAppUser() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .userId(userId)
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .department("Admin")
                .jobTitle("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(userSettingsRepository.save(any(UserSettingsEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .displayName("Akshit Ujjain")
                .email("other.email@kalpanaaasoftwaresolutions.in")
                .phone("+91 99999 88888")
                .department("Executive Management")
                .employeeId("KSS0001")
                .jobTitle("Chief Executive Officer")
                .build();

        SettingsResponseDto result = settingsService.updateProfile(request, servletRequest);

        assertThat(result.getProfile().getEmail()).isEqualTo("akshit.ujjain@kalpanaaasoftwaresolutions.in");
        assertThat(result.getProfile().getDepartment()).isEqualTo("Admin");
        assertThat(result.getProfile().getPhone()).isEqualTo("+91 99999 88888");
        assertThat(result.getProfile().getJobTitle()).isEqualTo("ADMIN");
        verify(appUserRepository).save(appUser);
        verify(userLoginHistoryRepository).save(any(UserLoginHistoryEntity.class));
    }

    @Test
    @DisplayName("changePassword rejects wrong current password and updates hash on valid request")
    void changePasswordValidationAndSuccess() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("WrongPass123", "$2a$10$hashed")).thenReturn(false);
        when(passwordEncoder.matches("Admin123", "$2a$10$hashed")).thenReturn(true);
        when(passwordEncoder.encode("NewStrongPass#2026")).thenReturn("$2a$10$newHashed");
        when(appUserRepository.save(any(AppUser.class))).thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        ChangePasswordRequest wrongCurrent = ChangePasswordRequest.builder()
                .currentPassword("WrongPass123")
                .newPassword("NewStrongPass#2026")
                .confirmPassword("NewStrongPass#2026")
                .build();

        assertThatThrownBy(() -> settingsService.changePassword(wrongCurrent, servletRequest))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Current password is incorrect");

        ChangePasswordRequest validReq = ChangePasswordRequest.builder()
                .currentPassword("Admin123")
                .newPassword("NewStrongPass#2026")
                .confirmPassword("NewStrongPass#2026")
                .build();

        SettingsResponseDto res = settingsService.changePassword(validReq, servletRequest);

        assertThat(res.getSecurity().getPasswordChangedAt()).isAfter(Instant.parse("2026-08-12T10:00:00Z"));
        verify(appUserRepository).save(appUser);
    }

    @Test
    @DisplayName("revokeSession prevents cross-user revocation and revokes own session")
    void revokeSessionSecurityBoundary() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .build();

        UUID foreignId = UUID.randomUUID();
        UserSessionEntity foreignSession = UserSessionEntity.builder()
                .id(foreignId)
                .userKey("other.user@kalpanaaa.in")
                .active(true)
                .build();

        UUID ownId = UUID.randomUUID();
        UserSessionEntity ownSession = UserSessionEntity.builder()
                .id(ownId)
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .deviceName("Windows PC")
                .browser("Google Chrome")
                .ipAddress("127.0.0.1")
                .active(true)
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(userSessionRepository.findById(foreignId)).thenReturn(Optional.of(foreignSession));
        when(userSessionRepository.findById(ownId)).thenReturn(Optional.of(ownSession));
        when(userSessionRepository.findByUserKeyIgnoreCaseOrderByLastActiveAtDesc(any())).thenReturn(List.of());
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        assertThatThrownBy(() -> settingsService.revokeSession(foreignId, servletRequest))
                .isInstanceOf(AccessDeniedException.class);

        List<UserSessionDto> remaining = settingsService.revokeSession(ownId, servletRequest);

        assertThat(ownSession.isActive()).isFalse();
        assertThat(ownSession.getRevokedAt()).isNotNull();
        assertThat(remaining).isEmpty();
    }

    @Test
    @DisplayName("updateMfa, updateNotifications, and updateAppearance persist settings")
    void updatePreferencesAndMfa() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .theme("light")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(userSettingsRepository.save(any(UserSettingsEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        SettingsResponseDto mfaUpdated = settingsService.updateMfa(
                UpdateMfaRequest.builder().enabled(true).method("Authenticator App").build(),
                servletRequest
        );
        assertThat(mfaUpdated.getSecurity().isMfaEnabled()).isTrue();

        SettingsResponseDto notifUpdated = settingsService.updateNotifications(
                UpdateNotificationsRequest.builder()
                        .emailNotifications(true)
                        .inAppNotifications(false)
                        .taskApprovalAlerts(true)
                        .marketingUpdates(true)
                        .build()
        );
        assertThat(notifUpdated.getNotifications().isInAppNotifications()).isFalse();
        assertThat(notifUpdated.getNotifications().isMarketingUpdates()).isTrue();

        SettingsResponseDto themeUpdated = settingsService.updateAppearance(
                UpdateAppearanceRequest.builder().theme("dark").build()
        );
        assertThat(themeUpdated.getAppearance().getTheme()).isEqualTo("dark");
    }

    @Test
    @DisplayName("updateProfile persists valid avatar image, preserves when omitted, clears when blank, and rejects unsafe formats")
    void updateProfileAvatarLifecycleAndSecurity() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .userId(userId)
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(userSettingsRepository.save(any(UserSettingsEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        String validPngDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
        SettingsResponseDto saved = settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .avatarUrl(validPngDataUrl)
                        .build(),
                servletRequest
        );
        assertThat(saved.getProfile().getAvatarUrl()).isEqualTo(validPngDataUrl);

        // Omitted avatarUrl (null) preserves existing avatar
        SettingsResponseDto preserved = settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .avatarUrl(null)
                        .build(),
                servletRequest
        );
        assertThat(preserved.getProfile().getAvatarUrl()).isEqualTo(validPngDataUrl);

        // Reject unsafe SVG data URL and javascript URI
        assertThatThrownBy(() -> settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .avatarUrl("data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=")
                        .build(),
                servletRequest
        )).isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Unsupported profile picture format");

        assertThatThrownBy(() -> settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .avatarUrl("javascript:alert(1)")
                        .build(),
                servletRequest
        )).isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Unsupported profile picture URL");

        // Blank string clears avatar
        SettingsResponseDto cleared = settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .avatarUrl("")
                        .build(),
                servletRequest
        );
        assertThat(cleared.getProfile().getAvatarUrl()).isNull();
    }

    @Test
    @DisplayName("updateProfile accepts 10-digit phone numbers with country code and rejects invalid phone formats")
    void updateProfilePhoneValidation() {
        UserSettingsEntity existing = UserSettingsEntity.builder()
                .userKey("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .userId(userId)
                .displayName("Akshit Ujjain")
                .roleLabel("ADMIN")
                .email("akshit.ujjain@kalpanaaasoftwaresolutions.in")
                .build();

        when(appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(any(), any()))
                .thenReturn(Optional.of(appUser));
        when(userSettingsRepository.findByUserKeyIgnoreCase(any())).thenReturn(Optional.of(existing));
        when(userSettingsRepository.save(any(UserSettingsEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(servletRequest.getRemoteAddr()).thenReturn("127.0.0.1");

        SettingsResponseDto savedUs = settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .phone("+1 4155551234")
                        .build(),
                servletRequest
        );
        assertThat(savedUs.getProfile().getPhone()).isEqualTo("+1 4155551234");

        SettingsResponseDto cleared = settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .phone("")
                        .build(),
                servletRequest
        );
        assertThat(cleared.getProfile().getPhone()).isNull();

        assertThatThrownBy(() -> settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .phone("+91 12345")
                        .build(),
                servletRequest
        )).isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("10 digits");

        assertThatThrownBy(() -> settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .phone("abc1234567")
                        .build(),
                servletRequest
        )).isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("digits only");

        assertThatThrownBy(() -> settingsService.updateProfile(
                UpdateProfileRequest.builder()
                        .displayName("Akshit Ujjain")
                        .phone("12345678901")
                        .build(),
                servletRequest
        )).isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("10 digits");
    }
}

