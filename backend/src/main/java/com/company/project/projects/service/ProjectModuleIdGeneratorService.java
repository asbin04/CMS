package com.company.project.projects.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

/**
 * Service providing atomic, concurrency-safe ID generation for the Project module:
 * - Timesheets: TS-YYYYMM-NNN (e.g., TS-202610-049)
 * - Requirements: REQ-YYYY-NNNN (e.g., REQ-2026-0187)
 * - Projects: PRJ-NNN (e.g., PRJ-007)
 * - Project Tasks: TSK-NNNNN (e.g., TSK-00131)
 *
 * Sequence allocation utilizes PostgreSQL row-level locks via single-statement
 * INSERT ... ON CONFLICT DO UPDATE ... RETURNING current_value against public.project_module_counters.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectModuleIdGeneratorService implements ProjectModuleIdGenerator {

    public static final String ENTITY_TIMESHEET = "TIMESHEET";
    public static final String ENTITY_REQUIREMENT = "REQUIREMENT";
    public static final String ENTITY_DEVELOPMENT = "DEVELOPMENT";
    public static final String ENTITY_PROJECT = "PROJECT";
    public static final String ENTITY_TASK = "TASK";
    public static final String GLOBAL_PERIOD = "GLOBAL";

    private static final DateTimeFormatter YEAR_MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyyMM");

    private final JdbcTemplate jdbcTemplate;

    /**
     * Atomically advances the sequence counter in PostgreSQL and allocates the next ID.
     * Uses row-level write locking via single-statement ON CONFLICT DO UPDATE ... RETURNING current_value.
     *
     * @param entityType The entity counter category (e.g. TIMESHEET, REQUIREMENT, PROJECT, TASK)
     * @param periodKey  The period partition key (e.g. "202610", "2026", or "GLOBAL")
     * @return The newly incremented sequence number
     */
    @Transactional
    public Long allocateNextSequence(String entityType, String periodKey) {
        String upsertSql = """
            INSERT INTO public.project_module_counters (entity_type, period_key, current_value, updated_at)
            VALUES (?, ?, 1, NOW())
            ON CONFLICT (entity_type, period_key) DO UPDATE
            SET current_value = public.project_module_counters.current_value + 1,
                updated_at = NOW()
            RETURNING current_value
        """;

        Long allocatedVal = jdbcTemplate.queryForObject(upsertSql, Long.class, entityType, periodKey);
        if (allocatedVal == null) {
            allocatedVal = 1L;
        }
        log.debug("Allocated atomic sequence {} for entityType={}, periodKey={}", allocatedVal, entityType, periodKey);
        return allocatedVal;
    }

    /**
     * Read-only inspection of the current counter value without advancing or locking the sequence.
     * Returns 0 if no counter row exists yet.
     */
    @Transactional(readOnly = true)
    public Long getCurrentSequence(String entityType, String periodKey) {
        String querySql = "SELECT current_value FROM public.project_module_counters WHERE entity_type = ? AND period_key = ?";
        try {
            Long val = jdbcTemplate.queryForObject(querySql, Long.class, entityType, periodKey);
            return val != null ? val : 0L;
        } catch (EmptyResultDataAccessException e) {
            return 0L;
        }
    }

    /**
     * Generates atomic Timesheet ID: TS-YYYYMM-NNN (e.g., TS-202610-049)
     *
     * @param date Date of the timesheet; defaults to LocalDate.now() if null
     * @return Formatted timesheet ID
     */
    @Transactional
    public String generateTimesheetId(LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        YearMonth ym = YearMonth.from(effectiveDate);
        String periodKey = ym.format(YEAR_MONTH_FORMATTER);
        Long seq = allocateNextSequence(ENTITY_TIMESHEET, periodKey);
        String id = String.format("TS-%s-%03d", periodKey, seq);
        log.info("Allocated atomic timesheet ID: {}", id);
        return id;
    }

    /**
     * Generates atomic Timesheet ID for current date.
     */
    @Transactional
    public String generateTimesheetId() {
        return generateTimesheetId(LocalDate.now());
    }

    /**
     * Generates atomic Requirement ID: REQ-YYYY-NNNN (e.g., REQ-2026-0187)
     *
     * @param date Date of the requirement; defaults to LocalDate.now() if null
     * @return Formatted requirement ID
     */
    @Transactional
    public String generateRequirementId(LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        String periodKey = String.valueOf(effectiveDate.getYear());
        Long seq = allocateNextSequence(ENTITY_REQUIREMENT, periodKey);
        String id = String.format("REQ-%s-%04d", periodKey, seq);
        log.info("Allocated atomic requirement ID: {}", id);
        return id;
    }

    /**
     * Generates atomic Requirement ID for current year.
     */
    @Transactional
    public String generateRequirementId() {
        return generateRequirementId(LocalDate.now());
    }

    /**
     * Generates atomic Project ID: PRJ-NNN (e.g., PRJ-007)
     *
     * @return Formatted project ID
     */
    @Transactional
    public String generateProjectId() {
        Long seq = allocateNextSequence(ENTITY_PROJECT, GLOBAL_PERIOD);
        String id = String.format("PRJ-%03d", seq);
        log.info("Allocated atomic project ID: {}", id);
        return id;
    }

    /**
     * Generates atomic Project Task ID: TSK-NNNNN (e.g., TSK-00131)
     *
     * @return Formatted task ID
     */
    @Transactional
    public String generateTaskId() {
        Long seq = allocateNextSequence(ENTITY_TASK, GLOBAL_PERIOD);
        String id = String.format("TSK-%05d", seq);
        log.info("Allocated atomic task ID: {}", id);
        return id;
    }

    /**
     * Generates atomic Development ID: DEV-YYYY-NNNN (e.g., DEV-2026-0001)
     *
     * @param date Date of the development activity; defaults to LocalDate.now() if null
     * @return Formatted development ID
     */
    @Transactional
    public String generateDevelopmentId(LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        String periodKey = String.valueOf(effectiveDate.getYear());
        Long seq = allocateNextSequence(ENTITY_DEVELOPMENT, periodKey);
        String id = String.format("DEV-%s-%04d", periodKey, seq);
        log.info("Allocated atomic development ID: {}", id);
        return id;
    }

    /**
     * Generates atomic Development ID for current year.
     */
    @Transactional
    public String generateDevelopmentId() {
        return generateDevelopmentId(LocalDate.now());
    }

    /**
     * Previews the next Development ID without consuming the atomic sequence.
     */
    @Transactional(readOnly = true)
    public String previewNextDevelopmentId(LocalDate date) {
        LocalDate effectiveDate = (date != null) ? date : LocalDate.now();
        String periodKey = String.valueOf(effectiveDate.getYear());
        Long current = getCurrentSequence(ENTITY_DEVELOPMENT, periodKey);
        return String.format("DEV-%s-%04d", periodKey, current + 1);
    }

    /**
     * Previews the next Development ID for current year without consuming sequence.
     */
    @Transactional(readOnly = true)
    public String previewNextDevelopmentId() {
        return previewNextDevelopmentId(LocalDate.now());
    }
}

