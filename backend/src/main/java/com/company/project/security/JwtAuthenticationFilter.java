package com.company.project.security;

import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import com.company.project.security.service.AdminAllowlistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Date;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final AppUserRepository userRepository;
    private final AdminAllowlistService allowlistService;

    public JwtAuthenticationFilter(
            JwtTokenProvider tokenProvider,
            AppUserRepository userRepository,
            AdminAllowlistService allowlistService
    ) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
        this.allowlistService = allowlistService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String token = resolveToken(request);

        if (token != null && tokenProvider.validateToken(token)) {
            String username = tokenProvider.getUsername(token);
            Date issuedAt = tokenProvider.getIssuedAt(token);

            Optional<AppUser> userOpt = (username != null && !username.isBlank())
                    ? userRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(username.trim(), username.trim())
                    : Optional.empty();

            if (userOpt.isPresent()) {
                AppUser user = userOpt.get();
                if (allowlistService.isAuthorizedAdmin(user) && !isIssuedBeforePasswordChange(issuedAt, user.getPasswordChangedAt())) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else if (!allowlistService.isAuthorizedAdmin(user)) {
                    // Token belongs to an existing but non-admin/disabled/unallowlisted user -> 403 on protected routes
                    String role = user.getRole() != null ? user.getRole().trim().toUpperCase() : "NON_ADMIN";
                    String authority = "ADMIN".equals(role) ? "ROLE_DISABLED" : "ROLE_" + role;
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority(authority))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isIssuedBeforePasswordChange(Date issuedAt, Instant passwordChangedAt) {
        if (passwordChangedAt == null) {
            return false;
        }
        if (issuedAt == null) {
            return true;
        }
        Instant tokenIssuedAt = issuedAt.toInstant().truncatedTo(ChronoUnit.SECONDS);
        Instant changedAtSeconds = passwordChangedAt.truncatedTo(ChronoUnit.SECONDS);
        return tokenIssuedAt.isBefore(changedAtSeconds);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
