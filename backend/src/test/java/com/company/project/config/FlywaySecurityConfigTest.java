package com.company.project.config;

import org.flywaydb.core.api.Location;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.env.MockEnvironment;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FlywaySecurityConfigTest {

    private final FlywaySecurityConfig config = new FlywaySecurityConfig();

    private final Location[] devLocations = new Location[]{
            new Location("classpath:db/migration"),
            new Location("classpath:db/dev-migration")
    };

    private final Location[] prodLocations = new Location[]{
            new Location("classpath:db/migration")
    };

    @Test
    @DisplayName("1. Dev profile accepts dev migrations")
    void devProfileAcceptsDevMigrations() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("dev");

        assertThatCode(() -> config.validateFlywayLocations(environment, devLocations))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("2. Prod profile rejects dev migrations")
    void prodProfileRejectsDevMigrations() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        assertThatThrownBy(() -> config.validateFlywayLocations(environment, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Production profile detected with development migration location");
    }

    @Test
    @DisplayName("3. Production + dev mixed profiles reject dev migrations (Production precedence)")
    void productionAndDevMixedProfilesRejectDevMigrations() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("production", "dev");

        assertThatThrownBy(() -> config.validateFlywayLocations(environment, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Production profile detected with development migration location");
    }

    @Test
    @DisplayName("4. Unknown profile rejects dev migrations (Fail-closed)")
    void unknownProfileRejectsDevMigrations() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("custom-staging");

        assertThatThrownBy(() -> config.validateFlywayLocations(environment, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not in permitted profiles");
    }

    @Test
    @DisplayName("5. No active profile rejects dev migrations (Fail-closed)")
    void noActiveProfileRejectsDevMigrations() {
        MockEnvironment environment = new MockEnvironment();
        // Zero profiles configured

        assertThatThrownBy(() -> config.validateFlywayLocations(environment, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not in permitted profiles");
    }

    @Test
    @DisplayName("6. Production accepts production-only migration locations")
    void productionAcceptsProductionOnlyMigrationLocations() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("prod");

        assertThatCode(() -> config.validateFlywayLocations(environment, prodLocations))
                .doesNotThrowAnyException();
    }

    @ParameterizedTest
    @ValueSource(strings = {"prod", "production", "prd", "live", "PROD", "LIVE"})
    @DisplayName("All production profile variants strictly reject dev migrations")
    void allProductionProfileVariantsRejectDevMigrations(String profile) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profile);

        assertThatThrownBy(() -> config.validateFlywayLocations(environment, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Production profile detected with development migration location");
    }

    @ParameterizedTest
    @ValueSource(strings = {"dev", "test", "local", "DEV", "TEST"})
    @DisplayName("All permitted non-production profile variants accept dev migrations")
    void allPermittedDevProfilesAcceptDevMigrations(String profile) {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles(profile);

        assertThatCode(() -> config.validateFlywayLocations(environment, devLocations))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Null environment fails closed when dev migrations are configured")
    void nullEnvironmentFailsClosedWithDevMigrations() {
        assertThatThrownBy(() -> config.validateFlywayLocations(null, devLocations))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("not in permitted profiles");
    }
}
