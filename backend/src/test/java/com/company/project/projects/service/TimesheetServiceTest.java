package com.company.project.projects.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.dashboard.entity.EmployeeMaster;
import com.company.project.dashboard.repository.EmployeeMasterRepository;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.entity.ProjectTimesheetEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.projects.repository.ProjectTimesheetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TimesheetServiceTest {

    private ProjectTimesheetRepository timesheetRepository;
    private ProjectRepository projectRepository;
    private ProjectTaskRepository projectTaskRepository;
    private EmployeeMasterRepository employeeMasterRepository;
    private ProjectModuleIdGenerator idGeneratorService;
    private TimesheetService timesheetService;

    // Test state
    private final Map<String, ProjectEntity> projectMap = new HashMap<>();
    private final Map<String, ProjectTaskEntity> taskMap = new HashMap<>();
    private final Map<String, EmployeeMaster> employeeMap = new HashMap<>();
    private final Map<String, ProjectTimesheetEntity> timesheetMap = new HashMap<>();
    private String generatedTimesheetId = "TS-202610-049";
    private BigDecimal totalHours = BigDecimal.ZERO;
    private BigDecimal billableHours = BigDecimal.ZERO;
    private BigDecimal billableAmount = BigDecimal.ZERO;
    private long pendingApprovals = 0L;

    @SuppressWarnings("unchecked")
    private static <T> T createProxy(Class<T> type, InvocationHandler handler) {
        return (T) Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
    }

    @BeforeEach
    void setUp() {
        projectMap.clear();
        taskMap.clear();
        employeeMap.clear();
        timesheetMap.clear();

        projectRepository = createProxy(ProjectRepository.class, (proxy, method, args) -> {
            if ("findByProjectId".equals(method.getName())) {
                return Optional.ofNullable(projectMap.get(args[0]));
            }
            return defaultValue(method.getReturnType());
        });

        projectTaskRepository = createProxy(ProjectTaskRepository.class, (proxy, method, args) -> {
            if ("findByTaskId".equals(method.getName())) {
                return Optional.ofNullable(taskMap.get(args[0]));
            }
            return defaultValue(method.getReturnType());
        });

        employeeMasterRepository = createProxy(EmployeeMasterRepository.class, (proxy, method, args) -> {
            if ("findByEmployeeId".equals(method.getName())) {
                return Optional.ofNullable(employeeMap.get(args[0]));
            }
            if ("findAll".equals(method.getName())) {
                return new ArrayList<>(employeeMap.values());
            }
            return defaultValue(method.getReturnType());
        });

        idGeneratorService = createProxy(ProjectModuleIdGenerator.class, (proxy, method, args) -> {
            if ("generateTimesheetId".equals(method.getName())) {
                return generatedTimesheetId;
            }
            return defaultValue(method.getReturnType());
        });

        timesheetRepository = createProxy(ProjectTimesheetRepository.class, (proxy, method, args) -> {
            String name = method.getName();
            if ("findByTimesheetId".equals(name)) {
                return Optional.ofNullable(timesheetMap.get(args[0]));
            } else if ("save".equals(name)) {
                ProjectTimesheetEntity entity = (ProjectTimesheetEntity) args[0];
                timesheetMap.put(entity.getTimesheetId(), entity);
                return entity;
            } else if ("sumTotalHours".equals(name)) {
                return totalHours;
            } else if ("sumBillableHours".equals(name)) {
                return billableHours;
            } else if ("sumBillableAmount".equals(name)) {
                return billableAmount;
            } else if ("countByApprovalStatusIgnoreCase".equals(name) || "countPendingApprovals".equals(name)) {
                return pendingApprovals;
            }
            return defaultValue(method.getReturnType());
        });

        timesheetService = new TimesheetService(
                timesheetRepository,
                projectRepository,
                projectTaskRepository,
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
    @DisplayName("Should create timesheet and calculate labor cost using Formula A (monthly_cost / 160 * hours)")
    void shouldCreateTimesheetWithFormulaALaborCost() {
        LocalDate date = LocalDate.of(2026, 10, 28);
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .timesheetDate(date)
                .employeeId("EMP-001")
                .employeeName("Amit Sharma")
                .projectId("PRJ-001")
                .taskId("TSK-00126")
                .hours(new BigDecimal("8.00"))
                .isBillable(true)
                .billableRate(new BigDecimal("1500.00"))
                .notes("Architecture tasks")
                .build();

        projectMap.put("PRJ-001", ProjectEntity.builder().projectId("PRJ-001").projectName("Cloud Portal").clientId("CL-001").build());
        taskMap.put("TSK-00126", ProjectTaskEntity.builder().taskId("TSK-00126").projectId("PRJ-001").taskName("Database Schema").billableDefault(true).build());
        employeeMap.put("EMP-001", EmployeeMaster.builder()
                .employeeId("EMP-001")
                .fullName("Amit Sharma")
                .monthlyCost(new BigDecimal("128000.00")) // 128,000 / 160 = 800 per hour. 8 hours * 800 = 6400.00
                .monthlyCtc(new BigDecimal("160000.00"))
                .build());

        generatedTimesheetId = "TS-202610-049";

        TimesheetResponse response = timesheetService.createTimesheet(request, "amit.sharma", List.of("ROLE_USER"));

        assertThat(response.getTimesheetId()).isEqualTo("TS-202610-049");
        assertThat(response.getBillableAmount()).isEqualByComparingTo("12000.00"); // 8.00 * 1500.00
        assertThat(response.getEstimatedLaborCost()).isEqualByComparingTo("6400.00"); // (128000 / 160) * 8 = 6400.00
        assertThat(response.getApprovalStatus()).isEqualTo("Pending");
        assertThat(response.getBillable()).isEqualTo("Yes");
    }

    @Test
    @DisplayName("Should fall back to monthly_ctc / 160 when monthly_cost is absent")
    void shouldFallbackToMonthlyCtcWhenMonthlyCostAbsent() {
        LocalDate date = LocalDate.of(2026, 10, 28);
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .timesheetDate(date)
                .employeeId("EMP-002")
                .projectId("PRJ-001")
                .taskId("TSK-00126")
                .hours(new BigDecimal("4.00"))
                .isBillable(false)
                .build();

        projectMap.put("PRJ-001", ProjectEntity.builder().projectId("PRJ-001").build());
        taskMap.put("TSK-00126", ProjectTaskEntity.builder().taskId("TSK-00126").projectId("PRJ-001").build());
        employeeMap.put("EMP-002", EmployeeMaster.builder()
                .employeeId("EMP-002")
                .fullName("Rohan Verma")
                .monthlyCost(null) // Absent
                .monthlyCtc(new BigDecimal("160000.00")) // 160,000 / 160 = 1000 per hour. 4 hours * 1000 = 4000.00
                .build());

        generatedTimesheetId = "TS-202610-050";

        TimesheetResponse response = timesheetService.createTimesheet(request, "rohan.verma", List.of("ROLE_USER"));

        assertThat(response.getEstimatedLaborCost()).isEqualByComparingTo("4000.00");
        assertThat(response.getBillableAmount()).isEqualByComparingTo("0.00");
        assertThat(response.getBillable()).isEqualTo("No");
    }

    @Test
    @DisplayName("Should reject timesheet creation when task does not belong to the selected project")
    void shouldRejectWhenTaskDoesNotBelongToProject() {
        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .timesheetDate(LocalDate.now())
                .employeeId("EMP-001")
                .projectId("PRJ-001")
                .taskId("TSK-00124") // Belongs to PRJ-002
                .hours(new BigDecimal("8.00"))
                .build();

        projectMap.put("PRJ-001", ProjectEntity.builder().projectId("PRJ-001").build());
        taskMap.put("TSK-00124", ProjectTaskEntity.builder().taskId("TSK-00124").projectId("PRJ-002").build()); // Mismatch

        assertThatThrownBy(() -> timesheetService.createTimesheet(request, "amit.sharma", List.of("ROLE_USER")))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Relational integrity error: Task 'TSK-00124' belongs to project 'PRJ-002', not 'PRJ-001'");
    }

    @Test
    @DisplayName("Should reject regular user modifying an Approved timesheet")
    void shouldRejectRegularUserModifyingApprovedTimesheet() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-048")
                .approvalStatus("Approved")
                .employeeId("EMP-001")
                .build();

        timesheetMap.put("TS-202610-048", existing);

        UpdateTimesheetRequest updateRequest = UpdateTimesheetRequest.builder()
                .hours(new BigDecimal("7.00"))
                .build();

        assertThatThrownBy(() -> timesheetService.updateTimesheet("TS-202610-048", updateRequest, "amit.sharma", List.of("ROLE_USER")))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessageContaining("Cannot modify an already Approved timesheet without manager/admin authorization.");
    }

    @Test
    @DisplayName("Should allow manager or admin to modify an Approved timesheet")
    void shouldAllowManagerToModifyApprovedTimesheet() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-048")
                .approvalStatus("Approved")
                .employeeId("EMP-001")
                .hours(new BigDecimal("8.00"))
                .isBillable(true)
                .billableRate(new BigDecimal("1500.00"))
                .build();

        timesheetMap.put("TS-202610-048", existing);

        UpdateTimesheetRequest updateRequest = UpdateTimesheetRequest.builder()
                .notes("Manager verified note")
                .build();

        TimesheetResponse response = timesheetService.updateTimesheet("TS-202610-048", updateRequest, "manager.akshit", List.of("ROLE_MANAGER"));

        assertThat(response.getNotes()).isEqualTo("Manager verified note");
    }

    @Test
    @DisplayName("Should approve a pending timesheet and record auditor metadata")
    void shouldApproveTimesheet() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-047")
                .approvalStatus("Pending")
                .build();

        timesheetMap.put("TS-202610-047", existing);

        ApproveTimesheetRequest request = ApproveTimesheetRequest.builder().approvedBy("Rohan Verma").notes("Approved").build();
        TimesheetResponse response = timesheetService.approveTimesheet("TS-202610-047", request, "rohan.verma");

        assertThat(response.getApprovalStatus()).isEqualTo("Approved");
        assertThat(response.getApprovedBy()).isEqualTo("Rohan Verma");
        assertThat(response.getApprovedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should reject a pending timesheet with reason")
    void shouldRejectTimesheetWithReason() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-047")
                .approvalStatus("Pending")
                .build();

        timesheetMap.put("TS-202610-047", existing);

        RejectTimesheetRequest request = RejectTimesheetRequest.builder().rejectionReason("Invalid hours logged").build();
        TimesheetResponse response = timesheetService.rejectTimesheet("TS-202610-047", request, "manager.akshit");

        assertThat(response.getApprovalStatus()).isEqualTo("Rejected");
        assertThat(response.getRejectionReason()).isEqualTo("Invalid hours logged");
    }

    @Test
    @DisplayName("Should support authorized labor cost override with full audit trail")
    void shouldOverrideLaborCost() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-047")
                .estimatedLaborCost(new BigDecimal("6000.00"))
                .laborCostOverride(false)
                .build();

        timesheetMap.put("TS-202610-047", existing);

        OverrideLaborCostRequest request = OverrideLaborCostRequest.builder()
                .estimatedLaborCost(new BigDecimal("7500.00"))
                .reason("Specialist senior engineer adjustment")
                .build();

        TimesheetResponse response = timesheetService.overrideLaborCost("TS-202610-047", request, "ceo.akshit");

        assertThat(response.getEstimatedLaborCost()).isEqualByComparingTo("7500.00");
        assertThat(response.getLaborCostOverride()).isTrue();
        assertThat(response.getLaborCostOverrideBy()).isEqualTo("ceo.akshit");
        assertThat(response.getLaborCostOverrideReason()).isEqualTo("Specialist senior engineer adjustment");
        assertThat(response.getLaborCostOverrideAt()).isNotNull();
    }

    @Test
    @DisplayName("Should retrieve aggregated timesheet KPIs")
    void shouldRetrieveTimesheetKpis() {
        totalHours = new BigDecimal("37.50");
        billableHours = new BigDecimal("29.50");
        billableAmount = new BigDecimal("44250.00");
        pendingApprovals = 18L;

        TimesheetKpisResponse kpis = timesheetService.getKpis();

        assertThat(kpis.getTotalHours()).isEqualByComparingTo("37.50");
        assertThat(kpis.getBillableHours()).isEqualByComparingTo("29.50");
        assertThat(kpis.getBillableAmount()).isEqualByComparingTo("44250.00");
        assertThat(kpis.getPendingApprovals()).isEqualTo(18L);
    }

    @Test
    @DisplayName("Should approve timesheet by MD Gaurav Tripathy with automatically resolved full name")
    void shouldApproveTimesheetByMdGauravTripathy() {
        ProjectTimesheetEntity existing = ProjectTimesheetEntity.builder()
                .timesheetId("TS-202610-048")
                .approvalStatus("Pending")
                .assignedApprover("MD – Gaurav Tripathy")
                .build();

        timesheetMap.put("TS-202610-048", existing);

        TimesheetResponse response = timesheetService.approveTimesheet("TS-202610-048", null, "gaurav.tripathy");

        assertThat(response.getApprovalStatus()).isEqualTo("Approved");
        assertThat(response.getApprovedBy()).isEqualTo("Gaurav Tripathy");
        assertThat(response.getApprovedAt()).isNotNull();
        assertThat(response.getAssignedApprover()).isEqualTo("MD – Gaurav Tripathy");
    }

    @Test
    @DisplayName("Should persist assigned approver when creating timesheet, leaving approvedBy null prior to approval")
    void shouldPersistAssignedApproverOnCreation() {
        ProjectEntity project = ProjectEntity.builder().projectId("PRJ-001").build();
        projectMap.put("PRJ-001", project);

        ProjectTaskEntity task = ProjectTaskEntity.builder().taskId("TSK-001").projectId("PRJ-001").taskName("Coding").build();
        taskMap.put("TSK-001", task);

        EmployeeMaster emp = EmployeeMaster.builder().employeeId("EMP-001").fullName("Amit Sharma").build();
        employeeMap.put("EMP-001", emp);

        CreateTimesheetRequest request = CreateTimesheetRequest.builder()
                .projectId("PRJ-001")
                .taskId("TSK-001")
                .employeeId("EMP-001")
                .hours(new BigDecimal("8.0"))
                .isBillable(true)
                .billableRate(new BigDecimal("1500"))
                .assignedApprover("MD – Gaurav Tripathy")
                .timesheetDate(LocalDate.now())
                .build();

        TimesheetResponse response = timesheetService.createTimesheet(request, "EMP-001", List.of("ROLE_USER"));

        assertThat(response.getAssignedApprover()).isEqualTo("MD – Gaurav Tripathy");
        assertThat(response.getApprovalStatus()).isEqualTo("Pending");
        assertThat(response.getApprovedBy()).isNull();
        assertThat(response.getApprovedAt()).isNull();
    }
}
