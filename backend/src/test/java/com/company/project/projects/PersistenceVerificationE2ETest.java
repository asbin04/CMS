package com.company.project.projects;

import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.controller.RequirementController;
import com.company.project.projects.controller.TimesheetController;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectRequirementEntity;
import com.company.project.projects.entity.ProjectTimesheetEntity;
import com.company.project.projects.repository.ProjectRequirementRepository;
import com.company.project.projects.repository.ProjectTimesheetRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class PersistenceVerificationE2ETest {

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
    private TimesheetController timesheetController;

    @Autowired
    private RequirementController requirementController;

    @Autowired
    private ProjectTimesheetRepository timesheetRepository;

    @Autowired
    private ProjectRequirementRepository requirementRepository;

    @Test
    @DisplayName("TIMESHEETS: Create -> Verify Database -> Refresh (GET API) -> Verify Record")
    void testTimesheetPersistenceFlow() {
        System.out.println("================================================================================");
        System.out.println("STEP 1: POST API - Create Timesheet with Frontend Payload");
        System.out.println("================================================================================");

        // Payload structured exactly as the frontend sends
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .projectId("PRJ-001")
                .taskId("TSK-00128") // Valid task for PRJ-001 in Supabase
                .employeeId("EMP-001")
                .employeeName("Amit Sharma")
                .timesheetDate(LocalDate.now())
                .hours(new BigDecimal("7.50"))
                .hoursWorked(new BigDecimal("7.50"))
                .billable("Yes")
                .isBillable(true)
                .hourlyRate(new BigDecimal("1500.00"))
                .notes("Production verification timesheet entry")
                .build();

        ResponseEntity<ApiResponse<TimesheetResponse>> createRes = timesheetController.createTimesheet(request);
        assertNotNull(createRes.getBody());
        assertTrue(createRes.getBody().isSuccess());
        TimesheetResponse created = createRes.getBody().getData();
        assertNotNull(created);
        String createdId = created.getTimesheetId();
        assertNotNull(createdId);
        assertTrue(createdId.startsWith("TS-"));
        System.out.println("POST /api/v1/timesheets SUCCESS: Generated ID = " + createdId);

        try {
            System.out.println("================================================================================");
            System.out.println("STEP 2: Verify Record Directly in Supabase PostgreSQL Database");
            System.out.println("================================================================================");
            assertTrue(timesheetRepository.existsById(createdId), "Record must exist in Supabase table project_timesheets");
            ProjectTimesheetEntity inDb = timesheetRepository.findById(createdId).orElseThrow();
            assertEquals("PRJ-001", inDb.getProjectId());
            assertEquals("TSK-00128", inDb.getTaskId());
            assertEquals("EMP-001", inDb.getEmployeeId());
            assertEquals(new BigDecimal("7.50"), inDb.getHours());
            System.out.println("SUPABASE CONFIRMED: Found committed row in public.project_timesheets: " + inDb.getTimesheetId());

            System.out.println("================================================================================");
            System.out.println("STEP 3 & 4: Simulate Browser Refresh - Call GET API and Verify Returned Records");
            System.out.println("================================================================================");
            // On refresh, the frontend calls GET /api/v1/timesheets?page=1&size=500
            ResponseEntity<ApiResponse<PageResponse<TimesheetResponse>>> getRes = timesheetController.getTimesheets(
                    null, null, null, null, null, null, null, null, 1, 500
            );
            assertNotNull(getRes.getBody());
            assertTrue(getRes.getBody().isSuccess());
            PageResponse<TimesheetResponse> page = getRes.getBody().getData();
            assertNotNull(page);
            assertFalse(page.getContent().isEmpty(), "GET API must return records after refresh");

            TimesheetResponse foundInGet = page.getContent().stream()
                    .filter(t -> Objects.equals(t.getTimesheetId(), createdId))
                    .findFirst()
                    .orElse(null);

            assertNotNull(foundInGet, "Newly created timesheet MUST be present in GET API after browser refresh");
            assertEquals(createdId, foundInGet.getTimesheetId());
            assertEquals("PRJ-001", foundInGet.getProjectId());
            assertEquals("TSK-00128", foundInGet.getTaskId());
            assertEquals("EMP-001", foundInGet.getEmployeeId());
            assertEquals(new BigDecimal("7.50"), foundInGet.getHours());
            System.out.println("GET /api/v1/timesheets VERIFIED: Record persisted and successfully returned after refresh!");
        } finally {
            timesheetRepository.deleteById(createdId);
            System.out.println("Cleaned up test timesheet: " + createdId);
        }
    }

    @Test
    @DisplayName("REQUIREMENTS: Create -> Verify Database -> Refresh (GET API) -> Verify Record")
    void testRequirementPersistenceFlow() {
        System.out.println("================================================================================");
        System.out.println("STEP 1: POST API - Create Requirement with Frontend Payload");
        System.out.println("================================================================================");

        // Payload structured exactly as the frontend sends
        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-001")
                .clientId("CL-001") // Matching client for PRJ-001 in Supabase
                .requirementFeature("Live Cloud Resilience Hardening")
                .featureName("Live Cloud Resilience Hardening")
                .title("Live Cloud Resilience Hardening")
                .description("Automated multi-region failover and cache warming")
                .requirementType("Technical")
                .type("Technical")
                .priority("High")
                .ownerId("EMP-001")
                .status("In Progress")
                .completionPercentage(25)
                .requirementDate(LocalDate.now())
                .build();

        ResponseEntity<ApiResponse<RequirementResponse>> createRes = requirementController.createRequirement(request);
        assertNotNull(createRes.getBody());
        assertTrue(createRes.getBody().isSuccess());
        RequirementResponse created = createRes.getBody().getData();
        assertNotNull(created);
        String createdId = created.getRequirementId();
        assertNotNull(createdId);
        assertTrue(createdId.startsWith("REQ-"));
        System.out.println("POST /api/v1/requirements SUCCESS: Generated ID = " + createdId);

        try {
            System.out.println("================================================================================");
            System.out.println("STEP 2: Verify Record Directly in Supabase PostgreSQL Database");
            System.out.println("================================================================================");
            assertTrue(requirementRepository.existsById(createdId), "Record must exist in Supabase table project_requirements");
            ProjectRequirementEntity inDb = requirementRepository.findById(createdId).orElseThrow();
            assertEquals("PRJ-001", inDb.getProjectId());
            assertEquals("CL-001", inDb.getClientId());
            assertEquals("Live Cloud Resilience Hardening", inDb.getFeatureName());
            assertEquals("In Progress", inDb.getStatus());
            assertEquals(25, inDb.getCompletionPercentage());
            System.out.println("SUPABASE CONFIRMED: Found committed row in public.project_requirements: " + inDb.getRequirementId());

            System.out.println("================================================================================");
            System.out.println("STEP 3 & 4: Simulate Browser Refresh - Call GET API and Verify Returned Records");
            System.out.println("================================================================================");
            // On refresh, the frontend calls GET /api/v1/requirements?page=1&size=500
            ResponseEntity<ApiResponse<PageResponse<RequirementResponse>>> getRes = requirementController.getRequirements(
                    null, null, null, null, null, null, null, 1, 500
            );
            assertNotNull(getRes.getBody());
            assertTrue(getRes.getBody().isSuccess());
            PageResponse<RequirementResponse> page = getRes.getBody().getData();
            assertNotNull(page);
            assertFalse(page.getContent().isEmpty(), "GET API must return records after refresh");

            RequirementResponse foundInGet = page.getContent().stream()
                    .filter(r -> Objects.equals(r.getRequirementId(), createdId))
                    .findFirst()
                    .orElse(null);

            assertNotNull(foundInGet, "Newly created requirement MUST be present in GET API after browser refresh");
            assertEquals(createdId, foundInGet.getRequirementId());
            assertEquals("PRJ-001", foundInGet.getProjectId());
            assertEquals("CL-001", foundInGet.getClientId());
            assertEquals("Live Cloud Resilience Hardening", foundInGet.getFeatureName());
            assertEquals(25, foundInGet.getCompletionPercentage());
            System.out.println("GET /api/v1/requirements VERIFIED: Record persisted and successfully returned after refresh!");
        } finally {
            requirementRepository.deleteById(createdId);
            System.out.println("Cleaned up test requirement: " + createdId);
        }
    }
}

