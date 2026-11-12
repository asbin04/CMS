package com.company.project.projects;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.projects.service.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectTaskRepository projectTaskRepository;

    @Mock
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private ProjectEntity sampleProject;
    private ProjectTaskEntity sampleTask;

    @BeforeEach
    void setUp() {
        sampleProject = ProjectEntity.builder()
                .id("PRJ-2026-048")
                .projectCode("PRJ-001")
                .projectName("School Management System")
                .clientId("CL-001")
                .projectManager("Amit Sharma")
                .startDate(LocalDate.of(2026, 10, 1))
                .plannedEndDate(LocalDate.of(2026, 12, 31))
                .status("In Progress")
                .priority("High")
                .health("On Track")
                .contractValue(new BigDecimal("1250000.00"))
                .tasksCompleted(12)
                .tasksTotal(18)
                .progress(65)
                .build();

        sampleTask = ProjectTaskEntity.builder()
                .id("TSK-00128")
                .projectId("PRJ-2026-048")
                .milestone("M1 - Planning")
                .taskName("Requirement Analysis")
                .assignedTo("Amit Sharma")
                .priority("High")
                .startDate(LocalDate.of(2026, 10, 1))
                .dueDate(LocalDate.of(2026, 10, 5))
                .estimatedHours(new BigDecimal("40.0"))
                .actualHours(new BigDecimal("38.0"))
                .status("In Progress")
                .progress(80)
                .dependencies("None")
                .subtasksCompleted(3)
                .subtasksTotal(4)
                .health("On Track")
                .build();
    }

    @Test
    @DisplayName("getAllProjects returns correctly mapped DTOs")
    void testGetAllProjects() {
        when(projectRepository.findAllByOrderByIdDesc()).thenReturn(List.of(sampleProject));

        List<ProjectDto> list = projectService.getAllProjects();
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getId()).isEqualTo("PRJ-2026-048");
        assertThat(list.get(0).getProjectName()).isEqualTo("School Management System");
        assertThat(list.get(0).getContractValue()).isEqualByComparingTo("1250000.00");
    }

    @Test
    @DisplayName("getProjectById returns DTO when found and null when absent")
    void testGetProjectById() {
        when(projectRepository.findById("PRJ-2026-048")).thenReturn(Optional.of(sampleProject));
        when(projectRepository.findById("NOT-FOUND")).thenReturn(Optional.empty());

        ProjectDto found = projectService.getProjectById("PRJ-2026-048");
        assertThat(found).isNotNull();
        assertThat(found.getProjectCode()).isEqualTo("PRJ-001");

        ProjectDto missing = projectService.getProjectById("NOT-FOUND");
        assertThat(missing).isNull();
    }

    @Test
    @DisplayName("createProject generates ID and persists entity")
    void testCreateProject() {
        when(projectRepository.count()).thenReturn(48L);
        when(projectRepository.save(any(ProjectEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        CreateProjectRequest req = CreateProjectRequest.builder()
                .projectCode("PRJ-049")
                .projectName("New Project")
                .clientId("CL-002")
                .projectManager("Sneha Nair")
                .startDate(LocalDate.of(2026, 11, 1))
                .plannedEndDate(LocalDate.of(2027, 2, 1))
                .build();

        ProjectDto dto = projectService.createProject(req);
        assertThat(dto.getId()).isEqualTo("PRJ-2026-049");
        assertThat(dto.getProjectName()).isEqualTo("New Project");
        assertThat(dto.getStatus()).isEqualTo("In Progress");
    }

    @Test
    @DisplayName("updateProject modifies existing fields and returns updated DTO")
    void testUpdateProject() {
        when(projectRepository.findById("PRJ-2026-048")).thenReturn(Optional.of(sampleProject));
        when(projectRepository.save(any(ProjectEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateProjectRequest req = UpdateProjectRequest.builder()
                .status("Completed")
                .progress(100)
                .build();

        ProjectDto updated = projectService.updateProject("PRJ-2026-048", req);
        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo("Completed");
        assertThat(updated.getProgress()).isEqualTo(100);
    }

    @Test
    @DisplayName("deleteProject deletes tasks and project entity")
    void testDeleteProject() {
        projectService.deleteProject("PRJ-2026-048");
        verify(projectTaskRepository).deleteByProjectId("PRJ-2026-048");
        verify(projectRepository).deleteById("PRJ-2026-048");
    }

    @Test
    @DisplayName("createTask generates ID, persists entity and syncs project task stats")
    void testCreateTask() {
        when(projectTaskRepository.count()).thenReturn(8L);
        when(projectTaskRepository.save(any(ProjectTaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectRepository.findById("PRJ-2026-048")).thenReturn(Optional.of(sampleProject));
        when(projectTaskRepository.countByProjectId("PRJ-2026-048")).thenReturn(10L);
        when(projectTaskRepository.countByProjectIdAndStatusIgnoreCase("PRJ-2026-048", "Completed")).thenReturn(5L);

        CreateProjectTaskRequest req = CreateProjectTaskRequest.builder()
                .projectId("PRJ-2026-048")
                .milestone("M1 - Setup")
                .taskName("DB Setup")
                .assignedTo("Rohan Verma")
                .startDate(LocalDate.of(2026, 10, 1))
                .dueDate(LocalDate.of(2026, 10, 5))
                .build();

        ProjectTaskDto dto = projectService.createTask(req);
        assertThat(dto.getId()).isEqualTo("TSK-00128");
        assertThat(dto.getTaskName()).isEqualTo("DB Setup");
        verify(projectRepository).save(any(ProjectEntity.class));
    }

    @Test
    @DisplayName("updateTask modifies task fields and syncs project stats")
    void testUpdateTask() {
        when(projectTaskRepository.findById("TSK-00128")).thenReturn(Optional.of(sampleTask));
        when(projectTaskRepository.save(any(ProjectTaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));
        when(projectRepository.findById("PRJ-2026-048")).thenReturn(Optional.of(sampleProject));
        when(projectTaskRepository.countByProjectId("PRJ-2026-048")).thenReturn(10L);
        when(projectTaskRepository.countByProjectIdAndStatusIgnoreCase("PRJ-2026-048", "Completed")).thenReturn(8L);

        UpdateProjectTaskRequest req = UpdateProjectTaskRequest.builder()
                .status("Completed")
                .progress(100)
                .build();

        ProjectTaskDto updated = projectService.updateTask("TSK-00128", req);
        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo("Completed");
        assertThat(updated.getProgress()).isEqualTo(100);
        verify(projectRepository).save(any(ProjectEntity.class));
    }

    @Test
    @DisplayName("deleteTask removes task and syncs project stats")
    void testDeleteTask() {
        when(projectTaskRepository.findById("TSK-00128")).thenReturn(Optional.of(sampleTask));
        when(projectRepository.findById("PRJ-2026-048")).thenReturn(Optional.of(sampleProject));

        projectService.deleteTask("TSK-00128");
        verify(projectTaskRepository).deleteById("TSK-00128");
        verify(projectRepository).save(any(ProjectEntity.class));
    }

    @Test
    @DisplayName("getProjectKpis calculates KPIs correctly")
    void testGetProjectKpis() {
        when(projectRepository.countTotalProjects()).thenReturn(48L);
        when(projectRepository.countActiveProjects()).thenReturn(32L);
        when(projectRepository.countProjectsAtRisk()).thenReturn(6L);
        when(projectRepository.sumTotalContractValue()).thenReturn(new BigDecimal("48690.00"));

        ProjectKpiResponse kpis = projectService.getProjectKpis();
        assertThat(kpis.getTotalProjects()).isEqualTo(48L);
        assertThat(kpis.getActiveProjects()).isEqualTo(32L);
        assertThat(kpis.getProjectsAtRisk()).isEqualTo(6L);
        assertThat(kpis.getTotalContractValueFormatted()).contains("48,690");
    }

    @Test
    @DisplayName("getProjectFilterOptions returns distinct lists")
    void testGetProjectFilterOptions() {
        when(projectRepository.findDistinctClients()).thenReturn(List.of("CL-001"));
        when(projectRepository.findDistinctProjectManagers()).thenReturn(List.of("Amit Sharma"));
        when(projectRepository.findDistinctStatuses()).thenReturn(List.of("In Progress"));
        when(projectRepository.findDistinctPriorities()).thenReturn(List.of("High"));

        ProjectFilterOptionsResponse resp = projectService.getProjectFilterOptions();
        assertThat(resp.getClients()).containsExactly("CL-001");
        assertThat(resp.getManagers()).containsExactly("Amit Sharma");
    }

    @Test
    @DisplayName("getTaskFilterOptions returns distinct lists")
    void testGetTaskFilterOptions() {
        when(projectTaskRepository.findDistinctProjectIds()).thenReturn(List.of("PRJ-001"));
        when(projectTaskRepository.findDistinctMilestones()).thenReturn(List.of("M1 - Setup"));
        when(projectTaskRepository.findDistinctAssignees()).thenReturn(List.of("Amit Sharma"));
        when(projectTaskRepository.findDistinctStatuses()).thenReturn(List.of("In Progress"));
        when(projectTaskRepository.findDistinctPriorities()).thenReturn(List.of("High"));

        TaskFilterOptionsResponse resp = projectService.getTaskFilterOptions();
        assertThat(resp.getProjects()).containsExactly("PRJ-001");
        assertThat(resp.getMilestones()).containsExactly("M1 - Setup");
    }

    @Test
    @DisplayName("getPerformanceSummary handles zero projects gracefully without division by zero")
    void testGetPerformanceSummary_ZeroProjects() {
        when(jdbcTemplate.queryForList(anyString(), any(Object[].class))).thenReturn(List.of());

        ProjectPerformanceDashboardResponse summary = projectService.getPerformanceSummary();

        assertThat(summary.getOverview().getActiveProjects()).isEqualTo(0L);
        assertThat(summary.getFinancials().getContractRevenueValue()).isEqualTo(BigDecimal.ZERO);
        assertThat(summary.getFinancials().getOverallProjectMargin()).isEqualTo(BigDecimal.ZERO);
        assertThat(summary.getKeyInsights().getBulletPoints()).hasSize(3);
        assertThat(summary.getKeyInsights().getBulletPoints().get(0)).contains("No active projects");
    }

    @Test
    @DisplayName("getPerformanceSummary calculates metrics, priority distribution, and percentages accurately")
    void testGetPerformanceSummary_WithData() {
        java.util.Map<String, Object> projectRow = java.util.Map.of(
                "completed_count", 10L,
                "delayed_count", 2L,
                "at_risk_count", 4L,
                "upcoming_count", 2L,
                "on_track_count", 12L,
                "active_total", 20L,
                "total_projects", 30L,
                "total_revenue", new BigDecimal("10000000.00")
        );
        java.util.Map<String, Object> tsRow = java.util.Map.of(
                "logged_hours", new BigDecimal("200.00"),
                "billable_amount", new BigDecimal("1000000.00"),
                "timesheets_count", 25L
        );
        java.util.Map<String, Object> taskRow = java.util.Map.of(
                "open_tasks", 15L,
                "overdue_tasks", 3L,
                "milestones_count", 8L,
                "total_tasks", 25L
        );

        when(jdbcTemplate.queryForList(contains("public.projects"), any(Object[].class)))
                .thenReturn(List.of(projectRow));
        when(jdbcTemplate.queryForList(contains("public.project_timesheets")))
                .thenReturn(List.of(tsRow));
        when(jdbcTemplate.queryForList(contains("public.project_tasks"), any(Object[].class)))
                .thenReturn(List.of(taskRow));

        ProjectPerformanceDashboardResponse summary = projectService.getPerformanceSummary();

        assertThat(summary.getOverview().getActiveProjects()).isEqualTo(20L);
        assertThat(summary.getOverview().getDelayedProjects()).isEqualTo(2L);
        assertThat(summary.getOverview().getAtRiskProjects()).isEqualTo(4L);
        assertThat(summary.getOverview().getDueSoonProjects()).isEqualTo(2L);
        // Distribution sums to active total (12 + 4 + 2 + 2 = 20)
        assertThat(summary.getDistribution().getTotalProjects()).isEqualTo(20L);
        assertThat(summary.getDistribution().getOnTrack().getCount()).isEqualTo(12L);
        assertThat(summary.getDistribution().getAtRisk().getCount()).isEqualTo(4L);
        assertThat(summary.getDistribution().getDelayed().getCount()).isEqualTo(2L);
        assertThat(summary.getDistribution().getUpcoming().getCount()).isEqualTo(2L);
        // Financials: Revenue 10,000,000, Cost 1,000,000, Profit 9,000,000, Margin 90%
        assertThat(summary.getFinancials().getContractRevenueValue()).isEqualTo(new BigDecimal("10000000.00"));
        assertThat(summary.getFinancials().getTotalProjectCost()).isEqualTo(new BigDecimal("1000000.00"));
        assertThat(summary.getFinancials().getEstimatedProjectProfit()).isEqualTo(new BigDecimal("9000000.00"));
        assertThat(summary.getFinancials().getOverallProjectMarginFormatted()).isEqualTo("90.00%");
    }

    @Test
    @DisplayName("exportProfitabilityCsv sanitizes CSV formula injection characters (=, +, -, @)")
    void testExportProfitabilityCsv_FormulaInjectionPrevention() {
        java.util.Map<String, Object> row = java.util.Map.of(
                "project_code", "=cmd|' /C calc'!A0",
                "project_name", "+Malicious Formula",
                "revenue", new BigDecimal("500000.00"),
                "total_cost", new BigDecimal("100000.00"),
                "profit", new BigDecimal("400000.00"),
                "margin", new BigDecimal("80.0"),
                "computed_health", "@RiskyHealth",
                "status", "In Progress"
        );

        when(jdbcTemplate.queryForList(anyString(), any(Object[].class))).thenReturn(List.of(row));

        byte[] csvBytes = projectService.exportProfitabilityCsv(null, "All");
        String csv = new String(csvBytes, java.nio.charset.StandardCharsets.UTF_8);

        // Verify malicious characters are prefixed with single quote '
        assertThat(csv).contains("'=cmd|' /C calc'!A0");
        assertThat(csv).contains("'+Malicious Formula");
        assertThat(csv).contains("'@RiskyHealth");
    }
}
