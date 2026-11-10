package com.company.project.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;

public final class SecurityUtils {

    private SecurityUtils() {}

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return "system";
        }
        return auth.getName();
    }

    public static List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return Collections.emptyList();
        }
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();
    }

    public static boolean isManagerOrAdmin() {
        return getCurrentUserRoles().stream().anyMatch(r ->
                "ROLE_ADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r) ||
                "ROLE_CEO".equalsIgnoreCase(r) || "CEO".equalsIgnoreCase(r) ||
                "ROLE_MD".equalsIgnoreCase(r) || "MD".equalsIgnoreCase(r) ||
                "ROLE_MANAGER".equalsIgnoreCase(r) || "MANAGER".equalsIgnoreCase(r) ||
                "ROLE_PROJECT_MANAGER".equalsIgnoreCase(r) || "PROJECT_MANAGER".equalsIgnoreCase(r)
        );
    }
}

