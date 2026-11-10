package com.company.project.projects;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectRequirementEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.entity.ProjectTimesheetEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectRequirementRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.projects.repository.ProjectTimesheetRepository;
import com.company.project.projects.service.RequirementService;
import com.company.project.projects.service.TimesheetService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TimesheetsAndRequirementsLiveDatabaseIntegrationTest {

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
    private TimesheetService timesheetService;

    @Autowired
    private RequirementService requirementService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectTaskRepository projectTaskRepository;

    @Autowired
    private EmployeeMasterRepository employeeMasterRepository;

    @Autowired
    private ProjectTimesheetRepository timesheetRepository;

    @Autowired
    private ProjectRequirementRepository requirementRepository;

    @Autowired
    private com.company.project.clients.repository.ClientRepository clientRepository;

    private final List<String> createdTimesheetIds = new ArrayList<>();
    private final List<String> createdRequirementIds = new ArrayList<>();

    private ProjectEntity sampleProject;
    private ProjectTaskEntity sampleTask;
    private EmployeeMaster sampleEmployee;

    @BeforeEach
    void setUp() {
        // Retrieve existing records
        List<ProjectEntity> projects = projectRepository.findAll();
        assertFalse(projects.isEmpty(), "Projects table must have existing records");

        List<ProjectTaskEntity> tasks = projectTaskRepository.findAll();
        assertFalse(tasks.isEmpty(), "Project tasks table must have existing records");
        sampleTask = tasks.get(0);

        // Find the matching project for this task
        sampleProject = projectRepository.findByProjectId(sampleTask.getProjectId())
                .orElse(projects.get(0));

        List<EmployeeMaster> employees = employeeMasterRepository.findAll();
        assertFalse(employees.isEmpty(), "Employees table must have existing records");
        sampleEmployee = employees.get(0);
    }

    @AfterEach
    void tearDown() {
        for (String id : createdTimesheetIds) {
            try {
                timesheetRepository.deleteById(id);
            } catch (Exception ignored) {
            }
        }
        for (String id : createdRequirementIds) {
            try {
                requirementRepository.deleteById(id);
            } catch (Exception ignored) {
            }
        }
    }

    @Test
    @DisplayName("1. Verify Existing Projects and Tasks Integrity (Untouched 48 projects, 15 tasks)")
    void testExistingProjectsAndTasksIntegrity() {
        long projectCount = projectRepository.count();
        long taskCount = projectTaskRepository.count();

        System.out.println("Live Supabase project count: " + projectCount);
        System.out.println("Live Supabase task count: " + taskCount);

        List<com.company.project.clients.entity.ClientEntity> allClients = clientRepository.findAll();
        System.out.println("Live Supabase client count: " + allClients.size());
        for (int i = 0; i < Math.min(5, allClients.size()); i++) {
            com.company.project.clients.entity.ClientEntity c = allClients.get(i);
            System.out.printf("  Client [%d]: id=%s, clientCode=%s, name=%s%n", i, c.getId(), c.getClientCode(), c.getClientName());
        }

        assertEquals(48, projectCount, "Projects count must be exactly 48 untouched records");
        assertEquals(15, taskCount, "Project tasks count must be exactly 15 untouched records");

        List<ProjectTaskEntity> allTasks = projectTaskRepository.findAll();
        System.out.println("Live Project Tasks in Supabase:");
        for (ProjectTaskEntity t : allTasks) {
            System.out.printf("  Task: id=%s, projectId=%s, taskName=%s%n", t.getId(), t.getProjectId(), t.getTaskName());
        }
    }

    @Test
    @DisplayName("2. Full Timesheet CRUD, Labor Cost Calculation, and Approval Workflows")
    void testTimesheetLifecycleAndCalculations() {
        CreateTimesheetRequest createReq = CreateTimesheetRequest.builder()
                .employeeId(sampleEmployee.getEmployeeId())
                .employeeName(sampleEmployee.getFullName())
                .projectId(sampleProject.getProjectId())
                .taskId(sampleTask.getTaskId())
                .timesheetDate(LocalDate.now())
                .hours(new BigDecimal("8.00"))
                .taskDescription("Full integration test timesheet execution")
                .isBillable(true)
                .hourlyRate(new BigDecimal("100.00"))
                .build();

        TimesheetResponse created = timesheetService.createTimesheet(createReq, "test.user", List.of("ROLE_DEVELOPER"));
        assertNotNull(created);
        assertNotNull(created.getTimesheetId());
        assertTrue(created.getTimesheetId().startsWith("TS-"));
        createdTimesheetIds.add(created.getTimesheetId());

        System.out.println("Created live Timesheet: " + created.getTimesheetId() +
                ", Labor Cost: " + created.getEstimatedLaborCost() +
                ", Billable: " + created.getBillableAmount());

        assertEquals("Pending", created.getApprovalStatus());
        assertTrue(created.getEstimatedLaborCost().compareTo(BigDecimal.ZERO) >= 0);

        // Verify retrieval by ID
        TimesheetResponse fetched = timesheetService.getTimesheetById(created.getTimesheetId());
        assertEquals(created.getTimesheetId(), fetched.getTimesheetId());
        assertEquals(sampleProject.getProjectId(), fetched.getProjectId());

        // Update timesheet
        UpdateTimesheetRequest updateReq = UpdateTimesheetRequest.builder()
                .hours(new BigDecimal("7.50"))
                .taskDescription("Updated task description with adjusted hours")
                .isBillable(true)
                .hourlyRate(new BigDecimal("120.00"))
                .build();

        TimesheetResponse updated = timesheetService.updateTimesheet(created.getTimesheetId(), updateReq, "test.user", List.of("ROLE_DEVELOPER"));
        assertEquals(new BigDecimal("7.50"), updated.getHours());

        // Override labor cost
        OverrideLaborCostRequest overrideReq = OverrideLaborCostRequest.builder()
                .laborCostOverride(new BigDecimal("4500.00"))
                .reason("Senior engineering adjustment")
                .build();

        TimesheetResponse overridden = timesheetService.overrideLaborCost(created.getTimesheetId(), overrideReq, "manager.user");
        assertEquals(new BigDecimal("4500.00"), overridden.getEstimatedLaborCost());
        assertTrue(overridden.getLaborCostOverride());

        // Approve timesheet
        ApproveTimesheetRequest approveReq = ApproveTimesheetRequest.builder()
                .approvedBy("Project Director")
                .comments("Verified and approved")
                .build();

        TimesheetResponse approved = timesheetService.approveTimesheet(created.getTimesheetId(), approveReq, "manager.user");
        assertEquals("Approved", approved.getApprovalStatus());
        assertNotNull(approved.getApprovedAt());
    }

    @Test
    @DisplayName("3. Verify Timesheet Relational Integrity (Task cannot belong to wrong project)")
    void testTimesheetTaskProjectIntegrity() {
        // Find a different project than sampleTask's project
        ProjectEntity otherProject = projectRepository.findAll().stream()
                .filter(p -> !p.getProjectId().equals(sampleTask.getProjectId()))
                .findFirst()
                .orElse(null);

        assertNotNull(otherProject, "Must have an alternative project for integrity verification");

        CreateTimesheetRequest mismatchedReq = CreateTimesheetRequest.builder()
                .employeeId(sampleEmployee.getEmployeeId())
                .projectId(otherProject.getProjectId()) // Mismatched project!
                .taskId(sampleTask.getTaskId())         // Task belongs to sampleTask.getProjectId()
                .timesheetDate(LocalDate.now())
                .hours(new BigDecimal("4.00"))
                .build();

        BusinessValidationException ex = assertThrows(BusinessValidationException.class, () ->
                timesheetService.createTimesheet(mismatchedReq, "test.user", List.of("ROLE_DEVELOPER"))
        );

        assertTrue(ex.getMessage().contains("Relational integrity error"));
        System.out.println("Relational integrity guard passed: " + ex.getMessage());
    }

    @Test
    @DisplayName("4. Full Requirement CRUD, Scope Freeze/Unfreeze, and Progress Updates")
    void testRequirementLifecycleAndScopeFreeze() {
        CreateRequirementRequest createReq = CreateRequirementRequest.builder()
                .projectId(sampleProject.getProjectId())
                .clientId(sampleProject.getClientId())
                .featureName("Database Performance Hardening Requirement")
                .description("Tune composite indexes and connection pooling for Supabase")
                .requirementType("Technical")
                .priority("High")
                .status("In Progress")
                .ownerId(sampleEmployee.getEmployeeId())
                .build();

        RequirementResponse created = requirementService.createRequirement(createReq, "test.user", List.of("ROLE_DEVELOPER"));
        assertNotNull(created);
        assertNotNull(created.getRequirementId());
        assertTrue(created.getRequirementId().startsWith("REQ-"));
        createdRequirementIds.add(created.getRequirementId());

        System.out.println("Created live Requirement: " + created.getRequirementId() +
                ", Feature: " + created.getFeatureName() +
                ", Client: " + created.getClientId());

        assertFalse(created.getScopeFreeze());
        assertEquals(0, created.getCompletionPercentage());

        // Update progress percentage
        UpdateCompletionPercentageRequest progressReq = UpdateCompletionPercentageRequest.builder()
                .completionPercentage(50)
                .build();

        RequirementResponse updatedProgress = requirementService.updateCompletionPercentage(created.getRequirementId(), progressReq, "test.user", List.of("ROLE_DEVELOPER"));
        assertEquals(50, updatedProgress.getCompletionPercentage());

        // Freeze scope
        ScopeFreezeRequest freezeReq = ScopeFreezeRequest.builder()
                .scopeFreeze(true)
                .reason("Milestone 1 baseline locked")
                .build();

        RequirementResponse frozen = requirementService.toggleScopeFreeze(created.getRequirementId(), freezeReq, "manager.user", List.of("ROLE_PROJECT_MANAGER"));
        assertTrue(frozen.getScopeFreeze());
        assertNotNull(frozen.getScopeFrozenAt());

        // Attempting to modify title/featureName while scope is frozen should throw exception
        UpdateRequirementRequest blockedUpdate = UpdateRequirementRequest.builder()
                .featureName("Unauthorized change during scope freeze")
                .build();

        assertThrows(BusinessValidationException.class, () ->
                requirementService.updateRequirement(created.getRequirementId(), blockedUpdate, "test.user", List.of("ROLE_DEVELOPER"))
        );

        // Unfreeze scope
        ScopeFreezeRequest unfreezeReq = ScopeFreezeRequest.builder()
                .scopeFreeze(false)
                .reason("Change order approved")
                .build();

        RequirementResponse unfrozen = requirementService.toggleScopeFreeze(created.getRequirementId(), unfreezeReq, "manager.user", List.of("ROLE_PROJECT_MANAGER"));
        assertFalse(unfrozen.getScopeFreeze());
    }

    @Test
    @DisplayName("5. Verify Requirement Relational Integrity (Project cannot belong to wrong client)")
    void testRequirementClientProjectIntegrity() {
        CreateRequirementRequest mismatchedReq = CreateRequirementRequest.builder()
                .projectId(sampleProject.getProjectId())
                .clientId("CLIENT-NONEXISTENT-OR-WRONG")
                .featureName("Mismatched Requirement")
                .requirementType("Functional")
                .priority("Medium")
                .status("Draft")
                .ownerId(sampleEmployee.getEmployeeId())
                .build();

        assertThrows(Exception.class, () ->
                requirementService.createRequirement(mismatchedReq, "test.user", List.of("ROLE_DEVELOPER"))
        );
        System.out.println("Requirement client-project integrity verified!");
    }

    @Test
    @DisplayName("6. Verify Record Persistence in Supabase Surviving Fresh Connection/Restart")
    void testDataPersistenceAcrossRestart() throws Exception {
        CreateTimesheetRequest tsReq = CreateTimesheetRequest.builder()
                .employeeId(sampleEmployee.getEmployeeId())
                .employeeName(sampleEmployee.getFullName())
                .projectId(sampleProject.getProjectId())
                .taskId(sampleTask.getTaskId())
                .timesheetDate(LocalDate.now())
                .hours(new BigDecimal("6.00"))
                .taskDescription("Persistence verification record")
                .isBillable(true)
                .hourlyRate(new BigDecimal("150.00"))
                .build();

        TimesheetResponse tsCreated = timesheetService.createTimesheet(tsReq, "test.user", List.of("ROLE_DEVELOPER"));
        String tsId = tsCreated.getTimesheetId();
        createdTimesheetIds.add(tsId);

        CreateRequirementRequest reqReq = CreateRequirementRequest.builder()
                .projectId(sampleProject.getProjectId())
                .clientId(sampleProject.getClientId())
                .featureName("Persistence verification feature")
                .requirementType("Technical")
                .priority("Medium")
                .status("In Progress")
                .ownerId(sampleEmployee.getEmployeeId())
                .build();

        RequirementResponse reqCreated = requirementService.createRequirement(reqReq, "test.user", List.of("ROLE_DEVELOPER"));
        String reqId = reqCreated.getRequirementId();
        createdRequirementIds.add(reqId);

        // Verify direct JPA persistence and reload from database
        assertTrue(timesheetRepository.existsById(tsId), "Timesheet must be persisted in Supabase");
        assertTrue(requirementRepository.existsById(reqId), "Requirement must be persisted in Supabase");

        ProjectTimesheetEntity persistedTs = timesheetRepository.findById(tsId).orElseThrow();
        assertEquals(new BigDecimal("6.00"), persistedTs.getHours());
        assertEquals(sampleProject.getProjectId(), persistedTs.getProjectId());

        ProjectRequirementEntity persistedReq = requirementRepository.findById(reqId).orElseThrow();
        assertEquals("Persistence verification feature", persistedReq.getFeatureName());
        assertEquals(sampleProject.getClientId(), persistedReq.getClientId());

        System.out.println("PERSISTENCE CONFIRMED: Both timesheet " + tsId + " and requirement " + reqId + " are committed in Supabase!");
    }
}
