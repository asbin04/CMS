package com.company.project.security.service;

import com.company.project.security.entity.AppUser;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminAllowlistService {

    private final Set<String> allowedAdminEmails;

    public AdminAllowlistService(@Value("${app.auth.admin.allowed-emails:}") String rawAllowedEmails) {
        if (rawAllowedEmails == null || rawAllowedEmails.isBlank()) {
            this.allowedAdminEmails = Collections.emptySet();
        } else {
            this.allowedAdminEmails = Arrays.stream(rawAllowedEmails.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(s -> s.toLowerCase(Locale.ROOT))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
    }

    @PostConstruct
    public void validateConfiguration() {
        if (allowedAdminEmails.isEmpty()) {
            throw new IllegalStateException("ADMIN_EMAILS (app.auth.admin.allowed-emails) is required and cannot be empty.");
        }
    }

    public Set<String> getAllowedEmails() {
        return Collections.unmodifiableSet(allowedAdminEmails);
    }

    public boolean isAllowedAdminEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }
        return allowedAdminEmails.contains(email.trim().toLowerCase(Locale.ROOT));
    }

    public boolean isAuthorizedAdmin(AppUser user) {
        if (user == null) {
            return false;
        }
        return "ACTIVE".equalsIgnoreCase(user.getStatus())
                && "ADMIN".equalsIgnoreCase(user.getRole())
                && isAllowedAdminEmail(user.getEmail());
    }
}

