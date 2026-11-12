package com.company.project.hr;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;
import com.company.project.hr.entity.*;
import com.company.project.hr.repository.*;
import com.company.project.hr.service.HrDashboardServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HrDashboardServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CandidateRepository candidateRepository;

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private HrEmployeeApprovalRepository HrEmployeeApprovalRepository;

    @Mock
    private HrSummaryRepository hrSummaryRepository;

    @Mock
    private HrActivityRepository hrActivityRepository;

    @InjectMocks
    private HrDashboardServiceImpl hrDashboardService;

    @BeforeEach
    void setUp() {
        hrDashboardService.clearCache();
    }

    // =========================================================================
    // Dashboard Overview Tests
    // =========================================================================

    @Test
    @DisplayName("Dashboard retrieval without filters returns live aggregated metrics and effectiveDate")
    void testGetDashboardAllMetrics() {
        when(employeeRepository.countByStatus("Active")).thenReturn(10L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(2L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(new BigDecimal("1745000.00"));
        EmployeeEntity h1 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        EmployeeEntity h2 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        when(employeeRepository.findAll()).thenReturn(List.of(h1, h2));

        when(candidateRepository.countByStatus("Open")).thenReturn(7L);
        when(candidateRepository.countActiveCandidatesOlderThan(any(LocalDate.class))).thenReturn(3L);

        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(4L);

        // Attendance date resolution
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(10L);
        when(attendanceRecordRepository.countByAttendanceDateAndStatus(anyString(), eq("Half Day"))).thenReturn(1L);
        when(attendanceRecordRepository.countLateRecordsForDate(anyString())).thenReturn(2L);

        HrActivityEntity activity = HrActivityEntity.builder()
                .id("act-1")
                .activityDate("15 Mar 2025")
                .type("Attendance")
                .typeColor("#2563EB")
                .description("Attendance records updated for Engineering team")
                .status("Completed")
                .sortOrder(1)
                .build();
        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(activity));

        HrDashboardResponse response = hrDashboardService.getHrDashboard(null, null);

        assertNotNull(response);
        assertNotNull(response.getLastUpdated());

        // Workforce
        assertEquals(10, response.getWorkforce().getActiveEmployees());
        assertEquals(2, response.getWorkforce().getOnNotice());
        assertEquals("₹ 17,45,000.00", response.getWorkforce().getTotalMonthlyCtc());
        assertEquals(2, response.getWorkforce().getNewHiresThisMonth());

        // Recruitment
        assertEquals(7, response.getRecruitment().getOpenCandidates());
        assertEquals(3, response.getRecruitment().getCandidatesOver30Days());

        // Leave
        assertEquals(4, response.getLeave().getPendingApprovals());

        // Attendance (date-scoped with effectiveDate populated)
        assertEquals(10, response.getAttendance().getRecords());
        assertEquals(1, response.getAttendance().getHalfDays());
        assertEquals(2, response.getAttendance().getLateRecords());
        assertNotNull(response.getAttendance().getEffectiveDate());

        // Lifecycle
        assertEquals(2, response.getLifecycle().getEmployeesExiting());

        // Activities
        assertEquals(1, response.getRecentActivities().size());
        assertEquals("2025-03-15", response.getRecentActivities().get(0).getRawDate());
        assertEquals("Engineering", response.getRecentActivities().get(0).getDepartment());
    }

    @Test
    @DisplayName("Multiple attendance dates in DB: Historical records are excluded and effectiveDate is explicitly set")
    void testAttendanceDateScopingExcludesHistoricalRecords() {
        when(employeeRepository.countByStatus("Active")).thenReturn(5L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(0L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(BigDecimal.ZERO);
        when(employeeRepository.findAll()).thenReturn(Collections.emptyList());
        when(candidateRepository.countByStatus("Open")).thenReturn(0L);
        when(candidateRepository.countActiveCandidatesOlderThan(any())).thenReturn(0L);
        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(0L);
        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(Collections.emptyList());

        // Database has 3 distinct dates: '29 Oct 2026', '30 Oct 2026', '31 Oct 2026'
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenAnswer(invocation -> {
            String date = invocation.getArgument(0);
            if ("31 Oct 2026".equals(date)) return 10L;
            return 0L;
        });
        when(attendanceRecordRepository.findDistinctAttendanceDates()).thenReturn(List.of("29 Oct 2026", "31 Oct 2026", "30 Oct 2026"));

        when(attendanceRecordRepository.countByAttendanceDateAndStatus("31 Oct 2026", "Half Day")).thenReturn(1L);
        when(attendanceRecordRepository.countLateRecordsForDate("31 Oct 2026")).thenReturn(2L);

        HrDashboardResponse response = hrDashboardService.getHrDashboard(null, null);

        // Must strictly return 10 records for '31 Oct 2026'
        assertEquals(10, response.getAttendance().getRecords());
        assertEquals(1, response.getAttendance().getHalfDays());
        assertEquals(2, response.getAttendance().getLateRecords());
        assertEquals("31 Oct 2026", response.getAttendance().getEffectiveDate());

        verify(attendanceRecordRepository, never()).count();
        verify(attendanceRecordRepository).countByAttendanceDate("31 Oct 2026");
    }

    @Test
    @DisplayName("Empty attendance data returns 0 records and defaults effectiveDate without exception")
    void testEmptyAttendanceData() {
        when(employeeRepository.countByStatus("Active")).thenReturn(1L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(0L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(BigDecimal.ZERO);
        when(employeeRepository.findAll()).thenReturn(Collections.emptyList());
        when(candidateRepository.countByStatus("Open")).thenReturn(0L);
        when(candidateRepository.countActiveCandidatesOlderThan(any())).thenReturn(0L);
        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(0L);
        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(Collections.emptyList());

        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(0L);
        when(attendanceRecordRepository.findDistinctAttendanceDates()).thenReturn(Collections.emptyList());
        when(attendanceRecordRepository.countByAttendanceDateAndStatus(anyString(), anyString())).thenReturn(0L);
        when(attendanceRecordRepository.countLateRecordsForDate(anyString())).thenReturn(0L);

        HrDashboardResponse response = hrDashboardService.getHrDashboard(null, null);

        assertNotNull(response.getAttendance());
        assertEquals(0, response.getAttendance().getRecords());
        assertEquals(0, response.getAttendance().getHalfDays());
        assertEquals(0, response.getAttendance().getLateRecords());
        assertNotNull(response.getAttendance().getEffectiveDate());
    }

    @Test
    @DisplayName("Unknown period filter gracefully falls back to unbounded all-period calculation")
    void testUnknownPeriodFilterFallback() {
        when(employeeRepository.countByStatus("Active")).thenReturn(8L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(1L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(new BigDecimal("800000.00"));
        EmployeeEntity h1 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        EmployeeEntity h2 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        EmployeeEntity h3 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        when(employeeRepository.findAll()).thenReturn(List.of(h1, h2, h3));
        when(candidateRepository.countByStatus("Open")).thenReturn(1L);
        when(candidateRepository.countActiveCandidatesOlderThan(any())).thenReturn(0L);
        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(0L);
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(5L);
        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(Collections.emptyList());

        HrDashboardResponse response = hrDashboardService.getHrDashboard(null, "Invalid-Period-2099");

        assertNotNull(response);
        assertEquals(8, response.getWorkforce().getActiveEmployees());
        assertEquals(3, response.getWorkforce().getNewHiresThisMonth());
    }

    @Test
    @DisplayName("Department filter applies to employee, candidate, and activity queries")
    void testGetDashboardDepartmentFilter() {
        when(employeeRepository.countByDepartmentAndStatus("Engineering", "Active")).thenReturn(6L);
        when(employeeRepository.countByDepartmentAndStatus("Engineering", "On Notice")).thenReturn(1L);
        when(employeeRepository.sumMonthlyCtcByDepartmentForActiveAndNotice("Engineering")).thenReturn(new BigDecimal("980000.00"));
        EmployeeEntity h1 = EmployeeEntity.builder().department("Engineering").joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        when(employeeRepository.findByDepartment("Engineering")).thenReturn(List.of(h1));

        when(candidateRepository.countByDepartmentAndStatus("Engineering", "Open")).thenReturn(3L);
        when(candidateRepository.countActiveCandidatesByDepartmentOlderThan(eq("Engineering"), any())).thenReturn(1L);

        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(2L);
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(10L);

        HrActivityEntity actEng = HrActivityEntity.builder()
                .id("act-1")
                .activityDate("15 Mar 2025")
                .type("Employee")
                .typeColor("#2563EB")
                .description("New backend developer onboarded to Engineering")
                .status("Completed")
                .sortOrder(1)
                .build();

        HrActivityEntity actSales = HrActivityEntity.builder()
                .id("act-2")
                .activityDate("14 Mar 2025")
                .type("Employee")
                .typeColor("#2563EB")
                .description("Sales target achieved for Q1")
                .status("Completed")
                .sortOrder(2)
                .build();

        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(List.of(actEng, actSales));

        HrDashboardResponse response = hrDashboardService.getHrDashboard("Engineering", "This Month");

        assertEquals(6, response.getWorkforce().getActiveEmployees());
        assertEquals(1, response.getWorkforce().getOnNotice());
        assertEquals("₹ 9,80,000.00", response.getWorkforce().getTotalMonthlyCtc());
        assertEquals(3, response.getRecruitment().getOpenCandidates());
        assertEquals(1, response.getRecruitment().getCandidatesOver30Days());

        // Recent activities should be filtered to Engineering only
        assertEquals(1, response.getRecentActivities().size());
        assertEquals("act-1", response.getRecentActivities().get(0).getId());
    }

    @Test
    @DisplayName("Empty database returns zero values instead of fabricated 997 defaults")
    void testEmptyDatabaseReturnsZero() {
        when(employeeRepository.countByStatus("Active")).thenReturn(0L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(0L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(BigDecimal.ZERO);
        when(employeeRepository.findAll()).thenReturn(Collections.emptyList());

        when(candidateRepository.countByStatus("Open")).thenReturn(0L);
        when(candidateRepository.countActiveCandidatesOlderThan(any())).thenReturn(0L);

        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(0L);
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(0L);
        when(attendanceRecordRepository.findDistinctAttendanceDates()).thenReturn(Collections.emptyList());
        when(attendanceRecordRepository.countByAttendanceDateAndStatus(anyString(), anyString())).thenReturn(0L);
        when(attendanceRecordRepository.countLateRecordsForDate(anyString())).thenReturn(0L);

        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(Collections.emptyList());
        when(hrSummaryRepository.findById(1L)).thenReturn(Optional.empty());

        HrDashboardResponse response = hrDashboardService.getHrDashboard(null, null);

        assertNotNull(response);
        assertEquals(0, response.getWorkforce().getActiveEmployees());
        assertEquals(0, response.getWorkforce().getOnNotice());
        assertEquals("₹ 0.00", response.getWorkforce().getTotalMonthlyCtc());
        assertEquals(0, response.getWorkforce().getNewHiresThisMonth());

        assertEquals(0, response.getRecruitment().getOpenCandidates());
        assertEquals(0, response.getRecruitment().getCandidatesOver30Days());
        assertEquals(0, response.getAttendance().getRecords());
        assertEquals(0, response.getAttendance().getHalfDays());
        assertEquals(0, response.getAttendance().getLateRecords());
        assertEquals(0, response.getLeave().getPendingApprovals());
        assertEquals(0, response.getLifecycle().getEmployeesExiting());
        assertTrue(response.getRecentActivities().isEmpty());
    }

    @Test
    @DisplayName("refreshHrDashboard updates hr_summary entity and returns recalculated data")
    void testRefreshHrDashboard() {
        HrSummaryEntity summary = HrSummaryEntity.builder()
                .id(1L)
                .activeEmployees(0)
                .onNotice(0)
                .totalMonthlyCtc(BigDecimal.ZERO)
                .newHiresThisMonth(0)
                .lastUpdated(OffsetDateTime.now().minusDays(1))
                .build();
        when(hrSummaryRepository.findById(1L)).thenReturn(Optional.of(summary));

        when(employeeRepository.countByStatus("Active")).thenReturn(12L);
        when(employeeRepository.countByStatus("On Notice")).thenReturn(1L);
        when(employeeRepository.sumMonthlyCtcForActiveAndNotice()).thenReturn(new BigDecimal("1500000.00"));
        EmployeeEntity r1 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        EmployeeEntity r2 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        EmployeeEntity r3 = EmployeeEntity.builder().joiningDate(LocalDate.now().format(DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH))).build();
        when(employeeRepository.findAll()).thenReturn(List.of(r1, r2, r3));

        when(candidateRepository.countByStatus("Open")).thenReturn(5L);
        when(candidateRepository.countActiveCandidatesOlderThan(any())).thenReturn(1L);
        when(HrEmployeeApprovalRepository.countByStatusIgnoreCase("Pending")).thenReturn(2L);
        when(attendanceRecordRepository.countByAttendanceDate(anyString())).thenReturn(25L);
        when(attendanceRecordRepository.countByAttendanceDateAndStatus(anyString(), eq("Half Day"))).thenReturn(2L);
        when(attendanceRecordRepository.countLateRecordsForDate(anyString())).thenReturn(4L);
        when(hrActivityRepository.findAllByOrderBySortOrderAsc()).thenReturn(Collections.emptyList());

        HrDashboardResponse response = hrDashboardService.refreshHrDashboard();

        assertNotNull(response);
        assertEquals(12, response.getWorkforce().getActiveEmployees());
        assertEquals("₹ 15,00,000.00", response.getWorkforce().getTotalMonthlyCtc());

        verify(hrSummaryRepository, times(1)).save(summary);
        assertEquals(12, summary.getActiveEmployees());
        assertEquals(new BigDecimal("1500000.00"), summary.getTotalMonthlyCtc());
        assertEquals(25, summary.getAttendanceRecords());
        assertEquals(2, summary.getHalfDays());
        assertEquals(4, summary.getLateRecords());
    }

    // =========================================================================
    // Phase 3 Modal Workflows & Tabular Operations Tests
    // =========================================================================

    @Test
    @DisplayName("Create employee: validates, assigns sequential ID, saves entity and logs activity")
    void testCreateEmployeeSuccess() {
        CreateEmployeeRequest request = CreateEmployeeRequest.builder()
                .name("Arjun Nair")
                .email("arjun.n@kalpanaaa.com")
                .department("Engineering")
                .role("Senior Frontend Dev")
                .monthlyCtc(new BigDecimal("145000.00"))
                .joiningDate("2025-03-20")
                .status("Active")
                .build();

        when(employeeRepository.existsByWorkEmail("arjun.n@kalpanaaa.com")).thenReturn(false);
        when(employeeRepository.findAllEmployeeIdsWithPrefix()).thenReturn(List.of("EMP-001", "EMP-010"));
        when(employeeRepository.existsByEmployeeId("EMP-011")).thenReturn(false);

        when(employeeRepository.save(any(EmployeeEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeDto result = hrDashboardService.createEmployee(request);

        assertNotNull(result);
        assertEquals("EMP-011", result.getId());
        assertEquals("Arjun Nair", result.getName());
        assertEquals("arjun.n@kalpanaaa.com", result.getEmail());
        assertEquals("Engineering", result.getDepartment());
        assertEquals("Senior Frontend Dev", result.getRole());
        assertEquals(new BigDecimal("145000.00"), result.getMonthlyCtc());
        assertEquals("Active", result.getStatus());

        // Verify activity was logged
        verify(hrActivityRepository, times(1)).save(any(HrActivityEntity.class));
    }

    @Test
    @DisplayName("Create employee: throws BusinessValidationException when email already exists")
    void testCreateEmployeeDuplicateEmail() {
        CreateEmployeeRequest request = CreateEmployeeRequest.builder()
                .name("Arjun Nair")
                .email("duplicate@kalpanaaa.com")
                .department("Engineering")
                .role("Senior Frontend Dev")
                .monthlyCtc(new BigDecimal("145000.00"))
                .joiningDate("2025-03-20")
                .build();

        when(employeeRepository.existsByWorkEmail("duplicate@kalpanaaa.com")).thenReturn(true);

        assertThrows(BusinessValidationException.class, () -> hrDashboardService.createEmployee(request));
        verify(employeeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create employee: advances ID when candidate already exists (collision prevention)")
    void testCreateEmployeeIdCollisionAvoidance() {
        CreateEmployeeRequest request = CreateEmployeeRequest.builder()
                .name("Kiran Kumar")
                .email("kiran.k@kalpanaaa.com")
                .department("Finance")
                .role("Accountant")
                .monthlyCtc(new BigDecimal("90000.00"))
                .joiningDate("2025-03-25")
                .build();

        when(employeeRepository.existsByWorkEmail("kiran.k@kalpanaaa.com")).thenReturn(false);
        when(employeeRepository.findAllEmployeeIdsWithPrefix()).thenReturn(List.of("EMP-001", "EMP-005"));
        when(employeeRepository.existsByEmployeeId("EMP-006")).thenReturn(true);
        when(employeeRepository.existsByEmployeeId("EMP-007")).thenReturn(false);
        when(employeeRepository.save(any(EmployeeEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        EmployeeDto result = hrDashboardService.createEmployee(request);
        assertEquals("EMP-007", result.getId());
    }

    @Test
    @DisplayName("Activity log: failure propagates to trigger transaction rollback")
    void testActivityLogFailurePropagatesException() {
        CreateEmployeeRequest request = CreateEmployeeRequest.builder()
                .name("Test User")
                .email("test.u@kalpanaaa.com")
                .department("HR")
                .role("Recruiter")
                .monthlyCtc(new BigDecimal("80000.00"))
                .joiningDate("2025-03-25")
                .build();

        when(employeeRepository.existsByWorkEmail("test.u@kalpanaaa.com")).thenReturn(false);
        when(employeeRepository.findAllEmployeeIdsWithPrefix()).thenReturn(Collections.emptyList());
        when(employeeRepository.existsByEmployeeId("EMP-001")).thenReturn(false);
        when(employeeRepository.save(any(EmployeeEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(hrActivityRepository.save(any(HrActivityEntity.class)))
                .thenThrow(new RuntimeException("Database disk full or constraint error on activity log"));

        assertThrows(RuntimeException.class, () -> hrDashboardService.createEmployee(request));
    }

    @Test
    @DisplayName("Get employees: executes specification search, department filter and pagination")
    void testGetEmployeesPaginated() {
        EmployeeEntity emp = EmployeeEntity.builder()
                .id(1L)
                .employeeId("EMP-001")
                .fullName("Priya Sharma")
                .workEmail("priya.s@kalpanaaa.com")
                .department("Engineering")
                .designation("Fullstack Dev")
                .monthlyCtc(new BigDecimal("120000.00"))
                .joiningDate("10 Jan 2025")
                .status("Active")
                .build();

        Page<EmployeeEntity> page = new PageImpl<>(List.of(emp));
        when(employeeRepository.findAll(org.mockito.ArgumentMatchers.<Specification<EmployeeEntity>>any(), any(Pageable.class))).thenReturn(page);

        PageResponse<EmployeeDto> result = hrDashboardService.getEmployees("Priya", "Engineering", "Active", 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("EMP-001", result.getContent().get(0).getId());
        assertEquals("Priya Sharma", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Update leave status: transitions status to Approved and logs activity")
    void testUpdateLeaveStatusSuccess() {
        EmployeeApprovalEntity approval = EmployeeApprovalEntity.builder()
                .id(5L)
                .employeeName("Sneha Roy")
                .employeeCode("EMP-004")
                .requestType("Sick Leave")
                .appliedDate("11 Mar 2025")
                .status("Pending")
                .build();

        when(HrEmployeeApprovalRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(approval));
        when(HrEmployeeApprovalRepository.save(any(EmployeeApprovalEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateLeaveStatusRequest request = UpdateLeaveStatusRequest.builder().status("Approved").build();
        LeaveApprovalDto updated = hrDashboardService.updateLeaveStatus(5L, request);

        assertNotNull(updated);
        assertEquals("Approved", updated.getStatus());
        verify(HrEmployeeApprovalRepository, times(1)).save(approval);
        verify(hrActivityRepository, times(1)).save(any(HrActivityEntity.class));
    }

    @Test
    @DisplayName("Update leave status: prevents overwriting an already finalized leave decision")
    void testUpdateLeaveStatusAlreadyFinalizedThrowsException() {
        EmployeeApprovalEntity approval = EmployeeApprovalEntity.builder()
                .id(5L)
                .employeeName("Sneha Roy")
                .employeeCode("EMP-004")
                .requestType("Sick Leave")
                .appliedDate("11 Mar 2025")
                .status("Approved")
                .build();

        when(HrEmployeeApprovalRepository.findByIdForUpdate(5L)).thenReturn(Optional.of(approval));

        UpdateLeaveStatusRequest request = UpdateLeaveStatusRequest.builder().status("Rejected").build();
        BusinessValidationException ex = assertThrows(
                BusinessValidationException.class,
                () -> hrDashboardService.updateLeaveStatus(5L, request)
        );

        assertTrue(ex.getMessage().contains("already been finalized"));
        verify(HrEmployeeApprovalRepository, never()).save(any());
    }

    @Test
    @DisplayName("Update leave status: throws ResourceNotFoundException when leave does not exist")
    void testUpdateLeaveStatusNotFound() {
        when(HrEmployeeApprovalRepository.findByIdForUpdate(999L)).thenReturn(Optional.empty());
        when(HrEmployeeApprovalRepository.findById(999L)).thenReturn(Optional.empty());

        UpdateLeaveStatusRequest request = UpdateLeaveStatusRequest.builder().status("Approved").build();
        assertThrows(ResourceNotFoundException.class, () -> hrDashboardService.updateLeaveStatus(999L, request));
    }

    @Test
    @DisplayName("Log attendance: prevents duplicate submission for same employee on same date")
    void testLogAttendanceDuplicateThrowsException() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-001")
                .employeeName("Akshit Ujjain")
                .status("Present")
                .attendanceDate("31 Oct 2026")
                .build();

        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-001", "31 Oct 2026")).thenReturn(true);

        assertThrows(BusinessValidationException.class, () -> hrDashboardService.logAttendance(request));
        verify(attendanceRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("Log attendance: records attendance, sets isLate correctly and logs activity")
    void testLogAttendanceSuccess() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-002")
                .employeeName("Neha Verma")
                .status("Late")
                .checkIn("10:15 AM")
                .attendanceDate("31 Oct 2026")
                .build();

        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-002", "31 Oct 2026")).thenReturn(false);
        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-002", "2026-10-31")).thenReturn(false);
        when(attendanceRecordRepository.save(any(AttendanceRecordEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto result = hrDashboardService.logAttendance(request);

        assertNotNull(result);
        assertEquals("EMP-002", result.getEmployeeId());
        assertEquals("Late", result.getStatus());
        assertTrue(result.getIsLate());
        assertEquals("31 Oct 2026", result.getAttendanceDate());
        verify(attendanceRecordRepository, times(1)).save(any());
        verify(hrActivityRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Log attendance: normalizes ISO date (YYYY-MM-DD) to canonical format (D MMM YYYY)")
    void testLogAttendanceIsoDateNormalizedToCanonical() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-003")
                .employeeName("Rahul Sharma")
                .status("Present")
                .checkIn("09:15 AM")
                .attendanceDate("2025-03-15")
                .build();

        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-003", "15 Mar 2025")).thenReturn(false);
        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-003", "2025-03-15")).thenReturn(false);
        when(attendanceRecordRepository.save(any(AttendanceRecordEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        AttendanceDto result = hrDashboardService.logAttendance(request);

        assertNotNull(result);
        assertEquals("15 Mar 2025", result.getAttendanceDate());
        assertEquals("15 Mar 2025", result.getDate());
    }

    @Test
    @DisplayName("Log attendance: equivalent ISO submission caught when display format already exists in database")
    void testLogAttendanceDuplicateAcrossEquivalentFormats() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-003")
                .employeeName("Rahul Sharma")
                .status("Present")
                .attendanceDate("2025-03-15") // ISO format
                .build();

        // Database already has display format stored
        when(attendanceRecordRepository.existsByEmployeeIdAndAttendanceDate("EMP-003", "15 Mar 2025")).thenReturn(true);

        BusinessValidationException ex = assertThrows(
                BusinessValidationException.class,
                () -> hrDashboardService.logAttendance(request)
        );
        assertTrue(ex.getMessage().contains("Attendance already recorded for employee EMP-003 on 15 Mar 2025"));
    }

    @Test
    @DisplayName("Log attendance: rejects invalid calendar dates (e.g. 2025-02-30)")
    void testLogAttendanceInvalidCalendarDateThrowsException() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-003")
                .employeeName("Rahul Sharma")
                .status("Present")
                .attendanceDate("2025-02-30")
                .build();

        BusinessValidationException ex = assertThrows(
                BusinessValidationException.class,
                () -> hrDashboardService.logAttendance(request)
        );
        assertTrue(ex.getMessage().contains("Invalid calendar date in ISO format"));
    }

    @Test
    @DisplayName("Log attendance: rejects ambiguous slash dates (e.g. 10/12/2025)")
    void testLogAttendanceAmbiguousSlashDateThrowsException() {
        LogAttendanceRequest request = LogAttendanceRequest.builder()
                .employeeId("EMP-003")
                .employeeName("Rahul Sharma")
                .status("Present")
                .attendanceDate("10/12/2025")
                .build();

        BusinessValidationException ex = assertThrows(
                BusinessValidationException.class,
                () -> hrDashboardService.logAttendance(request)
        );
        assertTrue(ex.getMessage().contains("Invalid attendance date format"));
        assertTrue(ex.getMessage().contains("Supported formats are 'YYYY-MM-DD'"));
    }

    @Test
    @DisplayName("Get candidates: calculates daysInPipeline and filters by minimum days")
    void testGetCandidatesAgeing() {
        CandidateEntity c1 = CandidateEntity.builder()
                .id("CAN-101")
                .name("Aarav Patel")
                .department("Engineering")
                .role("Backend Lead")
                .status("Open")
                .createdDate(LocalDate.now().minusDays(45))
                .build();

        CandidateEntity c2 = CandidateEntity.builder()
                .id("CAN-102")
                .name("Kavita Rao")
                .department("Design")
                .role("UI Designer")
                .status("Open")
                .createdDate(LocalDate.now().minusDays(10))
                .build();

        when(candidateRepository.findAll()).thenReturn(List.of(c1, c2));

        List<CandidateDto> candidatesOver30Days = hrDashboardService.getCandidates(null, 30);
        assertEquals(1, candidatesOver30Days.size());
        assertEquals("CAN-101", candidatesOver30Days.get(0).getId());
        assertTrue(candidatesOver30Days.get(0).getDaysInPipeline() >= 30);
    }

    @Test
    @DisplayName("Get leaves: correctly parses numeric days and maps frontend compatibility fields")
    void testGetLeavesCompatibilityMapping() {
        EmployeeEntity emp = EmployeeEntity.builder()
                .id(4L)
                .employeeId("EMP-004")
                .fullName("Sneha Roy")
                .department("Engineering")
                .build();

        EmployeeApprovalEntity approval1 = EmployeeApprovalEntity.builder()
                .id(1L)
                .employeeName("Sneha Roy")
                .employeeCode("EMP-004")
                .requestType("Sick Leave")
                .appliedDate("11 Mar 2025")
                .fromDate("2025-03-12")
                .toDate("2025-03-14")
                .duration("3 days")
                .reason("Flu")
                .status("Pending")
                .build();

        EmployeeApprovalEntity approval2 = EmployeeApprovalEntity.builder()
                .id(2L)
                .employeeName("Rahul Gupta")
                .employeeCode("EMP-999")
                .requestType("Casual Leave")
                .appliedDate("10 Mar 2025")
                .fromDate("2025-03-20")
                .toDate("2025-03-20")
                .duration("1 day")
                .reason("Personal work")
                .status("Pending")
                .build();

        when(HrEmployeeApprovalRepository.findByStatusIgnoreCaseOrderBySortOrderAsc("Pending"))
                .thenReturn(List.of(approval1, approval2));
        when(employeeRepository.findByEmployeeId("EMP-004")).thenReturn(Optional.of(emp));
        when(employeeRepository.findByEmployeeId("EMP-999")).thenReturn(Optional.empty());

        List<LeaveApprovalDto> leaves = hrDashboardService.getLeaves("Pending");

        assertEquals(2, leaves.size());

        LeaveApprovalDto dto1 = leaves.get(0);
        assertEquals(1L, dto1.getId());
        assertEquals("Sick Leave", dto1.getLeaveType());
        assertEquals("Sick Leave", dto1.getRequestType());
        assertEquals("2025-03-12", dto1.getStartDate());
        assertEquals("2025-03-12", dto1.getFromDate());
        assertEquals("2025-03-14", dto1.getEndDate());
        assertEquals("2025-03-14", dto1.getToDate());
        assertEquals(3, dto1.getDays());
        assertEquals("3 days", dto1.getDuration());
        assertEquals("Engineering", dto1.getDepartment());
        assertEquals("EMP-004", dto1.getEmployeeId());

        LeaveApprovalDto dto2 = leaves.get(1);
        assertEquals(1, dto2.getDays());
        assertEquals("1 day", dto2.getDuration());
        assertNull(dto2.getDepartment());
    }

    @Test
    @DisplayName("Get attendance: correctly maps date and department for frontend compatibility")
    void testGetAttendanceCompatibilityMapping() {
        EmployeeEntity emp = EmployeeEntity.builder()
                .id(1L)
                .employeeId("EMP-001")
                .fullName("Akshit Ujjain")
                .department("Engineering")
                .build();

        AttendanceRecordEntity record = AttendanceRecordEntity.builder()
                .id("ATT-001")
                .employeeId("EMP-001")
                .employeeName("Akshit Ujjain")
                .attendanceDate("15 Mar 2025")
                .status("Present")
                .checkIn("09:15 AM")
                .workHours("9h 00m")
                .isLate(false)
                .build();

        when(attendanceRecordRepository.findByAttendanceDate("15 Mar 2025"))
                .thenReturn(List.of(record));
        when(employeeRepository.findByEmployeeId("EMP-001")).thenReturn(Optional.of(emp));

        List<AttendanceDto> result = hrDashboardService.getAttendanceRecords("2025-03-15", null);

        assertEquals(1, result.size());
        AttendanceDto dto = result.get(0);
        assertEquals("ATT-001", dto.getId());
        assertEquals("15 Mar 2025", dto.getAttendanceDate());
        assertEquals("15 Mar 2025", dto.getDate());
        assertEquals("Engineering", dto.getDepartment());
    }
}
