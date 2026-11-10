package com.company.project.projects.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ProjectModuleIdGeneratorServiceTest {

    static class RecordingJdbcTemplate extends JdbcTemplate {
        String lastSql;
        Object[] lastArgs;
        Long nextReturnValue = 1L;

        @Override
        @SuppressWarnings("unchecked")
        public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) throws DataAccessException {
            this.lastSql = sql;
            this.lastArgs = args;
            return (T) nextReturnValue;
        }
    }

    private final RecordingJdbcTemplate jdbcTemplate = new RecordingJdbcTemplate();
    private final ProjectModuleIdGeneratorService idGeneratorService = new ProjectModuleIdGeneratorService(jdbcTemplate);

    @Test
    @DisplayName("Should generate Timesheet ID matching pattern TS-YYYYMM-NNN")
    void shouldGenerateTimesheetId() {
        LocalDate date = LocalDate.of(2026, 10, 28);
        jdbcTemplate.nextReturnValue = 49L;

        String id = idGeneratorService.generateTimesheetId(date);

        assertThat(id).isEqualTo("TS-202610-049");
        assertThat(jdbcTemplate.lastArgs).containsExactly("TIMESHEET", "202610");
        assertThat(jdbcTemplate.lastSql).contains("public.project_module_counters");
        assertThat(jdbcTemplate.lastSql).contains("entity_type");
        assertThat(jdbcTemplate.lastSql).contains("period_key");
        assertThat(jdbcTemplate.lastSql).contains("current_value");
    }

    @Test
    @DisplayName("Should generate Requirement ID matching pattern REQ-YYYY-NNNN")
    void shouldGenerateRequirementId() {
        LocalDate date = LocalDate.of(2026, 10, 28);
        jdbcTemplate.nextReturnValue = 187L;

        String id = idGeneratorService.generateRequirementId(date);

        assertThat(id).isEqualTo("REQ-2026-0187");
        assertThat(jdbcTemplate.lastArgs).containsExactly("REQUIREMENT", "2026");
        assertThat(jdbcTemplate.lastSql).contains("RETURNING current_value");
    }

    @Test
    @DisplayName("Should generate Project ID matching pattern PRJ-NNN")
    void shouldGenerateProjectId() {
        jdbcTemplate.nextReturnValue = 7L;

        String id = idGeneratorService.generateProjectId();

        assertThat(id).isEqualTo("PRJ-007");
        assertThat(jdbcTemplate.lastArgs).containsExactly("PROJECT", "GLOBAL");
    }

    @Test
    @DisplayName("Should generate Task ID matching pattern TSK-NNNNN")
    void shouldGenerateTaskId() {
        jdbcTemplate.nextReturnValue = 131L;

        String id = idGeneratorService.generateTaskId();

        assertThat(id).isEqualTo("TSK-00131");
        assertThat(jdbcTemplate.lastArgs).containsExactly("TASK", "GLOBAL");
    }

    @Test
    @DisplayName("Should verify that upsert SQL targets public.project_module_counters with exact column names")
    void shouldVerifyUpsertSqlColumns() {
        jdbcTemplate.nextReturnValue = 1L;

        idGeneratorService.allocateNextSequence("PROJECT", "GLOBAL");

        assertThat(jdbcTemplate.lastSql).contains("public.project_module_counters");
        assertThat(jdbcTemplate.lastSql).contains("entity_type");
        assertThat(jdbcTemplate.lastSql).contains("period_key");
        assertThat(jdbcTemplate.lastSql).contains("current_value");
        assertThat(jdbcTemplate.lastSql).contains("updated_at");
        assertThat(jdbcTemplate.lastSql).contains("RETURNING current_value");
    }
}
