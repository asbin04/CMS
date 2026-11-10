package com.company.project.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy(DataSource dataSource) {
        return flyway -> {
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                // If V17 or V25 was recorded in schema history before the tables were physically created,
                // remove the row so Flyway executes the DDL
                stmt.executeUpdate(
                        "DELETE FROM public.flyway_schema_history " +
                        "WHERE version = '17' AND NOT EXISTS (" +
                        "    SELECT 1 FROM information_schema.tables WHERE table_name = 'finance_targets'" +
                        ")"
                );
                stmt.executeUpdate(
                        "DELETE FROM public.flyway_schema_history " +
                        "WHERE version = '25' AND NOT EXISTS (" +
                        "    SELECT 1 FROM information_schema.tables WHERE table_name = 'uiux_designs'" +
                        ")"
                );
                stmt.executeUpdate(
                        "DELETE FROM public.flyway_schema_history " +
                        "WHERE version = '26' AND NOT EXISTS (" +
                        "    SELECT 1 FROM information_schema.tables WHERE table_name = 'project_uats'" +
                        ")"
                );
                stmt.executeUpdate(
                        "DELETE FROM public.flyway_schema_history " +
                        "WHERE version = '32' AND NOT EXISTS (" +
                        "    SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'expense_code'" +
                        ")"
                );
            } catch (Exception e) {
                // Log and continue
            }
            flyway.repair();
            flyway.migrate();
        };
    }
}
