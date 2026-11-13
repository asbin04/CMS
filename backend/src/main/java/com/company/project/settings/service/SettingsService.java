package com.company.project.settings.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final int MAX_AVATAR_DATA_URL_LENGTH = 1_500_000;
    private static final int MAX_AVATAR_REMOTE_URL_LENGTH = 2_048;
    private static final Pattern SAFE_IMAGE_DATA_URL_PATTERN = Pattern.compile(
            "^data:image/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\\r\\n]+$",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern PHONE_WITH_COUNTRY_CODE_PATTERN = Pattern.compile(
            "^(\\+\\d{1,4})[\\s-]+([\\d\\s-]+)$"
    );
    private static final Pattern PHONE_LOCAL_ONLY_PATTERN = Pattern.compile("^[\\d\\s-]+$");

    private final UserSettingsRepository userSettingsRepository;
    private final UserSessionRepository userSessionRepository;
    private final UserLoginHistoryRepository userLoginHistoryRepository;
    private final AppUserRepository appUserRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SettingsResponseDto getCurrentSettings(HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);
        String fingerprint = extractTokenFingerprint(servletRequest);
        if (fingerprint != null) {
            ensureCurrentSession(settings.getUserKey(), fingerprint, servletRequest);
        }
        return toResponseDto(settings, ctx.appUser());
    }

    @Transactional
    public SettingsResponseDto updateProfile(UpdateProfileRequest request, HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        String trimmedName = request.getDisplayName().trim();
        settings.setDisplayName(trimmedName);

        // Email, department, and job title are locked for the logged-in account and cannot be changed via profile update.
        settings.setPhone(normalizeAndValidatePhone(request.getPhone()));
        settings.setEmployeeId(trimToNull(request.getEmployeeId()));
        if (request.getAvatarUrl() != null) {
            settings.setAvatarUrl(sanitizeAvatarUrl(request.getAvatarUrl()));
        }

        UserSettingsEntity saved = userSettingsRepository.save(settings);

        if (ctx.appUser() != null) {
            AppUser appUser = ctx.appUser();
            appUser.setDisplayName(trimmedName);
            appUserRepository.save(appUser);
        }

        recordEvent(
                saved.getUserKey(),
                "PROFILE_UPDATED",
                "SUCCESS",
                servletRequest,
                "Updated profile details"
        );

        return toResponseDto(saved, ctx.appUser());
    }

    @Transactional
    public SettingsResponseDto changePassword(ChangePasswordRequest request, HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessValidationException("New password and confirmation password do not match.");
        }
        if (request.getNewPassword().equals(request.getCurrentPassword())) {
            throw new BusinessValidationException("New password must be different from your current password.");
        }

        AppUser appUser = ctx.appUser();
        if (appUser == null) {
            throw new BusinessValidationException("Password management is unavailable for this account.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), appUser.getPasswordHash())) {
            recordEvent(
                    settings.getUserKey(),
                    "PASSWORD_CHANGE_FAILED",
                    "FAILED",
                    servletRequest,
                    "Incorrect current password provided"
            );
            throw new BusinessValidationException("Current password is incorrect.");
        }

        appUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        appUser.setPasswordChangedAt(Instant.now());
        AppUser savedUser = appUserRepository.save(appUser);

        recordEvent(
                settings.getUserKey(),
                "PASSWORD_CHANGED",
                "SUCCESS",
                servletRequest,
                "Account password changed successfully"
        );

        return toResponseDto(settings, savedUser);
    }

    @Transactional
    public SettingsResponseDto updateMfa(UpdateMfaRequest request, HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        boolean enabled = Boolean.TRUE.equals(request.getEnabled());
        settings.setMfaEnabled(enabled);
        if (request.getMethod() != null && !request.getMethod().isBlank()) {
            settings.setMfaMethod(request.getMethod().trim());
        } else if (settings.getMfaMethod() == null || settings.getMfaMethod().isBlank()) {
            settings.setMfaMethod("Authenticator App");
        }
        settings.setMfaUpdatedAt(Instant.now());

        UserSettingsEntity saved = userSettingsRepository.save(settings);

        recordEvent(
                saved.getUserKey(),
                enabled ? "MFA_ENABLED" : "MFA_DISABLED",
                "SUCCESS",
                servletRequest,
                enabled ? ("Enabled MFA (" + saved.getMfaMethod() + ")") : "Disabled Multi-Factor Authentication"
        );

        return toResponseDto(saved, ctx.appUser());
    }

    @Transactional
    public List<UserSessionDto> getSessions(HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);
        String currentFingerprint = extractTokenFingerprint(servletRequest);
        if (currentFingerprint != null) {
            ensureCurrentSession(settings.getUserKey(), currentFingerprint, servletRequest);
        }

        return userSessionRepository.findByUserKeyIgnoreCaseOrderByLastActiveAtDesc(settings.getUserKey())
                .stream()
                .filter(UserSessionEntity::isActive)
                .map(session -> UserSessionDto.builder()
                        .id(session.getId())
                        .deviceName(session.getDeviceName())
                        .browser(session.getBrowser())
                        .ipAddress(session.getIpAddress())
                        .location(session.getLocation())
                        .current(currentFingerprint != null && currentFingerprint.equals(session.getTokenFingerprint()))
                        .active(session.isActive())
                        .createdAt(session.getCreatedAt())
                        .lastActiveAt(session.getLastActiveAt())
                        .build())
                .toList();
    }

    @Transactional
    public List<UserSessionDto> revokeSession(UUID sessionId, HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        UserSessionEntity session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!settings.getUserKey().equalsIgnoreCase(session.getUserKey())) {
            throw new AccessDeniedException("You cannot revoke another user's session");
        }

        if (session.isActive()) {
            session.setActive(false);
            session.setRevokedAt(Instant.now());
            userSessionRepository.save(session);
            recordEvent(
                    settings.getUserKey(),
                    "SESSION_REVOKED",
                    "INFO",
                    servletRequest,
                    "Revoked session on " + session.getDeviceName() + " (" + session.getBrowser() + ")"
            );
        }

        return getSessions(servletRequest);
    }

    @Transactional
    public List<UserSessionDto> revokeOtherSessions(HttpServletRequest servletRequest) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);
        String currentFingerprint = extractTokenFingerprint(servletRequest);

        List<UserSessionEntity> activeSessions = userSessionRepository
                .findByUserKeyIgnoreCaseAndActiveTrueOrderByLastActiveAtDesc(settings.getUserKey());

        int revokedCount = 0;
        for (UserSessionEntity session : activeSessions) {
            boolean isCurrent = currentFingerprint != null && currentFingerprint.equals(session.getTokenFingerprint());
            if (!isCurrent) {
                session.setActive(false);
                session.setRevokedAt(Instant.now());
                userSessionRepository.save(session);
                revokedCount++;
            }
        }

        if (revokedCount > 0) {
            recordEvent(
                    settings.getUserKey(),
                    "SESSIONS_REVOKED_ALL",
                    "INFO",
                    servletRequest,
                    "Signed out " + revokedCount + " other active session(s)"
            );
        }

        return getSessions(servletRequest);
    }

    @Transactional(readOnly = true)
    public List<LoginHistoryItemDto> getLoginHistory() {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = findExistingSettings(ctx)
                .orElseGet(() -> buildDefaultSettingsEntity(ctx));

        return userLoginHistoryRepository.findTop25ByUserKeyIgnoreCaseOrderByOccurredAtDesc(settings.getUserKey())
                .stream()
                .map(item -> LoginHistoryItemDto.builder()
                        .id(item.getId())
                        .eventType(item.getEventType())
                        .status(item.getStatus())
                        .deviceName(item.getDeviceName())
                        .browser(item.getBrowser())
                        .ipAddress(item.getIpAddress())
                        .details(item.getDetails())
                        .occurredAt(item.getOccurredAt())
                        .build())
                .toList();
    }

    @Transactional
    public SettingsResponseDto updateNotifications(UpdateNotificationsRequest request) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        settings.setEmailNotifications(Boolean.TRUE.equals(request.getEmailNotifications()));
        settings.setInAppNotifications(Boolean.TRUE.equals(request.getInAppNotifications()));
        settings.setTaskApprovalAlerts(Boolean.TRUE.equals(request.getTaskApprovalAlerts()));
        settings.setMarketingUpdates(Boolean.TRUE.equals(request.getMarketingUpdates()));

        UserSettingsEntity saved = userSettingsRepository.save(settings);
        return toResponseDto(saved, ctx.appUser());
    }

    @Transactional
    public SettingsResponseDto updateAppearance(UpdateAppearanceRequest request) {
        AuthenticatedUserContext ctx = resolveCurrentUserContext();
        UserSettingsEntity settings = getOrCreateSettings(ctx);

        String normalizedTheme = request.getTheme().trim().toLowerCase(Locale.ROOT);
        if (!List.of("light", "dark", "system").contains(normalizedTheme)) {
            throw new BusinessValidationException("Theme must be light, dark, or system.");
        }
        settings.setTheme(normalizedTheme);

        UserSettingsEntity saved = userSettingsRepository.save(settings);
        return toResponseDto(saved, ctx.appUser());
    }

    @Transactional
    public void recordLoginSuccess(String usernameOrEmail, String jwtToken, HttpServletRequest servletRequest) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return;
        }
        String normalized = usernameOrEmail.trim().toLowerCase(Locale.ROOT);
        String userKey = resolveCanonicalUserKey(normalized);
        String fingerprint = sha256Hex(jwtToken);

        UserAgentInfo ua = parseUserAgent(servletRequest);
        String ipAddress = extractClientIp(servletRequest);
        Instant now = Instant.now();

        if (fingerprint != null) {
            UserSessionEntity session = UserSessionEntity.builder()
                    .userKey(userKey)
                    .tokenFingerprint(fingerprint)
                    .deviceName(ua.deviceName())
                    .browser(ua.browser())
                    .ipAddress(ipAddress)
                    .location("Internal Network")
                    .active(true)
                    .createdAt(now)
                    .lastActiveAt(now)
                    .build();
            userSessionRepository.save(session);
        }

        userLoginHistoryRepository.save(UserLoginHistoryEntity.builder()
                .userKey(userKey)
                .eventType("LOGIN_SUCCESS")
                .status("SUCCESS")
                .deviceName(ua.deviceName())
                .browser(ua.browser())
                .ipAddress(ipAddress)
                .details("Signed in with password")
                .occurredAt(now)
                .build());
    }

    @Transactional
    public void recordLoginFailure(String usernameOrEmail, HttpServletRequest servletRequest, String reason) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) {
            return;
        }
        String userKey = resolveCanonicalUserKey(usernameOrEmail.trim().toLowerCase(Locale.ROOT));
        recordEvent(userKey, "LOGIN_FAILED", "FAILED", servletRequest, reason);
    }

    private String resolveCanonicalUserKey(String normalizedPrincipal) {
        Optional<AppUser> appUserOpt = appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(
                normalizedPrincipal, normalizedPrincipal
        );
        if (appUserOpt.isPresent()) {
            return appUserOpt.get().getUsername().trim().toLowerCase(Locale.ROOT);
        }
        return normalizedPrincipal;
    }

    private void ensureCurrentSession(String userKey, String fingerprint, HttpServletRequest servletRequest) {
        Optional<UserSessionEntity> existing = userSessionRepository.findByTokenFingerprint(fingerprint);
        if (existing.isPresent()) {
            UserSessionEntity session = existing.get();
            if (session.isActive()) {
                session.setLastActiveAt(Instant.now());
                userSessionRepository.save(session);
            }
            return;
        }

        UserAgentInfo ua = parseUserAgent(servletRequest);
        String ipAddress = extractClientIp(servletRequest);
        Instant now = Instant.now();

        UserSessionEntity session = UserSessionEntity.builder()
                .userKey(userKey)
                .tokenFingerprint(fingerprint)
                .deviceName(ua.deviceName())
                .browser(ua.browser())
                .ipAddress(ipAddress)
                .location("Current Workspace Session")
                .active(true)
                .createdAt(now)
                .lastActiveAt(now)
                .build();
        userSessionRepository.save(session);
    }

    private void recordEvent(
            String userKey,
            String eventType,
            String status,
            HttpServletRequest servletRequest,
            String details
    ) {
        UserAgentInfo ua = parseUserAgent(servletRequest);
        String ipAddress = extractClientIp(servletRequest);
        userLoginHistoryRepository.save(UserLoginHistoryEntity.builder()
                .userKey(userKey)
                .eventType(eventType)
                .status(status)
                .deviceName(ua.deviceName())
                .browser(ua.browser())
                .ipAddress(ipAddress)
                .details(details)
                .occurredAt(Instant.now())
                .build());
    }

    private AuthenticatedUserContext resolveCurrentUserContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Authentication is required");
        }

        String rawPrincipal = auth.getName();
        String normalizedPrincipal = rawPrincipal.trim().toLowerCase(Locale.ROOT);
        String authorityRole = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst()
                .orElse("ADMIN");

        AppUser appUser = appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(rawPrincipal.trim(), rawPrincipal.trim())
                .orElse(null);

        String canonicalKey = appUser != null
                ? appUser.getUsername().trim().toLowerCase(Locale.ROOT)
                : normalizedPrincipal;
        String email = appUser != null
                ? appUser.getEmail().trim().toLowerCase(Locale.ROOT)
                : (normalizedPrincipal.contains("@") ? normalizedPrincipal : normalizedPrincipal + "@kalpanaaa.in");
        String displayName = appUser != null && appUser.getDisplayName() != null && !appUser.getDisplayName().isBlank()
                ? appUser.getDisplayName()
                : formatDisplayNameFallback(rawPrincipal);
        String role = appUser != null && appUser.getRole() != null && !appUser.getRole().isBlank()
                ? appUser.getRole()
                : authorityRole;

        return new AuthenticatedUserContext(canonicalKey, rawPrincipal, displayName, role, email, appUser);
    }

    private Optional<UserSettingsEntity> findExistingSettings(AuthenticatedUserContext ctx) {
        Optional<UserSettingsEntity> byKey = userSettingsRepository.findByUserKeyIgnoreCase(ctx.canonicalKey());
        if (byKey.isPresent()) {
            return byKey;
        }
        return userSettingsRepository.findByEmailIgnoreCase(ctx.email());
    }

    private UserSettingsEntity getOrCreateSettings(AuthenticatedUserContext ctx) {
        return findExistingSettings(ctx).orElseGet(() -> userSettingsRepository.save(buildDefaultSettingsEntity(ctx)));
    }

    private UserSettingsEntity buildDefaultSettingsEntity(AuthenticatedUserContext ctx) {
        EmployeeEntity employee = employeeRepository.findByWorkEmail(ctx.email()).orElse(null);

        String department = employee != null && trimToNull(employee.getDepartment()) != null
                ? trimToNull(employee.getDepartment())
                : ctx.role();
        String employeeId = employee != null ? trimToNull(employee.getEmployeeId()) : null;
        String phone = employee != null ? trimToNull(employee.getPhone()) : null;
        String jobTitle = employee != null && trimToNull(employee.getDesignation()) != null
                ? trimToNull(employee.getDesignation())
                : ctx.role();

        return UserSettingsEntity.builder()
                .userKey(ctx.canonicalKey())
                .userId(ctx.appUser() != null ? ctx.appUser().getId() : null)
                .displayName(ctx.displayName())
                .roleLabel(ctx.role())
                .department(department)
                .employeeId(employeeId)
                .email(ctx.email())
                .phone(phone)
                .jobTitle(jobTitle)
                .mfaEnabled(false)
                .mfaMethod("Authenticator App")
                .emailNotifications(true)
                .inAppNotifications(true)
                .taskApprovalAlerts(true)
                .marketingUpdates(false)
                .theme("light")
                .build();
    }

    private SettingsResponseDto toResponseDto(UserSettingsEntity settings, AppUser appUser) {
        long activeSessions = userSessionRepository.countByUserKeyIgnoreCaseAndActiveTrue(settings.getUserKey());
        Instant lastLoginAt = userLoginHistoryRepository
                .findTop1ByUserKeyIgnoreCaseAndEventTypeOrderByOccurredAtDesc(settings.getUserKey(), "LOGIN_SUCCESS")
                .map(UserLoginHistoryEntity::getOccurredAt)
                .orElse(null);

        Instant passwordChangedAt = appUser != null ? appUser.getPasswordChangedAt() : null;

        return SettingsResponseDto.builder()
                .profile(SettingsResponseDto.ProfileDto.builder()
                        .username(settings.getUserKey())
                        .displayName(settings.getDisplayName())
                        .role(settings.getRoleLabel())
                        .department(trimToNull(settings.getDepartment()) != null
                                ? settings.getDepartment()
                                : (trimToNull(settings.getRoleLabel()) != null ? settings.getRoleLabel() : "ADMIN"))
                        .employeeId(settings.getEmployeeId())
                        .email(settings.getEmail())
                        .phone(settings.getPhone())
                        .jobTitle(settings.getJobTitle())
                        .avatarUrl(settings.getAvatarUrl())
                        .build())
                .security(SettingsResponseDto.SecurityDto.builder()
                        .passwordChangedAt(passwordChangedAt)
                        .mfaEnabled(settings.isMfaEnabled())
                        .mfaMethod(settings.getMfaMethod())
                        .activeSessionCount(activeSessions)
                        .lastLoginAt(lastLoginAt)
                        .build())
                .notifications(SettingsResponseDto.NotificationsDto.builder()
                        .emailNotifications(settings.isEmailNotifications())
                        .inAppNotifications(settings.isInAppNotifications())
                        .taskApprovalAlerts(settings.isTaskApprovalAlerts())
                        .marketingUpdates(settings.isMarketingUpdates())
                        .build())
                .appearance(SettingsResponseDto.AppearanceDto.builder()
                        .theme(settings.getTheme())
                        .build())
                .build();
    }

    private String formatDisplayNameFallback(String principal) {
        if (principal == null || principal.isBlank()) {
            return "User";
        }
        String lower = principal.trim().toLowerCase(Locale.ROOT);
        if (lower.contains("akshit")) {
            return "Akshit Ujjain";
        }
        if (lower.contains("founder") || lower.contains("gaurav")) {
            return "Gaurav Kumar Tripathi";
        }
        if (lower.contains("asbin")) {
            return "Asbin T S";
        }
        String cleanName = principal.contains("@") ? principal.split("@")[0] : principal;
        String[] parts = cleanName.split("[._-]");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isEmpty()) {
                if (sb.length() > 0) sb.append(" ");
                sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1).toLowerCase(Locale.ROOT));
            }
        }
        return sb.length() > 0 ? sb.toString() : cleanName;
    }

    private String extractTokenFingerprint(HttpServletRequest servletRequest) {
        if (servletRequest == null) {
            return null;
        }
        String bearer = servletRequest.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            String raw = bearer.substring(7).trim();
            if (!raw.isEmpty()) {
                return sha256Hex(raw);
            }
        }
        return null;
    }

    private String sha256Hex(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(value.hashCode());
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "127.0.0.1";
    }

    private UserAgentInfo parseUserAgent(HttpServletRequest request) {
        String ua = request != null ? request.getHeader("User-Agent") : null;
        if (ua == null || ua.isBlank()) {
            return new UserAgentInfo("Workspace Browser", "HTTP Client");
        }
        String lower = ua.toLowerCase(Locale.ROOT);
        String device;
        if (lower.contains("windows")) {
            device = "Windows PC";
        } else if (lower.contains("mac os") || lower.contains("macintosh")) {
            device = "Mac Workstation";
        } else if (lower.contains("iphone") || lower.contains("android")) {
            device = "Mobile Device";
        } else if (lower.contains("linux")) {
            device = "Linux Workstation";
        } else {
            device = "Desktop Browser";
        }

        String browser;
        if (lower.contains("edg/")) {
            browser = "Microsoft Edge";
        } else if (lower.contains("chrome/") && !lower.contains("edg/")) {
            browser = "Google Chrome";
        } else if (lower.contains("firefox/")) {
            browser = "Mozilla Firefox";
        } else if (lower.contains("safari/") && !lower.contains("chrome/")) {
            browser = "Safari";
        } else {
            browser = "Web Browser";
        }
        return new UserAgentInfo(device, browser);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    /**
     * Validates that an optional phone string contains only an optional +<countryCode> and exactly 10 local digits.
     */
    private String normalizeAndValidatePhone(String raw) {
        String trimmed = trimToNull(raw);
        if (trimmed == null) {
            return null;
        }
        String localDigits;
        if (trimmed.startsWith("+")) {
            var matcher = PHONE_WITH_COUNTRY_CODE_PATTERN.matcher(trimmed);
            if (!matcher.matches()) {
                throw new BusinessValidationException("Phone number must include a country code followed by a 10-digit number.");
            }
            localDigits = matcher.group(2).replaceAll("[\\s-]+", "");
        } else {
            if (!PHONE_LOCAL_ONLY_PATTERN.matcher(trimmed).matches()) {
                throw new BusinessValidationException("Phone number must contain digits only.");
            }
            localDigits = trimmed.replaceAll("[\\s-]+", "");
        }
        if (localDigits.length() != 10) {
            throw new BusinessValidationException("Phone number must be exactly 10 digits.");
        }
        return trimmed;
    }

    /**
     * Validates and normalizes user profile image URLs/data URLs, rejecting unsafe schemes such as SVG or javascript:.
     */
    private String sanitizeAvatarUrl(String raw) {
        String trimmed = raw.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.regionMatches(true, 0, "data:", 0, 5)) {
            if (trimmed.length() > MAX_AVATAR_DATA_URL_LENGTH) {
                throw new BusinessValidationException("Profile picture is too large. Please upload an image under 1 MB.");
            }
            if (!SAFE_IMAGE_DATA_URL_PATTERN.matcher(trimmed).matches()) {
                throw new BusinessValidationException("Unsupported profile picture format. Please upload a PNG, JPG, WEBP, or GIF image.");
            }
            return trimmed.replaceAll("[\\r\\n]+", "");
        }
        if (trimmed.startsWith("/") || trimmed.regionMatches(true, 0, "https://", 0, 8)
                || trimmed.regionMatches(true, 0, "http://", 0, 7)) {
            if (trimmed.length() > MAX_AVATAR_REMOTE_URL_LENGTH) {
                throw new BusinessValidationException("Profile picture URL cannot exceed 2048 characters.");
            }
            return trimmed;
        }
        throw new BusinessValidationException("Unsupported profile picture URL.");
    }

    private record AuthenticatedUserContext(
            String canonicalKey,
            String rawPrincipal,
            String displayName,
            String role,
            String email,
            AppUser appUser
    ) {}

    private record UserAgentInfo(String deviceName, String browser) {}
}

