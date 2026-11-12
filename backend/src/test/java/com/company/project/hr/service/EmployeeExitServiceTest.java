package com.company.project.hr.service;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;
import com.company.project.hr.entity.EmployeeExitEntity;
import com.company.project.hr.repository.EmployeeExitRepository;
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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeExitServiceTest {

    @Mock
    private EmployeeExitRepository employeeExitRepository;

    @Mock
    private EmployeeExitIdGeneratorService idGeneratorService;

    @InjectMocks
    private EmployeeExitServiceImpl employeeExitService;

    private EmployeeExitEntity sampleEntity;

    @BeforeEach
    void setUp() {
        sampleEntity = EmployeeExitEntity.builder()
                .id(1L)
                .exitId("EXI-00018")
                .employeeId("EMP-001")
                .employeeName("Amit Sharma")
                .resignationDate(LocalDate.of(2026, 10, 25))
                .approvalDate(LocalDate.of(2026, 10, 26))
                .noticePeriodDays(30)
                .lastWorkingDay(LocalDate.of(2026, 11, 24))
                .exitType("Resignation")
                .reason("Career Growth")
                .exitStatus("Approved")
                .assetsReturned("Yes")
                .fullAndFinalStatus("In Review")
                .notes("Smooth handover")
                .noticeCompletionDate(LocalDate.of(2026, 11, 24))
                .exitReadiness("In Progress")
                .build();
    }

    @Test
    @DisplayName("getExitRecords returns mapped PageResponse of EmployeeExitResponse")
    void testGetExitRecords() {
        Page<EmployeeExitEntity> page = new PageImpl<>(List.of(sampleEntity));
        when(employeeExitRepository.findAll(org.mockito.ArgumentMatchers.<Specification<EmployeeExitEntity>>any(), any(Pageable.class))).thenReturn(page);

        PageResponse<EmployeeExitResponse> result = employeeExitService.getExitRecords(
                null, null, null, null, null, null, "id-desc", 1, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("EXI-00018", result.getContent().get(0).getExitId());
        assertEquals("Amit Sharma", result.getContent().get(0).getEmployeeName());
    }

    @Test
    @DisplayName("getExitRecordById returns response when record exists")
    void testGetRecordByIdFound() {
        when(employeeExitRepository.findByExitId("EXI-00018")).thenReturn(Optional.of(sampleEntity));

        EmployeeExitResponse response = employeeExitService.getExitRecordById("EXI-00018");

        assertNotNull(response);
        assertEquals("EXI-00018", response.getExitId());
        assertEquals("EMP-001", response.getEmployeeId());
    }

    @Test
    @DisplayName("getExitRecordById throws ResourceNotFoundException when record not found")
    void testGetRecordByIdNotFound() {
        when(employeeExitRepository.findByExitId("EXI-99999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> employeeExitService.getExitRecordById("EXI-99999"));
    }

    @Test
    @DisplayName("createExitRecord generates exitId and persists entity")
    void testCreateExitRecord() {
        CreateEmployeeExitRequest request = CreateEmployeeExitRequest.builder()
                .employeeId("EMP-020")
                .employeeName("Rahul Joshi")
                .resignationDate("25 Oct 2026")
                .approvalDate("26 Oct 2026")
                .noticePeriodDays(30)
                .lastWorkingDay("24 Nov 2026")
                .exitType("Resignation")
                .reason("Better Opportunity")
                .exitStatus("Pending")
                .assetsReturned("No")
                .fullAndFinalStatus("Pending")
                .notes("Transition started")
                .noticeCompletionDate("24 Nov 2026")
                .exitReadiness("Pending")
                .build();

        when(idGeneratorService.generateAndAllocateNextExitId()).thenReturn("EXI-00019");
        when(employeeExitRepository.save(any(EmployeeExitEntity.class))).thenAnswer(invocation -> {
            EmployeeExitEntity entity = invocation.getArgument(0);
            entity.setId(19L);
            return entity;
        });

        EmployeeExitResponse response = employeeExitService.createExitRecord(request);

        assertNotNull(response);
        assertEquals("EXI-00019", response.getExitId());
        assertEquals("Rahul Joshi", response.getEmployeeName());
        verify(employeeExitRepository, times(1)).save(any(EmployeeExitEntity.class));
    }

    @Test
    @DisplayName("createExitRecord throws BusinessValidationException when noticePeriodDays is negative")
    void testCreateRecordNegativeNoticePeriod() {
        CreateEmployeeExitRequest request = CreateEmployeeExitRequest.builder()
                .employeeId("EMP-020")
                .employeeName("Rahul Joshi")
                .resignationDate("25 Oct 2026")
                .noticePeriodDays(-5)
                .lastWorkingDay("24 Nov 2026")
                .exitType("Resignation")
                .reason("Better Opportunity")
                .build();

        assertThrows(BusinessValidationException.class, () -> employeeExitService.createExitRecord(request));
    }

    @Test
    @DisplayName("updateExitRecord updates fields successfully")
    void testUpdateExitRecord() {
        when(employeeExitRepository.findByExitId("EXI-00018")).thenReturn(Optional.of(sampleEntity));
        when(employeeExitRepository.save(any(EmployeeExitEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateEmployeeExitRequest request = UpdateEmployeeExitRequest.builder()
                .exitStatus("Approved")
                .exitReadiness("Completed")
                .assetsReturned("Yes")
                .fullAndFinalStatus("In Review")
                .build();

        EmployeeExitResponse response = employeeExitService.updateExitRecord("EXI-00018", request);

        assertNotNull(response);
        assertEquals("Approved", response.getExitStatus());
        assertEquals("Completed", response.getExitReadiness());
        assertEquals("In Review", response.getFullAndFinalStatus());
    }

    @Test
    @DisplayName("deleteExitRecord removes entity when found")
    void testDeleteExitRecord() {
        when(employeeExitRepository.existsByExitId("EXI-00018")).thenReturn(true);
        doNothing().when(employeeExitRepository).deleteByExitId("EXI-00018");

        employeeExitService.deleteExitRecord("EXI-00018");

        verify(employeeExitRepository, times(1)).deleteByExitId("EXI-00018");
    }

    @Test
    @DisplayName("getKpis computes dynamic counts correctly")
    void testGetKpis() {
        when(employeeExitRepository.count()).thenReturn(18L);
        when(employeeExitRepository.countApprovedExits()).thenReturn(12L);
        when(employeeExitRepository.countPendingApprovals()).thenReturn(4L);
        when(employeeExitRepository.countCompletedExits()).thenReturn(10L);

        EmployeeExitKpiResponse kpis = employeeExitService.getKpis();

        assertNotNull(kpis);
        assertEquals(18, kpis.getTotalExitRequests());
        assertEquals(12, kpis.getApprovedExits());
        assertEquals(4, kpis.getPendingApprovals());
        assertEquals(10, kpis.getCompletedExits());
    }

    @Test
    @DisplayName("getNextExitId delegates to idGeneratorService")
    void testGetNextExitId() {
        when(idGeneratorService.suggestNextExitId()).thenReturn("EXI-00019");

        NextExitIdResponse nextId = employeeExitService.getNextExitId();

        assertNotNull(nextId);
        assertEquals("EXI-00019", nextId.getNextExitId());
    }
}
