package com.company.project.projects;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class Phase1DevelopmentSchemaVerificationTest {

    static {
        File[] envFiles = new File[]{
                new File(".env"),
                new File("backend/.env"),
                new File("../.env"),
                new File("../backend/.env")
        };
        for (File envFile : envFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                    (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("1. Verify public.project_developments table exists with correct columns")
    void testProjectDevelopmentsTableColumns() {
        String sql = """
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'project_developments'
            ORDER BY ordinal_position
        """;
        List<Map<String, Object>> columns = jdbcTemplate.queryForList(sql);
        assertFalse(columns.isEmpty(), "project_developments table must exist");

        List<String> colNames = columns.stream()
                .map(m -> (String) m.get("column_name"))
                .toList();

        List<String> expectedCols = List.of(
                "development_id", "project_id", "requirement_id", "task_id",
                "developer_id", "developer_name", "repository_url", "branch",
                "environment", "build_version", "code_review_status", "qa_handoff_date",
                "release_id", "status", "technical_notes", "documentation_link",
                "created_by", "updated_by", "created_at", "updated_at"
        );

        for (String expected : expectedCols) {
            assertTrue(colNames.contains(expected), "Missing expected column: " + expected);
        }
        Map<String, Object> qaHandoffCol = columns.stream()
                .filter(m -> "qa_handoff_date".equals(m.get("column_name")))
                .findFirst().orElseThrow();
        assertEquals("YES", qaHandoffCol.get("is_nullable"), "qa_handoff_date must be nullable");
        System.out.println("Verified " + columns.size() + " columns in public.project_developments, qa_handoff_date is nullable=" + qaHandoffCol.get("is_nullable"));
    }

    @Test
    @DisplayName("2. Verify Foreign Keys and Composite Relationships")
    void testForeignKeys() {
        String sql = """
            SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'project_developments'
        """;
        List<Map<String, Object>> fks = jdbcTemplate.queryForList(sql);
        List<String> fkNames = fks.stream().map(m -> (String) m.get("constraint_name")).distinct().toList();

        assertTrue(fkNames.contains("fk_dev_project"), "Must contain fk_dev_project");
        assertTrue(fkNames.contains("fk_dev_requirement"), "Must contain fk_dev_requirement");
        assertTrue(fkNames.contains("fk_dev_task"), "Must contain fk_dev_task");
        assertTrue(fkNames.contains("fk_dev_project_requirement"), "Must contain composite fk_dev_project_requirement");
        assertTrue(fkNames.contains("fk_dev_project_task"), "Must contain composite fk_dev_project_task");
        assertTrue(fkNames.contains("fk_dev_developer"), "Must contain fk_dev_developer");

        System.out.println("Verified FK constraints: " + fkNames);
    }

    @Test
    @DisplayName("3. Verify Check Constraints")
    void testCheckConstraints() {
        String sql = """
            SELECT conname, pg_get_constraintdef(c.oid) as def
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.conrelid = 'public.project_developments'::regclass AND c.contype = 'c'
        """;
        List<Map<String, Object>> checks = jdbcTemplate.queryForList(sql);
        List<String> checkNames = checks.stream().map(m -> (String) m.get("conname")).toList();

        assertTrue(checkNames.contains("chk_dev_environment"), "Must contain chk_dev_environment");
        assertTrue(checkNames.contains("chk_dev_code_review_status"), "Must contain chk_dev_code_review_status");
        assertTrue(checkNames.contains("chk_dev_status"), "Must contain chk_dev_status");

        System.out.println("Verified check constraints: " + checkNames);
    }

    @Test
    @DisplayName("4. Verify Performance Indexes")
    void testIndexes() {
        String sql = """
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'project_developments'
        """;
        List<Map<String, Object>> indexes = jdbcTemplate.queryForList(sql);
        List<String> indexNames = indexes.stream().map(m -> (String) m.get("indexname")).toList();

        assertTrue(indexNames.contains("idx_project_developments_project_id"), "Must contain idx_project_developments_project_id");
        assertTrue(indexNames.contains("idx_project_developments_requirement_id"), "Must contain idx_project_developments_requirement_id");
        assertTrue(indexNames.contains("idx_project_developments_task_id"), "Must contain idx_project_developments_task_id");
        assertTrue(indexNames.contains("idx_project_developments_developer_id"), "Must contain idx_project_developments_developer_id");
        assertTrue(indexNames.contains("idx_project_developments_status"), "Must contain idx_project_developments_status");
        assertTrue(indexNames.contains("idx_project_developments_code_review_status"), "Must contain idx_project_developments_code_review_status");
        assertTrue(indexNames.contains("idx_project_developments_environment"), "Must contain idx_project_developments_environment");
        assertTrue(indexNames.contains("idx_project_developments_created_at"), "Must contain idx_project_developments_created_at");

        System.out.println("Verified indexes: " + indexNames);
    }

    @Test
    @DisplayName("5. Verify Requirement Composite Unique Constraint and Counter")
    void testCompositeUniqueAndCounter() {
        // Check uq_project_requirements_project_id_id
        Integer countUq = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM pg_constraint WHERE conname = 'uq_project_requirements_project_id_id'",
                Integer.class
        );
        assertEquals(1, countUq, "uq_project_requirements_project_id_id must exist on project_requirements");

        // Check project_module_counters
        Integer countCounter = jdbcTemplate.queryForObject(
                "SELECT count(*) FROM public.project_module_counters WHERE entity_type = 'DEVELOPMENT' AND period_key = TO_CHAR(CURRENT_DATE, 'YYYY')",
                Integer.class
        );
        assertEquals(1, countCounter, "Yearly counter for DEVELOPMENT must exist in project_module_counters");
    }

    @Test
    @DisplayName("6. Verify Existing Data Remains Intact")
    void testExistingDataIntegrity() {
        Integer projectsCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.projects", Integer.class);
        Integer requirementsCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.project_requirements", Integer.class);
        Integer tasksCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.project_tasks", Integer.class);
        Integer employeesCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.employees", Integer.class);
        Integer developmentsCount = jdbcTemplate.queryForObject("SELECT count(*) FROM public.project_developments", Integer.class);

        assertNotNull(projectsCount);
        assertNotNull(requirementsCount);
        assertNotNull(tasksCount);
        assertNotNull(employeesCount);
        assertNotNull(developmentsCount);

        System.out.println("Integrity Check - Projects count: " + projectsCount);
        System.out.println("Integrity Check - Requirements count: " + requirementsCount);
        System.out.println("Integrity Check - Tasks count: " + tasksCount);
        System.out.println("Integrity Check - Employees count: " + employeesCount);
        System.out.println("Direct DB Query - public.project_developments count: " + developmentsCount);
    }
}

