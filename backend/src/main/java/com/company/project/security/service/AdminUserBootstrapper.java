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
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminUserBootstrapper implements ApplicationRunner {

    public static final Set<String> AUTHORIZED_ADMIN_EMAILS = Set.of(
            "asbin.t.s@kalpanaaa.in",
            "founder@kalpanaaasoftwaresolutions.in",
            "akshit.ujjain@kalpanaaasoftwaresolutions.in"
    );

    public record AdminAccountSpec(String email, String username, String displayName, String defaultPassword) {}

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.admin.password:${ADMIN_PASSWORD:Admin123}}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        String defaultPass = (adminPassword != null && !adminPassword.isBlank()) ? adminPassword : "Admin123";

        List<AdminAccountSpec> admins = List.of(
                new AdminAccountSpec("asbin.t.s@kalpanaaa.in", "asbin.t.s@kalpanaaa.in", "Asbin T S", defaultPass),
                new AdminAccountSpec("founder@kalpanaaasoftwaresolutions.in", "founder@kalpanaaasoftwaresolutions.in", "Gaurav Kumar Tripathi", defaultPass),
                new AdminAccountSpec("akshit.ujjain@kalpanaaasoftwaresolutions.in", "akshit.ujjain@kalpanaaasoftwaresolutions.in", "Akshit Ujjain", defaultPass)
        );

        for (AdminAccountSpec spec : admins) {
            ensureOrUpdateAdminUser(spec);
        }

        revokeUnauthorizedAdmins();
    }

    public void ensureOrUpdateAdminUser(AdminAccountSpec spec) {
        String normalizedEmail = spec.email().trim().toLowerCase();
        Optional<AppUser> existingOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);

        if (existingOpt.isPresent()) {
            AppUser user = existingOpt.get();
            boolean updated = false;

            if (!"ADMIN".equals(user.getRole())) {
                user.setRole("ADMIN");
                updated = true;
            }
            if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
                user.setStatus("ACTIVE");
                updated = true;
            }
            if (!passwordEncoder.matches(spec.defaultPassword(), user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(spec.defaultPassword()));
                user.setPasswordChangedAt(Instant.now());
                updated = true;
            }
            if (user.getDisplayName() == null || user.getDisplayName().isBlank() || !spec.displayName().equals(user.getDisplayName())) {
                user.setDisplayName(spec.displayName());
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
                log.info("Updated authorized admin account: {}", normalizedEmail);
            } else {
                log.info("Authorized admin account is verified and active: {}", normalizedEmail);
            }
        } else {
            AppUser newAdmin = AppUser.builder()
                    .username(spec.username())
                    .email(normalizedEmail)
                    .passwordHash(passwordEncoder.encode(spec.defaultPassword()))
                    .displayName(spec.displayName())
                    .role("ADMIN")
                    .status("ACTIVE")
                    .passwordChangedAt(Instant.now())
                    .build();
            userRepository.save(newAdmin);
            log.info("Created authorized admin account: {}", normalizedEmail);
        }
    }

    private void revokeUnauthorizedAdmins() {
        List<AppUser> allUsers = userRepository.findAll();
        for (AppUser u : allUsers) {
            if (u.getEmail() != null && !AUTHORIZED_ADMIN_EMAILS.contains(u.getEmail().trim().toLowerCase())) {
                if ("ADMIN".equals(u.getRole())) {
                    u.setStatus("DISABLED");
                    userRepository.save(u);
                    log.warn("Revoked unauthorized admin access for account: {}", u.getEmail());
                }
            }
        }
    }
}
