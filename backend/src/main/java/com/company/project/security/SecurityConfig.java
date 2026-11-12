package com.company.project.security;

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
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CorsConfigurationSource corsConfigurationSource;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${spring.profiles.active}")
    private String activeProfile;

    public SecurityConfig(CorsConfigurationSource corsConfigurationSource, JwtTokenProvider jwtTokenProvider) {
        this.corsConfigurationSource = corsConfigurationSource;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtTokenProvider);
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
                    response.getWriter().write("{\"success\":false,\"message\":\"Access denied: insufficient permissions\",\"status\":403}");
                })
            )
            .authorizeHttpRequests(auth -> {
                // Pre-flight requests
                auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll();

                // Public Actuator / Health and Auth endpoints
                auth.requestMatchers("/actuator/**").permitAll()
                    .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll();

                // Swagger documentation permitted only in dev profile
                if (isDev) {
                    auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll();
                } else {
                    auth.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").denyAll();
                }

                // Reset and DELETE operations strictly require ROLE_ADMIN in ALL profiles, including dev
                auth.requestMatchers(
                        PathPatternRequestMatcher.withDefaults().matcher("/api/v1/*/reset"),
                        RegexRequestMatcher.regexMatcher("^/api/v1/(?:.+/)?reset(?:\\?.*)?$")
                    ).hasRole("ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/api/v1/**").hasRole("ADMIN");

                // All other /api/v1/** endpoints require authentication
                auth.requestMatchers("/api/v1/**").authenticated();

                auth.anyRequest().permitAll();
            });

        return http.build();
    }
}
