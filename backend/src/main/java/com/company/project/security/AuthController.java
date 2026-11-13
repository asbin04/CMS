package com.company.project.security;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.response.ApiResponse;
import com.company.project.security.dto.*;
import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import com.company.project.security.service.AdminAllowlistService;
import com.company.project.security.service.PasswordResetService;
import com.company.project.settings.service.SettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping({ "/api/v1/auth", "/api/auth" })
@Tag(name = "Authentication API", description = "Endpoints for administrator authentication, password reset, and session verification")
public class AuthController {

    private static final String INVALID_CREDENTIALS_MSG = "Invalid credentials";
    private static final String ADMIN_RESTRICTED_MSG = "Access restricted to administrators";

    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final LoginRateLimiter rateLimiter;
    private final AppUserRepository userRepository;
    private final PasswordResetService passwordResetService;
    private final AdminAllowlistService allowlistService;
    private final SettingsService settingsService;

    @Autowired
    public AuthController(
            JwtTokenProvider tokenProvider,
            PasswordEncoder passwordEncoder,
            LoginRateLimiter rateLimiter,
            AppUserRepository userRepository,
            PasswordResetService passwordResetService,
            AdminAllowlistService allowlistService,
            @Nullable SettingsService settingsService) {
        this.tokenProvider = tokenProvider;
        this.passwordEncoder = passwordEncoder;
        this.rateLimiter = rateLimiter;
        this.userRepository = userRepository;
        this.passwordResetService = passwordResetService;
        this.allowlistService = allowlistService;
        this.settingsService = settingsService;
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String xForwarded = request.getHeader("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "unknown";
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        @jakarta.validation.constraints.NotBlank(message = "Username is required")
        @jakarta.validation.constraints.Size(max = 100, message = "Username cannot exceed 100 characters")
        private String username;

        @jakarta.validation.constraints.NotBlank(message = "Password is required")
        @jakarta.validation.constraints.Size(max = 255, message = "Password cannot exceed 255 characters")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginResponse {
        private String token;
        private String username;
        private String role;
        private String name;
        private String email;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate administrator and return JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody(required = false) LoginRequest request,
            HttpServletRequest servletRequest) {
        String username = request != null ? request.getUsername() : null;
        String password = request != null ? request.getPassword() : null;
        String clientIp = extractClientIp(servletRequest);

        if (username == null || username.isBlank()) {
            throw new BusinessValidationException("Username is required.");
        }
        if (password == null || password.isBlank()) {
            throw new BusinessValidationException("Password is required.");
        }

        String trimmedUsername = username.trim();

        // Rate limiting: max 5 failed attempts per username+IP per 15 minutes
        if (rateLimiter.isBlocked(trimmedUsername, clientIp)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(ApiResponse.error(429, "TOO_MANY_REQUESTS",
                            "Too many failed login attempts. Please try again after 15 minutes."));
        }

        Optional<AppUser> dbUserOpt = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(
                trimmedUsername,
                trimmedUsername
        );

        // Verify password BEFORE any status or role check to prevent enumeration
        if (dbUserOpt.isEmpty() || !passwordEncoder.matches(password, dbUserOpt.get().getPasswordHash())) {
            rateLimiter.recordFailedAttempt(trimmedUsername, clientIp);
            if (dbUserOpt.isPresent() && settingsService != null) {
                settingsService.recordLoginFailure(dbUserOpt.get().getUsername(), servletRequest, "Invalid password attempt");
            }
            if (rateLimiter.isBlocked(trimmedUsername, clientIp)) {
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(ApiResponse.error(429, "TOO_MANY_REQUESTS",
                                "Too many failed login attempts. Please try again after 15 minutes."));
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(401, "UNAUTHORIZED", INVALID_CREDENTIALS_MSG));
        }

        AppUser user = dbUserOpt.get();

        // Reject any account that is not an active, allowlisted ADMIN
        if (!allowlistService.isAuthorizedAdmin(user)) {
            if (settingsService != null) {
                settingsService.recordLoginFailure(user.getUsername(), servletRequest, "Non-admin or disabled account login blocked");
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "FORBIDDEN", ADMIN_RESTRICTED_MSG));
        }

        rateLimiter.resetAttempts(trimmedUsername, clientIp);

        String token = tokenProvider.generateToken(user.getUsername(), "ADMIN");

        if (settingsService != null) {
            settingsService.recordLoginSuccess(user.getUsername(), token, servletRequest);
        }

        LoginResponse response = LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .name(user.getDisplayName())
                .role("ADMIN")
                .email(user.getEmail())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Initiate password reset flow and send OTP")
    public ResponseEntity<ApiResponse<ForgotPasswordResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        ForgotPasswordResponse response = passwordResetService.requestPasswordReset(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/verify-otp")
    @Operation(summary = "Verify OTP and obtain a one-time password reset token")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        VerifyOtpResponse response = passwordResetService.verifyOtp(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using verified reset token")
    public ResponseEntity<ApiResponse<ResetPasswordResponse>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request,
            HttpServletRequest servletRequest) {
        String clientIp = extractClientIp(servletRequest);
        ResetPasswordResponse response = passwordResetService.resetPassword(request, clientIp);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated administrator info from database")
    public ResponseEntity<ApiResponse<Map<String, String>>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(401, "UNAUTHORIZED", "Unauthenticated"));
        }

        String principal = auth.getName();
        Optional<AppUser> userOpt = userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(principal, principal);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(401, "UNAUTHORIZED", "Unauthenticated"));
        }

        AppUser user = userOpt.get();
        if (!allowlistService.isAuthorizedAdmin(user)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error(403, "FORBIDDEN", ADMIN_RESTRICTED_MSG));
        }

        return ResponseEntity.ok(ApiResponse.success("Current user profile", Map.of(
                "username", user.getUsername(),
                "name", user.getDisplayName(),
                "role", "ADMIN",
                "email", user.getEmail()
        )));
    }
}
