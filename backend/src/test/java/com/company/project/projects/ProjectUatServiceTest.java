package com.company.project.projects;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectUatEntity;
import com.company.project.projects.repository.ProjectUatRepository;
import com.company.project.projects.service.ProjectUatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectUatServiceTest {

    @Mock
    private ProjectUatRepository repository;

    @InjectMocks
    private ProjectUatServiceImpl service;

    private ProjectUatEntity sampleUat;

    @BeforeEach
    void setUp() {
        sampleUat = ProjectUatEntity.builder()
                .id("UAT-2026-0483")
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0184")
                .testDate(LocalDate.of(2026, 10, 28))
                .testCase("TC-001")
                .expectedResult("User can login with valid credentials")
                .actualResult("Login successful")
                .testerName("Amit Sharma")
                .testerInitials("AS")
                .testerColor("indigo")
                .status("Passed")
                .defectId(null)
                .clientApproval("Approved")
                .approvalDate(LocalDate.of(2026, 10, 28))
                .comments("Working as expected")
                .build();
    }

    @Test
    @DisplayName("getAllUats returns list of DTOs ordered by id desc")
    void testGetAllUats() {
        when(repository.findAllByOrderByIdDesc()).thenReturn(List.of(sampleUat));

        List<ProjectUatDto> result = service.getAllUats();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("UAT-2026-0483");
        assertThat(result.get(0).getTesterName()).isEqualTo("Amit Sharma");
        assertThat(result.get(0).getClientApproval()).isEqualTo("Approved");
    }

    @Test
    @DisplayName("getAllUats with filter parameters delegates to repository findFiltered")
    void testGetAllUatsFiltered() {
        when(repository.findFiltered("TC-001", "PRJ-001", "Passed", "Approved", "Amit Sharma"))
                .thenReturn(List.of(sampleUat));

        List<ProjectUatDto> result = service.getAllUats("TC-001", "PRJ-001", "Passed", "Approved", "Amit Sharma");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("UAT-2026-0483");
        verify(repository, times(1)).findFiltered("TC-001", "PRJ-001", "Passed", "Approved", "Amit Sharma");
    }

    @Test
    @DisplayName("getKpis computes exact dynamic counts and trends")
    void testGetKpis() {
        when(repository.count()).thenReturn(324L);
        when(repository.countByStatusIgnoreCase("In Testing")).thenReturn(96L);
        when(repository.countByStatusIgnoreCase("Passed")).thenReturn(182L);
        when(repository.countDefects()).thenReturn(46L);
        when(repository.countByClientApprovalIgnoreCase("Approved")).thenReturn(168L);

        UatKpiResponse kpis = service.getKpis();

        assertThat(kpis.getTotalUats()).isEqualTo(324L);
        assertThat(kpis.getInTesting()).isEqualTo(96L);
        assertThat(kpis.getPassed()).isEqualTo(182L);
        assertThat(kpis.getDefectsLogged()).isEqualTo(46L);
        assertThat(kpis.getClientApproved()).isEqualTo(168L);
        assertThat(kpis.getTotalUatsTrend()).contains("14%");
    }

    @Test
    @DisplayName("getFilterOptions returns distinct options or fallbacks")
    void testGetFilterOptions() {
        when(repository.findDistinctProjectIds()).thenReturn(Arrays.asList("PRJ-001", "PRJ-002"));
        when(repository.findDistinctStatuses()).thenReturn(Arrays.asList("Passed", "Failed"));
        when(repository.findDistinctClientApprovals()).thenReturn(Arrays.asList("Approved", "Pending"));
        when(repository.findDistinctTesters()).thenReturn(Arrays.asList("Amit Sharma", "Sneha Nair"));

        UatFilterOptionsResponse filters = service.getFilterOptions();

        assertThat(filters.getProjects()).containsExactly("PRJ-001", "PRJ-002");
        assertThat(filters.getStatuses()).contains("Passed");
        assertThat(filters.getClientApprovals()).contains("Approved");
        assertThat(filters.getTesters()).contains("Amit Sharma");
    }

    @Test
    @DisplayName("createUat generates id and saves entity")
    void testCreateUat() {
        CreateProjectUatRequest request = CreateProjectUatRequest.builder()
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0186")
                .testDate(LocalDate.of(2026, 10, 29))
                .testCase("TC-011")
                .expectedResult("Search results load")
                .actualResult("All results match query")
                .testerName("Sneha Nair")
                .status("Passed")
                .clientApproval("Approved")
                .build();

        when(repository.count()).thenReturn(324L);
        when(repository.save(any(ProjectUatEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProjectUatDto created = service.createUat(request);

        assertThat(created.getId()).startsWith("UAT-2026-");
        assertThat(created.getTesterInitials()).isEqualTo("SN");
        assertThat(created.getTesterColor()).isEqualTo("purple");
        verify(repository, times(1)).save(any(ProjectUatEntity.class));
    }

    @Test
    @DisplayName("deleteUat removes entity when found")
    void testDeleteUat() {
        when(repository.existsById("UAT-2026-0483")).thenReturn(true);
        doNothing().when(repository).deleteById("UAT-2026-0483");

        service.deleteUat("UAT-2026-0483");

        verify(repository, times(1)).deleteById("UAT-2026-0483");
    }
}

