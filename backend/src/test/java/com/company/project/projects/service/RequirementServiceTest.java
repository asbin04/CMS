package com.company.project.projects.service;

import com.company.project.clients.entity.ClientEntity;
import com.company.project.clients.repository.ClientRepository;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectRequirementEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectRequirementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RequirementServiceTest {

    private ProjectRequirementRepository requirementRepository;
    private ProjectRepository projectRepository;
    private ClientRepository clientRepository;
    private EmployeeMasterRepository employeeMasterRepository;
    private ProjectModuleIdGenerator idGeneratorService;
    private RequirementService requirementService;

    // Test state
    private final Map<String, ProjectEntity> projectMap = new HashMap<>();
    private final Map<String, ClientEntity> clientMap = new HashMap<>();
    private final Map<String, ProjectRequirementEntity> requirementMap = new HashMap<>();
    private String generatedReqId = "REQ-2026-0186";
    private long totalCount = 0;
    private final Map<String, Long> statusCounts = new HashMap<>();
    private long frozenCount = 0;

    @SuppressWarnings("unchecked")
    private static <T> T createProxy(Class<T> type, InvocationHandler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
    }

    @BeforeEach
    void setUp() {
        projectMap.clear();
        clientMap.clear();
        requirementMap.clear();
        statusCounts.clear();

        projectRepository = createProxy(ProjectRepository.class, (proxy, method, args) -> {
            if ("findByProjectId".equals(method.getName())) {
                return Optional.ofNullable(projectMap.get(args[0]));
            }
            return defaultValue(method.getReturnType());
        });

        clientRepository = createProxy(ClientRepository.class, (proxy, method, args) -> {
            if ("findById".equals(method.getName())) {
                return Optional.ofNullable(clientMap.get(args[0]));
            }
            return defaultValue(method.getReturnType());
        });

        employeeMasterRepository = createProxy(EmployeeMasterRepository.class, (proxy, method, args) -> {
            if ("findByEmployeeId".equals(method.getName())) {
                return Optional.empty();
            }
            return defaultValue(method.getReturnType());
        });

        idGeneratorService = createProxy(ProjectModuleIdGenerator.class, (proxy, method, args) -> {
            if ("generateRequirementId".equals(method.getName())) {
                return generatedReqId;
            }
            return defaultValue(method.getReturnType());
        });

        requirementRepository = createProxy(ProjectRequirementRepository.class, (proxy, method, args) -> {
            String name = method.getName();
            if ("findByRequirementId".equals(name)) {
                return Optional.ofNullable(requirementMap.get(args[0]));
            } else if ("save".equals(name)) {
                ProjectRequirementEntity entity = (ProjectRequirementEntity) args[0];
                requirementMap.put(entity.getRequirementId(), entity);
                return entity;
            } else if ("count".equals(name)) {
                return totalCount;
            } else if ("countByStatusIgnoreCase".equals(name)) {
                return statusCounts.getOrDefault(((String) args[0]).toLowerCase(), 0L);
            } else if ("countByScopeFreezeTrue".equals(name)) {
                return frozenCount;
            }
            return defaultValue(method.getReturnType());
        });

        requirementService = new RequirementService(
                requirementRepository,
                projectRepository,
                clientRepository,
                employeeMasterRepository,
                idGeneratorService
        );
    }

    private static Object defaultValue(Class<?> returnType) {
        if (returnType.equals(boolean.class)) return false;
        if (returnType.equals(int.class)) return 0;
        if (returnType.equals(long.class)) return 0L;
        if (returnType.equals(Optional.class)) return Optional.empty();
        return null;
    }

    @Test
    @DisplayName("Should create requirement and enforce composite project-client relationship")
    void shouldCreateRequirement() {
        LocalDate date = LocalDate.of(2026, 10, 28);
        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-001")
                .clientId("CL-001")
                .requirementDate(date)
                .requirementType("Feature")
                .featureName("Appointment Booking")
                .description("Patient booking workflow")
                .priority("High")
                .ownerId("EMP-001")
                .status("In Progress")
                .completionPercentage(45)
                .build();

        projectMap.put("PRJ-001", ProjectEntity.builder().projectId("PRJ-001").clientId("CL-001").build());
        clientMap.put("CL-001", ClientEntity.builder().id("CL-001").clientName("TCS").build());
        generatedReqId = "REQ-2026-0186";

        RequirementResponse response = requirementService.createRequirement(request, "amit.sharma", List.of("ROLE_USER"));

        assertThat(response.getRequirementId()).isEqualTo("REQ-2026-0186");
        assertThat(response.getFeatureName()).isEqualTo("Appointment Booking");
        assertThat(response.getPriority()).isEqualTo("High");
        assertThat(response.getCompletionPercentage()).isEqualTo(45);
        assertThat(response.getScopeFreezeText()).isEqualTo("No");
    }

    @Test
    @DisplayName("Should reject requirement creation when client does not match project client")
    void shouldRejectWhenClientDoesNotMatchProject() {
        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-001") // Belongs to CL-001
                .clientId("CL-002") // Mismatched client!
                .ownerId("EMP-001")
                .build();

        projectMap.put("PRJ-001", ProjectEntity.builder().projectId("PRJ-001").clientId("CL-001").build());
        clientMap.put("CL-002", ClientEntity.builder().id("CL-002").build());

        assertThatThrownBy(() -> requirementService.createRequirement(request, "amit.sharma", List.of("ROLE_USER")))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Relational integrity error: Project 'PRJ-001' belongs to client 'CL-001', not 'CL-002'");
    }

    @Test
    @DisplayName("Should prevent regular user from updating a scope-frozen requirement")
    void shouldPreventRegularUserUpdatingFrozenRequirement() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0182")
                .scopeFreeze(true)
                .build();

        requirementMap.put("REQ-2026-0182", existing);

        UpdateRequirementRequest update = UpdateRequirementRequest.builder()
                .featureName("Updated Feature")
                .build();

        assertThatThrownBy(() -> requirementService.updateRequirement("REQ-2026-0182", update, "developer", List.of("ROLE_USER")))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("is scope frozen");
    }

    @Test
    @DisplayName("Should allow manager or admin to update a scope-frozen requirement")
    void shouldAllowManagerToUpdateFrozenRequirement() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0182")
                .scopeFreeze(true)
                .completionPercentage(100)
                .status("Completed")
                .build();

        requirementMap.put("REQ-2026-0182", existing);

        UpdateRequirementRequest update = UpdateRequirementRequest.builder()
                .description("Manager updated description")
                .build();

        RequirementResponse response = requirementService.updateRequirement("REQ-2026-0182", update, "akshit.ujjain", List.of("ROLE_CEO"));

        assertThat(response.getDescription()).isEqualTo("Manager updated description");
    }

    @Test
    @DisplayName("Should toggle scope freeze and record auditor metadata")
    void shouldToggleScopeFreeze() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0186")
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0186", existing);

        ScopeFreezeRequest freezeReq = ScopeFreezeRequest.builder().scopeFreeze(true).reason("Client milestone baseline").build();
        RequirementResponse response = requirementService.toggleScopeFreeze("REQ-2026-0186", freezeReq, "manager.akshit", List.of("ROLE_MANAGER"));

        assertThat(response.getScopeFreeze()).isTrue();
        assertThat(response.getScopeFreezeText()).isEqualTo("Yes");
        assertThat(response.getScopeFrozenBy()).isEqualTo("manager.akshit");
        assertThat(response.getScopeFrozenAt()).isNotNull();
    }

    @Test
    @DisplayName("Should auto-complete status when completion percentage reaches 100")
    void shouldAutoCompleteWhenProgressReaches100() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0185")
                .status("In Progress")
                .completionPercentage(60)
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0185", existing);

        UpdateCompletionPercentageRequest req = UpdateCompletionPercentageRequest.builder().completionPercentage(100).build();
        RequirementResponse response = requirementService.updateCompletionPercentage("REQ-2026-0185", req, "developer", List.of("ROLE_USER"));

        assertThat(response.getCompletionPercentage()).isEqualTo(100);
        assertThat(response.getStatus()).isEqualTo("Completed");
    }

    @Test
    @DisplayName("Should retrieve aggregated requirement KPIs")
    void shouldRetrieveRequirementKpis() {
        totalCount = 186L;
        statusCounts.put("in progress", 78L);
        statusCounts.put("completed", 64L);
        statusCounts.put("pending approval", 18L);
        frozenCount = 26L;

        RequirementKpisResponse kpis = requirementService.getKpis();

        assertThat(kpis.getTotalRequirements()).isEqualTo(186L);
        assertThat(kpis.getInProgress()).isEqualTo(78L);
        assertThat(kpis.getCompleted()).isEqualTo(64L);
        assertThat(kpis.getPendingApproval()).isEqualTo(18L);
        assertThat(kpis.getScopeFrozen()).isEqualTo(26L);
    }

    @Test
    @DisplayName("When created with In Progress, approvedBy and approvalDate must remain null")
    void whenCreatedWithInProgress_approvedByAndApprovalDateAreNull() {
        projectMap.put("PRJ-005", ProjectEntity.builder().projectId("PRJ-005").clientId("CL-006").build());
        clientMap.put("CL-006", ClientEntity.builder().id("CL-006").clientCode("CL-006").build());

        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Appointment Rescheduling")
                .requirementDate(LocalDate.of(2026, 10, 29))
                .ownerId("EMP-004")
                .status("In Progress")
                .priority("High")
                .build();

        RequirementResponse response = requirementService.createRequirement(request, "akshit.ujjain", List.of("ROLE_CEO"));

        assertThat(response.getStatus()).isEqualTo("In Progress");
        assertThat(response.getApprovedBy()).isNull();
        assertThat(response.getApprovalDate()).isNull();

        ProjectRequirementEntity saved = requirementMap.get(response.getRequirementId());
        assertThat(saved).isNotNull();
        assertThat(saved.getApprovedBy()).isNull();
        assertThat(saved.getApprovalDate()).isNull();
    }

    @Test
    @DisplayName("When authorized user changes status to Completed, automatically populate Akshit Ujjain and today")
    void whenAuthorizedUserCompletes_automaticallyPopulatesApproverNameAndDate() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0182")
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Existing Feature")
                .ownerId("EMP-004")
                .status("In Progress")
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0182", existing);

        UpdateRequirementStatusRequest req = UpdateRequirementStatusRequest.builder()
                .status("Completed")
                .build();

        RequirementResponse response = requirementService.updateStatus("REQ-2026-0182", req, "akshit.ujjain", List.of("ROLE_CEO"));

        assertThat(response.getStatus()).isEqualTo("Completed");
        assertThat(response.getCompletionPercentage()).isEqualTo(100);
        assertThat(response.getApprovedBy()).isEqualTo("Akshit Ujjain");
        assertThat(response.getApprovalDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("When approveRequirement is called, automatically populate Akshit Ujjain and today")
    void whenApproveRequirementCalled_automaticallyPopulatesApproverNameAndDate() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0183")
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Feature to approve")
                .ownerId("EMP-004")
                .status("Pending Approval")
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0183", existing);

        RequirementResponse response = requirementService.approveRequirement("REQ-2026-0183", "akshit.ujjain", List.of("ROLE_ADMIN"));

        assertThat(response.getStatus()).isEqualTo("Completed");
        assertThat(response.getCompletionPercentage()).isEqualTo(100);
        assertThat(response.getApprovedBy()).isEqualTo("Akshit Ujjain");
        assertThat(response.getApprovalDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("When reopened from Completed, clear approvedBy and approvalDate")
    void whenReopenedFromCompleted_clearsApprovalMetadata() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0184")
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Completed Feature")
                .ownerId("EMP-004")
                .status("Completed")
                .approvedBy("Akshit Ujjain")
                .approvalDate(LocalDate.now())
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0184", existing);

        UpdateRequirementStatusRequest req = UpdateRequirementStatusRequest.builder()
                .status("In Progress")
                .build();

        RequirementResponse response = requirementService.updateStatus("REQ-2026-0184", req, "akshit.ujjain", List.of("ROLE_CEO"));

        assertThat(response.getStatus()).isEqualTo("In Progress");
        assertThat(response.getApprovedBy()).isNull();
        assertThat(response.getApprovalDate()).isNull();
    }

    @Test
    @DisplayName("When unauthorized user attempts to approve or complete, reject with BusinessValidationException")
    void whenUnauthorizedUserAttemptsToComplete_rejects() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0185")
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Pending Feature")
                .ownerId("EMP-004")
                .status("Pending Approval")
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0185", existing);

        UpdateRequirementStatusRequest req = UpdateRequirementStatusRequest.builder()
                .status("Completed")
                .build();

        assertThatThrownBy(() -> requirementService.updateStatus("REQ-2026-0185", req, "regular.user", List.of("ROLE_USER")))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Only managers, CEOs, and administrators can approve or complete requirements");
    }

    @Test
    @DisplayName("When MD Gaurav Tripathy approves requirement, populate Gaurav Tripathy and today's date")
    void whenMdGauravApprovesRequirement_automaticallyPopulatesGauravNameAndDate() {
        ProjectRequirementEntity existing = ProjectRequirementEntity.builder()
                .requirementId("REQ-2026-0186")
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("MD Approval Test Feature")
                .ownerId("EMP-004")
                .status("Pending Approval")
                .assignedApprover("MD – Gaurav Tripathy")
                .scopeFreeze(false)
                .build();

        requirementMap.put("REQ-2026-0186", existing);

        RequirementResponse response = requirementService.approveRequirement("REQ-2026-0186", "gaurav.tripathy", List.of("ROLE_MD"));

        assertThat(response.getStatus()).isEqualTo("Completed");
        assertThat(response.getCompletionPercentage()).isEqualTo(100);
        assertThat(response.getApprovedBy()).isEqualTo("Gaurav Tripathy");
        assertThat(response.getApprovalDate()).isEqualTo(LocalDate.now());
        assertThat(response.getAssignedApprover()).isEqualTo("MD – Gaurav Tripathy");
    }

    @Test
    @DisplayName("When creating requirement with assigned approver, approver is persisted but approvedBy/approvalDate remain null")
    void whenCreatingRequirement_assignedApproverIsPersistedAndApprovalDataNull() {
        ProjectEntity project = ProjectEntity.builder()
                .projectId("PRJ-005")
                .clientId("CL-006")
                .projectName("Test Project")
                .build();
        projectMap.put("PRJ-005", project);

        ClientEntity client = ClientEntity.builder()
                .id("CL-006")
                .clientCode("CL-006")
                .clientName("Test Client")
                .companyName("Test Client Corp")
                .build();
        clientMap.put("CL-006", client);

        CreateRequirementRequest request = CreateRequirementRequest.builder()
                .projectId("PRJ-005")
                .clientId("CL-006")
                .featureName("Approver Dropdown Feature")
                .ownerId("EMP-004")
                .status("In Progress")
                .assignedApprover("MD – Gaurav Tripathy")
                .build();

        RequirementResponse response = requirementService.createRequirement(request, "regular.user", List.of("ROLE_USER"));

        assertThat(response.getAssignedApprover()).isEqualTo("MD – Gaurav Tripathy");
        assertThat(response.getApprovedBy()).isNull();
        assertThat(response.getApprovalDate()).isNull();
    }
}
