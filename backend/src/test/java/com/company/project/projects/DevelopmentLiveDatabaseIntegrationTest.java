package com.company.project.projects;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectRequirementEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectDevelopmentRepository;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectRequirementRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.projects.service.DevelopmentService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class DevelopmentLiveDatabaseIntegrationTest {

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
    private DevelopmentService developmentService;

    @Autowired
    private ProjectDevelopmentRepository developmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectRequirementRepository requirementRepository;

    @Autowired
    private ProjectTaskRepository taskRepository;

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    private final List<String> createdDevelopmentIds = new ArrayList<>();

    private ProjectEntity validProject;
    private ProjectRequirementEntity validRequirement;
    private ProjectTaskEntity validTask;
    private EmployeeMaster validEmployee;

    @BeforeEach
    void setUp() {
        // Find existing entities with matching relationships
        List<ProjectRequirementEntity> requirements = requirementRepository.findAll();
        assertFalse(requirements.isEmpty(), "Must have existing requirements");

        for (ProjectRequirementEntity req : requirements) {
            List<ProjectTaskEntity> tasks = taskRepository.findByProjectIdOrderByIdAsc(req.getProjectId());
            if (!tasks.isEmpty()) {
                validRequirement = req;
                validTask = tasks.get(0);
                validProject = projectRepository.findByProjectId(req.getProjectId()).orElseThrow();
                break;
            }
        }

        if (validRequirement == null) {
            validRequirement = requirements.get(0);
            validProject = projectRepository.findByProjectId(validRequirement.getProjectId()).orElseThrow();
            // Create a test task for this project if none exist
            validTask = taskRepository.save(ProjectTaskEntity.builder()
                    .id("TSK-TEST-DEV")
                    .projectId(validProject.getProjectCode())
                    .taskName("Test Task for Development")
                    .build());
        }

        List<EmployeeMaster> employees = employeeMasterRepository.findAll();
        assertFalse(employees.isEmpty(), "Must have existing employees");
        validEmployee = employees.get(0);
    }

    @AfterEach
    void tearDown() {
        for (String devId : createdDevelopmentIds) {
            try {
                developmentRepository.deleteById(devId);
            } catch (Exception ignored) {
            }
        }
        createdDevelopmentIds.clear();
    }

    @Test
    @DisplayName("1. Next ID Preview and Atomic ID Generation")
    void testNextIdAndGeneration() {
        String previewId = developmentService.getNextDevelopmentId();
        assertNotNull(previewId);
        assertTrue(previewId.matches("DEV-\\d{4}-\\d{4}"), "ID must match DEV-YYYY-NNNN format: " + previewId);

        CreateDevelopmentRequest req = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .developerName(validEmployee.getFullName())
                .repositoryUrl("https://github.com/company/repo-test")
                .branch("feature/test-atomic-id")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .codeReviewStatus("In Review")
                .qaHandoffDate(LocalDate.now())
                .status("In Progress")
                .build();

        DevelopmentResponse created = developmentService.createDevelopment(req, "test-user");
        assertNotNull(created);
        createdDevelopmentIds.add(created.getDevelopmentId());

        assertTrue(created.getDevelopmentId().matches("DEV-\\d{4}-\\d{4}"));
        assertEquals(validProject.getProjectCode(), created.getProjectId());
        assertEquals(validEmployee.getFullName(), created.getDeveloperName());
    }

    @Test
    @DisplayName("2. Complete CRUD Lifecycle")
    void testCrudLifecycle() {
        // CREATE
        CreateDevelopmentRequest createReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerName(validEmployee.getFullName())
                .repositoryUrl("https://github.com/company/repo-crud")
                .branch("feature/crud-test")
                .environment("Dev")
                .buildVersion("v1.0.1")
                .codeReviewStatus("In Review")
                .status("In Progress")
                .technicalNotes("Initial technical notes")
                .documentationLink("https://docs.company.com/dev-1")
                .build();

        DevelopmentResponse created = developmentService.createDevelopment(createReq, "dev-tester");
        createdDevelopmentIds.add(created.getDevelopmentId());

        // READ
        DevelopmentResponse fetched = developmentService.getDevelopmentById(created.getDevelopmentId());
        assertEquals(created.getDevelopmentId(), fetched.getDevelopmentId());
        assertEquals("feature/crud-test", fetched.getBranch());
        assertEquals("Initial technical notes", fetched.getTechnicalNotes());

        // UPDATE
        UpdateDevelopmentRequest updateReq = UpdateDevelopmentRequest.builder()
                .branch("feature/crud-test-updated")
                .buildVersion("v1.0.2")
                .technicalNotes("Updated technical notes")
                .build();

        DevelopmentResponse updated = developmentService.updateDevelopment(created.getDevelopmentId(), updateReq, "dev-tester-2");
        assertEquals("feature/crud-test-updated", updated.getBranch());
        assertEquals("v1.0.2", updated.getBuildVersion());
        assertEquals("Updated technical notes", updated.getTechnicalNotes());
        assertEquals("dev-tester-2", updated.getUpdatedBy());

        // DELETE
        developmentService.deleteDevelopment(created.getDevelopmentId(), "dev-tester");
        assertThrows(ResourceNotFoundException.class, () -> developmentService.getDevelopmentById(created.getDevelopmentId()));
    }

    @Test
    @DisplayName("3. Patch Status and Code Review Status")
    void testPatchStatuses() {
        CreateDevelopmentRequest createReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo-patch")
                .branch("feature/patch-test")
                .environment("QA")
                .buildVersion("v2.0.0")
                .codeReviewStatus("In Review")
                .status("In Progress")
                .build();

        DevelopmentResponse created = developmentService.createDevelopment(createReq, "status-tester");
        createdDevelopmentIds.add(created.getDevelopmentId());

        // Update status to QA
        DevelopmentResponse statusUpdated = developmentService.updateStatus(
                created.getDevelopmentId(),
                UpdateDevelopmentStatusRequest.builder().status("QA").build(),
                "status-tester"
        );
        assertEquals("QA", statusUpdated.getStatus());

        // Update code review status to Approved
        DevelopmentResponse reviewUpdated = developmentService.updateCodeReviewStatus(
                created.getDevelopmentId(),
                UpdateCodeReviewStatusRequest.builder().codeReviewStatus("Approved").build(),
                "status-tester"
        );
        assertEquals("Approved", reviewUpdated.getCodeReviewStatus());
    }

    @Test
    @DisplayName("4. Relational Integrity Validations (Cross-Project Violations)")
    void testRelationalIntegrityValidations() {
        // Non-existent project
        CreateDevelopmentRequest invalidProjectReq = CreateDevelopmentRequest.builder()
                .projectId("PRJ-NONEXISTENT-999")
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/test")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidProjectReq, "tester"));

        // Invalid requirement
        CreateDevelopmentRequest invalidReqReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId("REQ-FAKE-999")
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/test")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidReqReq, "tester"));

        // Invalid task
        CreateDevelopmentRequest invalidTaskReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId("TSK-FAKE-999")
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/test")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidTaskReq, "tester"));

        // Unresolvable developer
        CreateDevelopmentRequest invalidDevReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerName("NonExistentDeveloperXYZ")
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/test")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidDevReq, "tester"));

        // Invalid environment
        CreateDevelopmentRequest invalidEnvReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo")
                .branch("feature/test")
                .environment("InvalidEnv")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidEnvReq, "tester"));

        // Invalid URLs
        CreateDevelopmentRequest invalidUrlReq = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("not-a-valid-url")
                .branch("feature/test")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .build();

        assertThrows(BusinessValidationException.class, () -> developmentService.createDevelopment(invalidUrlReq, "tester"));
    }

    @Test
    @DisplayName("5. Dynamic KPIs and Trend Calculation")
    void testDynamicKpis() {
        DevelopmentKpisResponse initialKpis = developmentService.getKpis();
        assertNotNull(initialKpis);

        CreateDevelopmentRequest req1 = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerId(validEmployee.getEmployeeId())
                .repositoryUrl("https://github.com/company/repo-kpi")
                .branch("feature/kpi-1")
                .environment("Dev")
                .buildVersion("v1.0.0")
                .codeReviewStatus("In Review")
                .status("In Progress")
                .build();

        DevelopmentResponse dev1 = developmentService.createDevelopment(req1, "kpi-tester");
        createdDevelopmentIds.add(dev1.getDevelopmentId());

        DevelopmentKpisResponse updatedKpis = developmentService.getKpis();
        assertEquals(initialKpis.getTotalDevelopments() + 1, updatedKpis.getTotalDevelopments());
        assertEquals(initialKpis.getInDevelopment() + 1, updatedKpis.getInDevelopment());
        assertEquals(initialKpis.getInCodeReview() + 1, updatedKpis.getInCodeReview());
    }

    @Test
    @DisplayName("6. Search, Filter, Pagination, and Sorting")
    void testSearchAndPagination() {
        CreateDevelopmentRequest req = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerName(validEmployee.getFullName())
                .repositoryUrl("https://github.com/company/repo-filter")
                .branch("feature/special-branch-name-1234")
                .environment("Staging")
                .buildVersion("v3.0.0")
                .codeReviewStatus("Changes Requested")
                .status("QA")
                .build();

        DevelopmentResponse dev = developmentService.createDevelopment(req, "search-tester");
        createdDevelopmentIds.add(dev.getDevelopmentId());

        // Search by developer name
        PageResponse<DevelopmentResponse> searchRes = developmentService.getDevelopments(
                validEmployee.getFullName(), null, null, null, null, "createdAt,desc", 1, 10
        );
        assertTrue(searchRes.getContent().stream().anyMatch(d -> d.getDevelopmentId().equals(dev.getDevelopmentId())));

        // Filter by environment 'Staging'
        PageResponse<DevelopmentResponse> envRes = developmentService.getDevelopments(
                null, null, "Staging", null, null, "createdAt,desc", 1, 10
        );
        assertTrue(envRes.getContent().stream().anyMatch(d -> d.getDevelopmentId().equals(dev.getDevelopmentId())));

        // Filter by code review status 'Changes Requested'
        PageResponse<DevelopmentResponse> reviewRes = developmentService.getDevelopments(
                null, null, null, null, "Changes Requested", "createdAt,desc", 1, 10
        );
        assertTrue(reviewRes.getContent().stream().anyMatch(d -> d.getDevelopmentId().equals(dev.getDevelopmentId())));
    }

    @Test
    @DisplayName("7. CSV Export")
    void testCsvExport() {
        CreateDevelopmentRequest req = CreateDevelopmentRequest.builder()
                .projectId(validProject.getProjectCode())
                .requirementId(validRequirement.getRequirementId())
                .taskId(validTask.getId())
                .developerName(validEmployee.getFullName())
                .repositoryUrl("https://github.com/company/repo-csv")
                .branch("feature/csv-export")
                .environment("Prod")
                .buildVersion("v4.0.0")
                .codeReviewStatus("Approved")
                .status("Released")
                .technicalNotes("Export notes with , commas and \" quotes")
                .build();

        DevelopmentResponse dev = developmentService.createDevelopment(req, "csv-tester");
        createdDevelopmentIds.add(dev.getDevelopmentId());

        byte[] csvBytes = developmentService.exportDevelopmentsToCsv(null, null, null, null, null);
        assertNotNull(csvBytes);
        assertTrue(csvBytes.length > 0);

        String csvString = new String(csvBytes, StandardCharsets.UTF_8);
        assertTrue(csvString.startsWith("Development ID,Project ID,Requirement ID,Task / Ticket ID"));
        assertTrue(csvString.contains(dev.getDevelopmentId()));
        assertTrue(csvString.contains("feature/csv-export"));
    }
}

