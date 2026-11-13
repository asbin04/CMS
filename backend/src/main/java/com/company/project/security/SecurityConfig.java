package com.company.project.security;

import com.company.project.security.repository.AppUserRepository;
import com.company.project.security.service.AdminAllowlistService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtTokenProvider jwtTokenProvider;
    private final AppUserRepository userRepository;
    private final AdminAllowlistService allowlistService;

    @Value("${spring.profiles.active}")
    private String activeProfile;

    public SecurityConfig(
            CorsConfigurationSource corsConfigurationSource,
            JwtTokenProvider jwtTokenProvider,
            AppUserRepository userRepository,
            AdminAllowlistService allowlistService
    ) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.allowlistService = allowlistService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider, userRepository, allowlistService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        boolean isDev = "dev".equalsIgnoreCase(activeProfile);

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"success\":false,\"message\":\"Access restricted to administrators\",\"status\":403}");
                })
            )
            .authorizeHttpRequests(auth -> {
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                // Minimal public health endpoint; all other actuator endpoints require ADMIN
                auth.requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/health/**").permitAll();
                auth.requestMatchers("/actuator/**").hasRole("ADMIN");

                // Public auth endpoints (login & password reset only; /me is protected)
                auth.requestMatchers(
                        HttpMethod.POST,
                        "/api/v1/auth/login",
                        "/api/auth/login",
                        "/api/v1/auth/forgot-password",
                        "/api/auth/forgot-password",
                        "/api/v1/auth/verify-otp",
                        "/api/auth/verify-otp",
                        "/api/v1/auth/reset-password",
                        "/api/auth/reset-password"
                ).permitAll();

                // Swagger documentation permitted only in dev profile
                if (isDev) {
                    auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                } else {
                    auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").denyAll();
                }

                // Deny-by-default: everything else requires authenticated ADMIN
                auth.anyRequest().hasRole("ADMIN");
            });

        return http.build();
    }
}
