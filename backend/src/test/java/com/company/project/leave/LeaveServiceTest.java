package com.company.project.leave;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.leave.dto.CreateLeaveRequest;
import com.company.project.leave.dto.LeaveMetricsResponse;
import com.company.project.leave.dto.UpdateLeaveRequest;
import com.company.project.leave.entity.LeaveEntity;
import com.company.project.leave.repository.LeaveRepository;
import com.company.project.leave.service.LeaveService;
import com.company.project.security.repository.AppUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveRepository leaveRepository;

    @Mock
    private AppUserRepository appUserRepository;

    @InjectMocks
    private LeaveService leaveService;

    private LeaveEntity sampleLeave;

    @BeforeEach
    void setUp() {
        sampleLeave = LeaveEntity.builder()
                .id("LV-00086")
                .employeeId("EMP-001")
                .employeeName("Amit Sharma")
                .leaveType("Casual Leave")
                .fromDate("28 Oct 2026")
                .toDate("28 Oct 2026")
                .days(1)
                .reason("Personal work")
                .approvalStatus("Pending")
                .approvedBy(null)
                .calculatedDays(1)
                .leaveStatus("Pending")
                .build();
    }

    @Test
    @DisplayName("getAllLeaves returns leaves sorted descending")
    void testGetAllLeaves() {
        when(leaveRepository.findAllByOrderByIdDesc()).thenReturn(List.of(sampleLeave));

        List<LeaveEntity> result = leaveService.getAllLeaves();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("LV-00086");
        verify(leaveRepository).findAllByOrderByIdDesc();
    }

    @Test
    @DisplayName("getLeaveById returns entity when found")
    void testGetLeaveByIdSuccess() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));

        LeaveEntity result = leaveService.getLeaveById("LV-00086");

        assertThat(result).isNotNull();
        assertThat(result.getEmployeeName()).isEqualTo("Amit Sharma");
    }

    @Test
    @DisplayName("getLeaveById throws ResourceNotFoundException when not found")
    void testGetLeaveByIdNotFound() {
        when(leaveRepository.findById("LV-99999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leaveService.getLeaveById("LV-99999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("LV-99999");
    }

    @Test
    @DisplayName("getMetrics computes counts and returns trends")
    void testGetMetrics() {
        when(leaveRepository.count()).thenReturn(86L);
        when(leaveRepository.countByApprovalStatusIgnoreCase("Approved")).thenReturn(62L);
        when(leaveRepository.countByApprovalStatusIgnoreCase("Pending")).thenReturn(14L);
        when(leaveRepository.countByApprovalStatusIgnoreCase("Rejected")).thenReturn(10L);

        LeaveMetricsResponse metrics = leaveService.getMetrics();

        assertThat(metrics.getTotalRequests()).isEqualTo(86L);
        assertThat(metrics.getApprovedRequests()).isEqualTo(62L);
        assertThat(metrics.getPendingRequests()).isEqualTo(14L);
        assertThat(metrics.getRejectedRequests()).isEqualTo(10L);
        assertThat(metrics.getTotalRequestsTrend()).isEqualTo("↑ 12% vs last month");
    }

    @Test
    @DisplayName("createLeave generates next ID and saves entity")
    void testCreateLeave() {
        when(leaveRepository.findLatestId()).thenReturn("LV-00086");
        when(leaveRepository.save(any(LeaveEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateLeaveRequest req = CreateLeaveRequest.builder()
                .employeeId("EMP-003")
                .employeeName("Rohan Kumar")
                .leaveType("Sick Leave")
                .fromDate("01 Nov 2026")
                .toDate("02 Nov 2026")
                .days(2)
                .reason("Fever")
                .build();

        LeaveEntity created = leaveService.createLeave(req);

        assertThat(created.getId()).isEqualTo("LV-00087");
        assertThat(created.getEmployeeName()).isEqualTo("Rohan Kumar");
        assertThat(created.getApprovalStatus()).isEqualTo("Pending");
        verify(leaveRepository).save(any(LeaveEntity.class));
    }

    @Test
    @DisplayName("updateLeave updates status and approver to Akshit Ujjain")
    void testUpdateLeaveAkshit() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(LeaveEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateLeaveRequest req = UpdateLeaveRequest.builder()
                .approvalStatus("Approved")
                .approvedBy("Akshit Ujjain")
                .leaveStatus("Approved")
                .build();

        LeaveEntity updated = leaveService.updateLeave("LV-00086", req);

        assertThat(updated.getApprovalStatus()).isEqualTo("Approved");
        assertThat(updated.getApprovedBy()).isEqualTo("Akshit Ujjain");
        assertThat(updated.getLeaveStatus()).isEqualTo("Approved");
    }

    @Test
    @DisplayName("updateLeave updates status and approver to Gaurav Tripathy")
    void testUpdateLeaveGaurav() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(LeaveEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateLeaveRequest req = UpdateLeaveRequest.builder()
                .approvalStatus("Approved")
                .approvedBy("Gaurav Tripathy")
                .leaveStatus("Approved")
                .build();

        LeaveEntity updated = leaveService.updateLeave("LV-00086", req);

        assertThat(updated.getApprovalStatus()).isEqualTo("Approved");
        assertThat(updated.getApprovedBy()).isEqualTo("Gaurav Tripathy");
    }

    @Test
    @DisplayName("updateLeave updates status and approver to Asbin T S")
    void testUpdateLeaveAsbin() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(LeaveEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateLeaveRequest req = UpdateLeaveRequest.builder()
                .approvalStatus("Approved")
                .approvedBy("Asbin T S")
                .leaveStatus("Approved")
                .build();

        LeaveEntity updated = leaveService.updateLeave("LV-00086", req);

        assertThat(updated.getApprovalStatus()).isEqualTo("Approved");
        assertThat(updated.getApprovedBy()).isEqualTo("Asbin T S");
    }

    @Test
    @DisplayName("updateLeave automatically resolves default approver when approvedBy is omitted")
    void testUpdateLeaveResolvesDefaultApprover() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));
        when(leaveRepository.save(any(LeaveEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateLeaveRequest req = UpdateLeaveRequest.builder()
                .approvalStatus("Approved")
                .leaveStatus("Approved")
                .build();

        LeaveEntity updated = leaveService.updateLeave("LV-00086", req);

        assertThat(updated.getApprovalStatus()).isEqualTo("Approved");
        assertThat(updated.getApprovedBy()).isNotNull();
        assertThat(updated.getApprovedBy()).isEqualTo("Akshit Ujjain");
    }

    @Test
    @DisplayName("deleteLeave removes entity from repository")
    void testDeleteLeave() {
        when(leaveRepository.findById("LV-00086")).thenReturn(Optional.of(sampleLeave));

        leaveService.deleteLeave("LV-00086");

        verify(leaveRepository).delete(sampleLeave);
    }
}

