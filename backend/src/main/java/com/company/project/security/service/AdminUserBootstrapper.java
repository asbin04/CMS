package com.company.project.security.service;

import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserBootstrapper implements ApplicationRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAllowlistService allowlistService;

    @Value("${app.auth.admin.password:}")
    private String initialAdminPassword;

    @Override
    public void run(ApplicationArguments args) {
        for (String email : allowlistService.getAllowedEmails()) {
            ensureOrUpdateAdminUser(email);
        }

        revokeUnauthorizedUsers();
    }

    private void ensureOrUpdateAdminUser(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Optional<AppUser> existingOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (existingOpt.isPresent()) {
            AppUser user = existingOpt.get();
            boolean updated = false;

            if (!"ADMIN".equalsIgnoreCase(user.getRole())) {
                user.setRole("ADMIN");
                updated = true;
            }
            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                user.setStatus("ACTIVE");
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                log.info("Ensured active ADMIN status for allowlisted account: {}", normalizedEmail);
            }
            return;
        }

        if (initialAdminPassword == null || initialAdminPassword.isBlank() || initialAdminPassword.length() < 12) {
            throw new IllegalStateException(
                    "ADMIN_PASSWORD (at least 12 characters) is required to seed new admin account: " + normalizedEmail
            );
        }

        AppUser newAdmin = AppUser.builder()
                .username(normalizedEmail)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(initialAdminPassword))
                .displayName(deriveDisplayName(normalizedEmail))
                .role("ADMIN")
                .status("ACTIVE")
                .passwordChangedAt(Instant.now())
                .build();
        userRepository.save(newAdmin);
        log.info("Created authorized admin account: {}", normalizedEmail);
    }

    private void revokeUnauthorizedUsers() {
        List<AppUser> allUsers = userRepository.findAll();
        for (AppUser user : allUsers) {
            if (!allowlistService.isAllowedAdminEmail(user.getEmail()) || !"ADMIN".equalsIgnoreCase(user.getRole())) {
                if (!"DISABLED".equalsIgnoreCase(user.getStatus())) {
                    user.setStatus("DISABLED");
                    userRepository.save(user);
                    log.warn("Disabled unauthorized or non-admin account: {}", user.getEmail());
                }
            }
        }
    }

    private String deriveDisplayName(String email) {
        String localPart = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
        String[] parts = localPart.split("[._-]");
        StringBuilder sb = new StringBuilder();
        for (String part : parts) {
            if (!part.isBlank()) {
                if (!sb.isEmpty()) {
                    sb.append(' ');
                }
                sb.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1).toLowerCase(Locale.ROOT));
            }
        }
        return sb.isEmpty() ? localPart : sb.toString();
    }
}
