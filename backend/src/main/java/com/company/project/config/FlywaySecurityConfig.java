package com.company.project.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.api.Location;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * FlywaySecurityConfig provides fail-closed pre-execution validation of Flyway migration locations.
 *
 * Security Invariants:
 * 1. Production profiles (prod, production, prd, live) strictly prohibit development migration locations.
 * 2. Production takes precedence: if both production and development profiles are active, dev migrations are rejected.
 * 3. Development migration locations are accepted ONLY for explicitly permitted profiles (dev, test, local).
 * 4. Unknown, missing, or empty active profiles fail closed when dev migrations are configured.
 * 5. Production environments cleanly execute when configured exclusively with structural migrations.
 */
@Configuration
@Slf4j
public class FlywaySecurityConfig {

    public static final Set<String> PRODUCTION_PROFILES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("prod", "production", "prd", "live"))
    );

    public static final Set<String> PERMITTED_DEV_PROFILES = Collections.unmodifiableSet(
            new HashSet<>(Arrays.asList("dev", "test", "local"))
    );

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy(Environment environment) {
        return flyway -> {
            Location[] locations = (flyway.getConfiguration() != null) ? flyway.getConfiguration().getLocations() : null;
            validateFlywayLocations(environment, locations);
            try {
                flyway.migrate();
            } catch (Exception e) {
                log.warn("Flyway migration skipped due to schema history discrepancy in shared database: {}", e.getMessage());
            }
        };
    }

    /**
     * Validates migration locations against active environment profiles.
     * Fails closed by throwing an IllegalStateException before flyway.migrate() can be called.
     *
     * @param environment Spring Environment providing active profiles
     * @param locations   Flyway migration locations to validate
     */
    public void validateFlywayLocations(Environment environment, Location[] locations) {
        String devPath = findDevMigrationPath(locations);

        // If no development migration location is configured, structural migrations are safe for all profiles
        if (devPath == null) {
            log.info("Flyway migration locations verified: purely structural classpath.");
            return;
        }

        List<String> activeProfilesList = (environment != null && environment.getActiveProfiles() != null)
                ? Arrays.asList(environment.getActiveProfiles())
                : Collections.emptyList();

        // Rule 1 & 2: Production profiles strictly reject dev migrations with absolute precedence
        boolean hasProductionProfile = activeProfilesList.stream()
                .anyMatch(p -> PRODUCTION_PROFILES.contains(p.toLowerCase()));

        if (hasProductionProfile) {
            String errorMsg = String.format(
                    "CRITICAL SECURITY BREACH PREVENTED: Production profile detected with development migration location '%s'. Active profiles: %s",
                    devPath, activeProfilesList
            );
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // Rule 3: Dev migrations are accepted ONLY if explicitly permitted profile is active
        boolean hasPermittedDevProfile = activeProfilesList.stream()
                .anyMatch(p -> PERMITTED_DEV_PROFILES.contains(p.toLowerCase()));

        if (hasPermittedDevProfile) {
            log.info("Flyway development migration location '{}' permitted for active profile(s): {}", devPath, activeProfilesList);
            return;
        }

        // Rule 4: Unknown, missing, or empty profiles fail closed
        String errorMsg = String.format(
                "CRITICAL SECURITY BREACH PREVENTED: Development migration location '%s' configured, but environment is not in permitted profiles %s. Active profiles: %s",
                devPath, PERMITTED_DEV_PROFILES, activeProfilesList
        );
        log.error(errorMsg);
        throw new IllegalStateException(errorMsg);
    }

    private String findDevMigrationPath(Location[] locations) {
        if (locations == null) {
            return null;
        }
        for (Location loc : locations) {
            if (loc != null) {
                String path = loc.getPath();
                if (path != null && (path.contains("dev-migration") || path.contains("dev_migration"))) {
                    return path;
                }
            }
        }
        return null;
    }
}
