package com.company.project.projects;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.projects.controller.ProjectController;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    @Test
    @DisplayName("GET /api/v1/projects returns 200 with list of projects")
    void testGetAllProjects() throws Exception {
        ProjectDto p = ProjectDto.builder()
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

        when(projectService.getAllProjects()).thenReturn(List.of(p));

        mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("PRJ-2026-048"))
                .andExpect(jsonPath("$.data[0].projectName").value("School Management System"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/kpis returns 200 with KPI metrics")
    void testGetProjectKpis() throws Exception {
        ProjectKpiResponse kpi = ProjectKpiResponse.builder()
                .totalProjects(48)
                .totalProjectsTrend("↑ 12% vs last month")
                .activeProjects(32)
                .activeProjectsTrend("↑ 18% vs last month")
                .projectsAtRisk(6)
                .projectsAtRiskTrend("↓ 5% vs last month")
                .totalContractValue(new BigDecimal("4869000.00"))
                .totalContractValueFormatted("₹ 48,69,000")
                .totalContractValueTrend("↑ 14% vs last month")
                .build();

        when(projectService.getProjectKpis()).thenReturn(kpi);

        mockMvc.perform(get("/api/v1/projects/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalProjects").value(48))
                .andExpect(jsonPath("$.data.activeProjects").value(32))
                .andExpect(jsonPath("$.data.projectsAtRisk").value(6));
    }

    @Test
    @DisplayName("GET /api/v1/projects/filters returns distinct filter options")
    void testGetProjectFilters() throws Exception {
        ProjectFilterOptionsResponse resp = ProjectFilterOptionsResponse.builder()
                .clients(List.of("CL-001", "CL-002"))
                .managers(List.of("Amit Sharma", "Sneha Nair"))
                .statuses(List.of("In Progress", "Completed"))
                .priorities(List.of("High", "Medium"))
                .build();

        when(projectService.getProjectFilterOptions()).thenReturn(resp);

        mockMvc.perform(get("/api/v1/projects/filters"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.clients[0]").value("CL-001"))
                .andExpect(jsonPath("$.data.managers[0]").value("Amit Sharma"));
    }

    @Test
    @DisplayName("POST /api/v1/projects creates a new project")
    void testCreateProject() throws Exception {
        CreateProjectRequest req = CreateProjectRequest.builder()
                .projectCode("PRJ-099")
                .projectName("New Project Portal")
                .clientId("CL-001")
                .projectManager("Sneha Nair")
                .startDate(LocalDate.of(2026, 11, 1))
                .plannedEndDate(LocalDate.of(2026, 12, 1))
                .status("Planning")
                .priority("Medium")
                .health("On Track")
                .contractValue(new BigDecimal("500000.00"))
                .build();

        ProjectDto created = ProjectDto.builder()
                .id("PRJ-2026-099")
                .projectCode("PRJ-099")
                .projectName("New Project Portal")
                .clientId("CL-001")
                .projectManager("Sneha Nair")
                .startDate(LocalDate.of(2026, 11, 1))
                .plannedEndDate(LocalDate.of(2026, 12, 1))
                .status("Planning")
                .priority("Medium")
                .health("On Track")
                .contractValue(new BigDecimal("500000.00"))
                .build();

        when(projectService.createProject(any())).thenReturn(created);

        mockMvc.perform(post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("PRJ-2026-099"));
    }

    @Test
    @DisplayName("PUT /api/v1/projects/{id} updates an existing project")
    void testUpdateProject() throws Exception {
        UpdateProjectRequest req = UpdateProjectRequest.builder()
                .status("Completed")
                .progress(100)
                .build();

        ProjectDto updated = ProjectDto.builder()
                .id("PRJ-2026-048")
                .projectCode("PRJ-001")
                .projectName("School Management System")
                .status("Completed")
                .progress(100)
                .build();

        when(projectService.updateProject(eq("PRJ-2026-048"), any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/projects/PRJ-2026-048")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Completed"))
                .andExpect(jsonPath("$.data.progress").value(100));
    }

    @Test
    @DisplayName("DELETE /api/v1/projects/{id} deletes project")
    void testDeleteProject() throws Exception {
        doNothing().when(projectService).deleteProject("PRJ-2026-048");

        mockMvc.perform(delete("/api/v1/projects/PRJ-2026-048"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/projects/tasks returns 200 with list of tasks")
    void testGetAllTasks() throws Exception {
        ProjectTaskDto task = ProjectTaskDto.builder()
                .id("TSK-00128")
                .projectId("PRJ-001")
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

        when(projectService.getAllTasks()).thenReturn(List.of(task));

        mockMvc.perform(get("/api/v1/projects/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value("TSK-00128"))
                .andExpect(jsonPath("$.data[0].taskName").value("Requirement Analysis"));
    }

    @Test
    @DisplayName("PUT /api/v1/projects/tasks/{id} updates a task")
    void testUpdateTask() throws Exception {
        UpdateProjectTaskRequest req = UpdateProjectTaskRequest.builder()
                .status("Completed")
                .progress(100)
                .build();

        ProjectTaskDto updated = ProjectTaskDto.builder()
                .id("TSK-00128")
                .projectId("PRJ-001")
                .status("Completed")
                .progress(100)
                .build();

        when(projectService.updateTask(eq("TSK-00128"), any())).thenReturn(updated);

        mockMvc.perform(put("/api/v1/projects/tasks/TSK-00128")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("Completed"));
    }

    @Test
    @DisplayName("DELETE /api/v1/projects/tasks/{id} deletes task")
    void testDeleteTask() throws Exception {
        doNothing().when(projectService).deleteTask("TSK-00128");

        mockMvc.perform(delete("/api/v1/projects/tasks/TSK-00128"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/v1/projects/performance/dashboard returns 200 with dashboard metrics and profitability")
    void testGetPerformanceDashboard() throws Exception {
        ProjectPerformanceDashboardResponse response = ProjectPerformanceDashboardResponse.builder()
                .overview(ProjectPerformanceDashboardResponse.OverviewKpis.builder()
                        .activeProjects(10)
                        .atRiskProjects(2)
                        .delayedProjects(1)
                        .dueSoonProjects(3)
                        .build())
                .financials(ProjectPerformanceDashboardResponse.FinancialKpis.builder()
                        .contractRevenueValue(new BigDecimal("1250000.00"))
                        .contractRevenueFormatted("₹ 12,50,000.00")
                        .totalProjectCost(new BigDecimal("250000.00"))
                        .totalProjectCostFormatted("₹ 2,50,000.00")
                        .estimatedProjectProfit(new BigDecimal("1000000.00"))
                        .estimatedProjectProfitFormatted("₹ 10,00,000.00")
                        .overallProjectMargin(new BigDecimal("80.00"))
                        .overallProjectMarginFormatted("80.00%")
                        .build())
                .delivery(ProjectPerformanceDashboardResponse.DeliveryPerformance.builder()
                        .loggedHours(new BigDecimal("120.50"))
                        .loggedHoursFormatted("120.50")
                        .billableAmount(new BigDecimal("150000.00"))
                        .billableAmountFormatted("₹ 1,50,000.00")
                        .openTasks(15)
                        .overdueTasks(2)
                        .build())
                .deliveryFlow(ProjectPerformanceDashboardResponse.DeliveryFlow.builder()
                        .projectsCount(10)
                        .milestonesCount(8)
                        .tasksCount(25)
                        .timesheetsCount(40)
                        .build())
                .distribution(ProjectPerformanceDashboardResponse.ProjectDistribution.builder()
                        .totalProjects(10)
                        .onTrack(ProjectPerformanceDashboardResponse.DistributionItem.builder().count(7).percentage(70.0).formatted("7 (70.0%)").build())
                        .atRisk(ProjectPerformanceDashboardResponse.DistributionItem.builder().count(2).percentage(20.0).formatted("2 (20.0%)").build())
                        .delayed(ProjectPerformanceDashboardResponse.DistributionItem.builder().count(1).percentage(10.0).formatted("1 (10.0%)").build())
                        .upcoming(ProjectPerformanceDashboardResponse.DistributionItem.builder().count(3).percentage(30.0).formatted("3 (30.0%)").build())
                        .build())
                .keyInsights(ProjectPerformanceDashboardResponse.KeyInsights.builder()
                        .atRiskPercentage("20%")
                        .delayedPercentage("10%")
                        .dueSoonCount(3)
                        .bulletPoints(List.of("20% of projects are currently at risk."))
                        .build())
                .profitability(List.of(ProjectPerformanceDashboardResponse.ProjectProfitabilityRow.builder()
                        .sNo(1)
                        .projectId("PRJ-001")
                        .projectCode("PRJ-001")
                        .projectName("School Management System")
                        .revenue(new BigDecimal("1250000.00"))
                        .revenueFormatted("₹ 12,50,000.00")
                        .totalCost(BigDecimal.ZERO)
                        .totalCostFormatted("₹ 0.00")
                        .profit(new BigDecimal("1250000.00"))
                        .profitFormatted("₹ 12,50,000.00")
                        .margin(new BigDecimal("100.0"))
                        .marginFormatted("100.0%")
                        .health("On Track")
                        .status("In Progress")
                        .build()))
                .build();

        when(projectService.getPerformanceDashboard(any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/projects/performance/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.overview.activeProjects").value(10))
                .andExpect(jsonPath("$.data.financials.contractRevenueFormatted").value("₹ 12,50,000.00"))
                .andExpect(jsonPath("$.data.delivery.openTasks").value(15))
                .andExpect(jsonPath("$.data.profitability[0].projectCode").value("PRJ-001"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/performance/summary returns 200 with summary metrics")
    void getPerformanceSummary_Success() throws Exception {
        ProjectPerformanceDashboardResponse response = ProjectPerformanceDashboardResponse.builder()
                .overview(ProjectPerformanceDashboardResponse.OverviewKpis.builder().activeProjects(5).build())
                .financials(ProjectPerformanceDashboardResponse.FinancialKpis.builder().contractRevenueFormatted("₹ 50,00,000.00").build())
                .build();

        when(projectService.getPerformanceSummary()).thenReturn(response);

        mockMvc.perform(get("/api/v1/projects/performance/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.overview.activeProjects").value(5))
                .andExpect(jsonPath("$.data.financials.contractRevenueFormatted").value("₹ 50,00,000.00"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/performance/profitability returns 200 with paginated rows")
    void getPerformanceProfitability_Success() throws Exception {
        ProjectProfitabilityPageResponse response = ProjectProfitabilityPageResponse.builder()
                .page(0)
                .size(5)
                .totalElements(1)
                .totalPages(1)
                .content(List.of(ProjectPerformanceDashboardResponse.ProjectProfitabilityRow.builder()
                        .sNo(1)
                        .projectCode("PRJ-001")
                        .projectName("School Management System")
                        .health("On Track")
                        .build()))
                .build();

        when(projectService.getProfitabilityPage(eq(0), eq(5), any(), any(), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/projects/performance/profitability?page=0&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].projectCode").value("PRJ-001"));
    }

    @Test
    @DisplayName("GET /api/v1/projects/performance/export returns CSV file")
    void exportPerformanceProfitability_Success() throws Exception {
        byte[] csv = "S.No,Project ID,Project Name\n1,PRJ-001,Test\n".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        when(projectService.exportProfitabilityCsv(any(), any())).thenReturn(csv);

        mockMvc.perform(get("/api/v1/projects/performance/export"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv;charset=UTF-8"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"project_performance_report.csv\""));
    }
}
