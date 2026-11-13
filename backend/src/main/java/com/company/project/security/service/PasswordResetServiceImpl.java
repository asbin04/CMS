package com.company.project.security.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.security.dto.*;
import com.company.project.security.entity.AppUser;
import com.company.project.security.entity.PasswordResetOtp;
import com.company.project.security.repository.AppUserRepository;
import com.company.project.security.repository.PasswordResetOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetServiceImpl implements PasswordResetService {

    private final AppUserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final OtpCryptoService cryptoService;
    private final PasswordResetRateLimiter rateLimiter;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AdminAllowlistService allowlistService;

    @Value("${app.auth.otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.auth.otp.cooldown-seconds:60}")
    private long cooldownSeconds;

    @Override
    @Transactional
    public ForgotPasswordResponse requestPasswordReset(ForgotPasswordRequest request, String clientIp) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BusinessValidationException("Email address is required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Rate limiting check
        long remainingCooldown = rateLimiter.getRemainingCooldownSeconds(normalizedEmail, clientIp);
        if (remainingCooldown > 0) {
            throw new BusinessValidationException(
                    "Please wait " + remainingCooldown + " seconds before requesting another OTP."
            );
        }

        // 2. User lookup - Always return uniform response even if user doesn't exist or is not an active allowlisted ADMIN
        Optional<AppUser> userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (userOpt.isEmpty() || !allowlistService.isAuthorizedAdmin(userOpt.get())) {
            log.info("Password reset requested for non-existent, inactive, or non-admin email: {}", normalizedEmail);
            // Record rate limiter attempt anyway to prevent blind brute-forcing
            rateLimiter.recordRequest(normalizedEmail, clientIp);
            return ForgotPasswordResponse.builder()
                    .message("If an account with that email exists, an OTP has been sent.")
                    .cooldownSeconds(cooldownSeconds)
                    .build();
        }

        AppUser user = userOpt.get();

        // 3. Invalidate any existing active OTPs for this user
        otpRepository.invalidateAllActiveForUser(user, Instant.now());

        // 4. Generate secure 6-digit OTP and compute HMAC
        String rawOtp = cryptoService.generateNumericOtp();
        String otpHmac = cryptoService.computeHmacHex(rawOtp);
        Instant expiresAt = Instant.now().plusSeconds(otpExpirationMinutes * 60L);

        PasswordResetOtp otpEntity = PasswordResetOtp.builder()
                .user(user)
                .otpHash(otpHmac)
                .attempts(0)
                .maxAttempts(5)
                .expiresAt(expiresAt)
                .clientIp(clientIp)
                .build();

        otpRepository.save(otpEntity);
        rateLimiter.recordRequest(normalizedEmail, clientIp);

        // 5. Send email asynchronously
        emailService.sendOtpEmail(user.getEmail(), rawOtp, otpExpirationMinutes);

        return ForgotPasswordResponse.builder()
                .message("If an account with that email exists, an OTP has been sent.")
                .cooldownSeconds(cooldownSeconds)
                .build();
    }

    @Override
    @Transactional
    public VerifyOtpResponse verifyOtp(VerifyOtpRequest request, String clientIp) {
        if (request == null || request.getEmail() == null || request.getOtp() == null) {
            throw new BusinessValidationException("Email and OTP are required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String rawOtp = request.getOtp().trim();

        if (!rawOtp.matches("^\\d{6}$")) {
            throw new BusinessValidationException("OTP must be exactly 6 digits.");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(allowlistService::isAuthorizedAdmin)
                .orElseThrow(() -> new BusinessValidationException("Invalid OTP or request has expired."));

        PasswordResetOtp otpEntity = otpRepository.findTopByUserOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new BusinessValidationException("No active OTP request found. Please request a new OTP."));

        if (otpEntity.isUsed()) {
            throw new BusinessValidationException("This OTP has already been used. Please request a new OTP.");
        }

        if (otpEntity.isExpired()) {
            throw new BusinessValidationException("OTP has expired. Please request a new OTP.");
        }

        if (otpEntity.isMaxAttemptsReached()) {
            throw new BusinessValidationException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        // Increment attempts count
        otpEntity.setAttempts(otpEntity.getAttempts() + 1);

        // Constant-time HMAC verification
        boolean isValid = cryptoService.verifyHmac(rawOtp, otpEntity.getOtpHash());
        if (!isValid) {
            otpRepository.save(otpEntity);
            int remaining = otpEntity.getMaxAttempts() - otpEntity.getAttempts();
            if (remaining > 0) {
                throw new BusinessValidationException("Invalid OTP. You have " + remaining + " attempts remaining.");
            } else {
                throw new BusinessValidationException("Invalid OTP. Maximum attempts exceeded. Please request a new OTP.");
            }
        }

        // OTP is valid! Generate one-time reset token (valid for 15 minutes)
        String resetToken = cryptoService.generateResetToken();
        String tokenHmac = cryptoService.computeHmacHex(resetToken);

        otpEntity.setResetTokenHash(tokenHmac);
        otpEntity.setTokenExpiresAt(Instant.now().plusSeconds(900)); // 15 mins
        otpRepository.save(otpEntity);

        return VerifyOtpResponse.builder()
                .resetToken(resetToken)
                .expiresInSeconds(900)
                .message("OTP verified successfully.")
                .build();
    }

    @Override
    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest request, String clientIp) {
        if (request == null) {
            throw new BusinessValidationException("Invalid password reset request.");
        }

        String resetToken = request.getResetToken();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (resetToken == null || resetToken.isBlank()) {
            throw new BusinessValidationException("Reset token is required.");
        }
        if (newPassword == null || newPassword.isBlank()) {
            throw new BusinessValidationException("New password is required.");
        }
        if (confirmPassword == null || confirmPassword.isBlank()) {
            throw new BusinessValidationException("Confirm password is required.");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new BusinessValidationException("Passwords do not match.");
        }

        // Validate password security policy
        validatePasswordPolicy(newPassword);

        // Verify reset token via HMAC
        String tokenHmac = cryptoService.computeHmacHex(resetToken.trim());
        PasswordResetOtp otpEntity = otpRepository.findByResetTokenHashAndUsedAtIsNull(tokenHmac)
                .orElseThrow(() -> new BusinessValidationException("Password reset link is invalid or has already been used."));

        if (otpEntity.isTokenExpired()) {
            throw new BusinessValidationException("Password reset session has expired. Please start over.");
        }

        AppUser user = otpEntity.getUser();
        if (!allowlistService.isAuthorizedAdmin(user)) {
            throw new BusinessValidationException("Password reset link is invalid or has already been used.");
        }

        // Check if new password matches old password
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new BusinessValidationException("New password cannot be the same as your old password.");
        }

        // Check if password contains username or email prefix
        String username = user.getUsername() != null ? user.getUsername().toLowerCase() : "";
        String emailPrefix = (user.getEmail() != null && user.getEmail().contains("@"))
                ? user.getEmail().split("@")[0].toLowerCase()
                : "";

        String lowerPwd = newPassword.toLowerCase();
        if ((!username.isBlank() && lowerPwd.contains(username)) ||
            (!emailPrefix.isBlank() && emailPrefix.length() >= 3 && lowerPwd.contains(emailPrefix))) {
            throw new BusinessValidationException("Password cannot contain your name or email prefix.");
        }

        // Hash and update password
        String newHash = passwordEncoder.encode(newPassword);
        user.setPasswordHash(newHash);
        user.setPasswordChangedAt(Instant.now());
        userRepository.save(user);

        // Mark all OTPs and tokens for this user as used
        Instant now = Instant.now();
        otpEntity.setUsedAt(now);
        otpRepository.save(otpEntity);
        otpRepository.invalidateAllActiveForUser(user, now);

        log.info("Password successfully reset for user: {}", user.getUsername());

        return ResetPasswordResponse.builder()
                .message("Your password has been successfully reset. Please log in with your new password.")
                .build();
    }

    private void validatePasswordPolicy(String password) {
        if (password.length() < 12) {
            throw new BusinessValidationException("Password must be at least 12 characters long.");
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BusinessValidationException("Password cannot exceed 72 bytes.");
        }
        boolean hasLetter = false;
        boolean hasDigitOrSpecial = false;
        for (char c : password.toCharArray()) {
            if (Character.isLetter(c)) {
                hasLetter = true;
            } else {
                hasDigitOrSpecial = true;
            }
        }
        if (!hasLetter || !hasDigitOrSpecial) {
            throw new BusinessValidationException("Password must contain both letters and numbers or symbols.");
        }
    }
}

