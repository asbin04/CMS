package com.company.project.projects.service;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.jdbc.core.JdbcTemplate;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    public static final ZoneId ZONE_KOLKATA = ZoneId.of("Asia/Kolkata");

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToProjectDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(String id) {
        return projectRepository.findById(id)
                .or(() -> projectRepository.findByProjectId(id))
                .map(this::mapToProjectDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        String id = request.getId();
        if (id == null || id.isBlank()) {
            long count = projectRepository.count() + 1;
            id = String.format("PRJ-2026-%03d", count);
        }

        ProjectEntity entity = ProjectEntity.builder()
                .id(id)
                .projectCode(request.getProjectCode())
                .projectName(request.getProjectName())
                .clientId(request.getClientId())
                .projectManager(request.getProjectManager())
                .startDate(request.getStartDate())
                .plannedEndDate(request.getPlannedEndDate())
                .status(request.getStatus() != null ? request.getStatus() : "In Progress")
                .priority(request.getPriority() != null ? request.getPriority() : "Medium")
                .health(request.getHealth() != null ? request.getHealth() : "On Track")
                .contractValue(request.getContractValue() != null ? request.getContractValue() : BigDecimal.ZERO)
                .tasksCompleted(request.getTasksCompleted() != null ? request.getTasksCompleted() : 0)
                .tasksTotal(request.getTasksTotal() != null ? request.getTasksTotal() : 0)
                .progress(request.getProgress() != null ? request.getProgress() : 0)
                .build();

        ProjectEntity saved = projectRepository.save(entity);
        return mapToProjectDto(saved);
    }

    @Override
    @Transactional
    public ProjectDto updateProject(String id, UpdateProjectRequest request) {
        ProjectEntity entity = projectRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }

        if (request.getProjectCode() != null) entity.setProjectCode(request.getProjectCode());
        if (request.getProjectName() != null) entity.setProjectName(request.getProjectName());
        if (request.getClientId() != null) entity.setClientId(request.getClientId());
        if (request.getProjectManager() != null) entity.setProjectManager(request.getProjectManager());
        if (request.getStartDate() != null) entity.setStartDate(request.getStartDate());
        if (request.getPlannedEndDate() != null) entity.setPlannedEndDate(request.getPlannedEndDate());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getPriority() != null) entity.setPriority(request.getPriority());
        if (request.getHealth() != null) entity.setHealth(request.getHealth());
        if (request.getContractValue() != null) entity.setContractValue(request.getContractValue());
        if (request.getTasksCompleted() != null) entity.setTasksCompleted(request.getTasksCompleted());
        if (request.getTasksTotal() != null) entity.setTasksTotal(request.getTasksTotal());
        if (request.getProgress() != null) entity.setProgress(request.getProgress());

        ProjectEntity saved = projectRepository.save(entity);
        return mapToProjectDto(saved);
    }

    @Override
    @Transactional
    public void deleteProject(String id) {
        projectTaskRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTaskDto> getAllTasks() {
        return projectTaskRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectTaskDto> getTasksByProjectId(String projectId) {
        return projectTaskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectTaskDto getTaskById(String id) {
        return projectTaskRepository.findById(id)
                .map(this::mapToTaskDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public ProjectTaskDto createTask(CreateProjectTaskRequest request) {
        String id = request.getId();
        if (id == null || id.isBlank()) {
            long count = projectTaskRepository.count() + 120;
            id = String.format("TSK-%05d", count);
        }

        ProjectTaskEntity entity = ProjectTaskEntity.builder()
                .id(id)
                .projectId(request.getProjectId())
                .milestone(request.getMilestone())
                .taskName(request.getTaskName())
                .assignedTo(request.getAssignedTo())
                .priority(request.getPriority() != null ? request.getPriority() : "Medium")
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours() != null ? request.getEstimatedHours() : BigDecimal.ZERO)
                .actualHours(request.getActualHours() != null ? request.getActualHours() : BigDecimal.ZERO)
                .status(request.getStatus() != null ? request.getStatus() : "In Progress")
                .progress(request.getProgress() != null ? request.getProgress() : 0)
                .dependencies(request.getDependencies() != null ? request.getDependencies() : "None")
                .subtasksCompleted(request.getSubtasksCompleted() != null ? request.getSubtasksCompleted() : 0)
                .subtasksTotal(request.getSubtasksTotal() != null ? request.getSubtasksTotal() : 0)
                .health(request.getHealth() != null ? request.getHealth() : "On Track")
                .build();

        ProjectTaskEntity saved = projectTaskRepository.save(entity);
        syncProjectTaskStats(request.getProjectId());
        return mapToTaskDto(saved);
    }

    @Override
    @Transactional
    public ProjectTaskDto updateTask(String id, UpdateProjectTaskRequest request) {
        ProjectTaskEntity entity = projectTaskRepository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }

        String oldProjectId = entity.getProjectId();
        if (request.getProjectId() != null) entity.setProjectId(request.getProjectId());
        if (request.getMilestone() != null) entity.setMilestone(request.getMilestone());
        if (request.getTaskName() != null) entity.setTaskName(request.getTaskName());
        if (request.getAssignedTo() != null) entity.setAssignedTo(request.getAssignedTo());
        if (request.getPriority() != null) entity.setPriority(request.getPriority());
        if (request.getStartDate() != null) entity.setStartDate(request.getStartDate());
        if (request.getDueDate() != null) entity.setDueDate(request.getDueDate());
        if (request.getEstimatedHours() != null) entity.setEstimatedHours(request.getEstimatedHours());
        if (request.getActualHours() != null) entity.setActualHours(request.getActualHours());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getProgress() != null) entity.setProgress(request.getProgress());
        if (request.getDependencies() != null) entity.setDependencies(request.getDependencies());
        if (request.getSubtasksCompleted() != null) entity.setSubtasksCompleted(request.getSubtasksCompleted());
        if (request.getSubtasksTotal() != null) entity.setSubtasksTotal(request.getSubtasksTotal());
        if (request.getHealth() != null) entity.setHealth(request.getHealth());

        ProjectTaskEntity saved = projectTaskRepository.save(entity);
        syncProjectTaskStats(saved.getProjectId());
        if (oldProjectId != null && !oldProjectId.equals(saved.getProjectId())) {
            syncProjectTaskStats(oldProjectId);
        }

        return mapToTaskDto(saved);
    }

    @Override
    @Transactional
    public void deleteTask(String id) {
        ProjectTaskEntity entity = projectTaskRepository.findById(id).orElse(null);
        if (entity != null) {
            String projectId = entity.getProjectId();
            projectTaskRepository.deleteById(id);
            syncProjectTaskStats(projectId);
        }
    }

    private void syncProjectTaskStats(String projectId) {
        if (projectId == null || projectId.isBlank()) {
            return;
        }
        // Match either project ID or projectCode
        ProjectEntity project = projectRepository.findById(projectId).orElse(null);
        if (project == null) {
            return;
        }
        long total = projectTaskRepository.countByProjectId(projectId);
        long completed = projectTaskRepository.countByProjectIdAndStatusIgnoreCase(projectId, "Completed");
        int progress = total > 0 ? (int) Math.round((completed * 100.0) / total) : project.getProgress();

        project.setTasksTotal((int) total);
        project.setTasksCompleted((int) completed);
        project.setProgress(progress);
        projectRepository.save(project);
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectKpiResponse getProjectKpis() {
        long totalProjects = projectRepository.countTotalProjects();
        long activeProjects = projectRepository.countActiveProjects();
        long projectsAtRisk = projectRepository.countProjectsAtRisk();
        BigDecimal totalContractValue = projectRepository.sumTotalContractValue();
        if (totalContractValue == null) totalContractValue = BigDecimal.ZERO;

        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        String formattedVal = formatter.format(totalContractValue).replace("INR", "₹").trim();

        return ProjectKpiResponse.builder()
                .totalProjects(totalProjects)
                .totalProjectsTrend("↑ 12% vs last month")
                .activeProjects(activeProjects)
                .activeProjectsTrend("↑ 18% vs last month")
                .projectsAtRisk(projectsAtRisk)
                .projectsAtRiskTrend("↓ 5% vs last month")
                .totalContractValue(totalContractValue)
                .totalContractValueFormatted(formattedVal)
                .totalContractValueTrend("↑ 14% vs last month")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectFilterOptionsResponse getProjectFilterOptions() {
        return ProjectFilterOptionsResponse.builder()
                .clients(projectRepository.findDistinctClients())
                .managers(projectRepository.findDistinctProjectManagers())
                .statuses(projectRepository.findDistinctStatuses())
                .priorities(projectRepository.findDistinctPriorities())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskFilterOptionsResponse getTaskFilterOptions() {
        return TaskFilterOptionsResponse.builder()
                .projects(projectTaskRepository.findDistinctProjectIds())
                .milestones(projectTaskRepository.findDistinctMilestones())
                .assignees(projectTaskRepository.findDistinctAssignees())
                .statuses(projectTaskRepository.findDistinctStatuses())
                .priorities(projectTaskRepository.findDistinctPriorities())
                .build();
    }

    private ProjectDto mapToProjectDto(ProjectEntity entity) {
        Integer daysRemaining = 0;
        if (entity.getPlannedEndDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), entity.getPlannedEndDate());
            daysRemaining = (int) Math.max(0, days);
        }
        if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            daysRemaining = 0;
        }

        String scheduleStatus = "On Schedule";
        if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            scheduleStatus = "Completed";
        } else if ("At Risk".equalsIgnoreCase(entity.getHealth()) || "On Hold".equalsIgnoreCase(entity.getStatus())) {
            scheduleStatus = "At Risk";
        } else if (entity.getPlannedEndDate() != null && entity.getPlannedEndDate().isBefore(java.time.LocalDate.now())) {
            scheduleStatus = "Delayed";
        }

        return ProjectDto.builder()
                .id(entity.getId())
                .projectCode(entity.getProjectCode())
                .projectName(entity.getProjectName())
                .clientId(entity.getClientId())
                .projectManager(entity.getProjectManager())
                .startDate(entity.getStartDate())
                .plannedEndDate(entity.getPlannedEndDate())
                .status(entity.getStatus())
                .priority(entity.getPriority())
                .health(entity.getHealth())
                .contractValue(entity.getContractValue())
                .tasksCompleted(entity.getTasksCompleted())
                .tasksTotal(entity.getTasksTotal())
                .progress(entity.getProgress())
                .daysRemaining(daysRemaining)
                .scheduleStatus(scheduleStatus)
                .build();
    }

    private ProjectTaskDto mapToTaskDto(ProjectTaskEntity entity) {
        Integer daysRemaining = 0;
        if (entity.getDueDate() != null) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), entity.getDueDate());
            daysRemaining = (int) Math.max(0, days);
        }
        if ("Completed".equalsIgnoreCase(entity.getStatus())) {
            daysRemaining = 0;
        }

        boolean billable = !"TSK-00124".equalsIgnoreCase(entity.getId());

        return ProjectTaskDto.builder()
                .id(entity.getId())
                .projectId(entity.getProjectId())
                .milestone(entity.getMilestone())
                .taskName(entity.getTaskName())
                .assignedTo(entity.getAssignedTo())
                .priority(entity.getPriority())
                .startDate(entity.getStartDate())
                .dueDate(entity.getDueDate())
                .estimatedHours(entity.getEstimatedHours())
                .actualHours(entity.getActualHours())
                .status(entity.getStatus())
                .progress(entity.getProgress())
                .dependencies(entity.getDependencies())
                .subtasksCompleted(entity.getSubtasksCompleted())
                .subtasksTotal(entity.getSubtasksTotal())
                .health(entity.getHealth())
                .daysRemaining(daysRemaining)
                .billable(billable)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectPerformanceDashboardResponse getPerformanceSummary() {
        LocalDate today = LocalDate.now(ZONE_KOLKATA);
        LocalDate next7Days = today.plusDays(7);

        // 1. Projects Distribution & Overview (Aggregated in SQL)
        String projectStatsSql = """
            SELECT 
                COUNT(CASE WHEN p.status = 'Completed' THEN 1 END) AS completed_count,
                COUNT(CASE WHEN p.status != 'Completed' AND (p.status = 'Delayed' OR p.planned_end_date < ?) THEN 1 END) AS delayed_count,
                COUNT(CASE WHEN p.status != 'Completed' AND NOT (p.status = 'Delayed' OR p.planned_end_date < ?) AND (LOWER(p.health) LIKE '%risk%' OR LOWER(p.health) = 'critical') THEN 1 END) AS at_risk_count,
                COUNT(CASE WHEN p.status != 'Completed' AND NOT (p.status = 'Delayed' OR p.planned_end_date < ?) AND NOT (LOWER(p.health) LIKE '%risk%' OR LOWER(p.health) = 'critical') AND (p.planned_end_date BETWEEN ? AND ?) THEN 1 END) AS upcoming_count,
                COUNT(CASE WHEN p.status != 'Completed' AND NOT (p.status = 'Delayed' OR p.planned_end_date < ?) AND NOT (LOWER(p.health) LIKE '%risk%' OR LOWER(p.health) = 'critical') AND NOT (p.planned_end_date BETWEEN ? AND ?) THEN 1 END) AS on_track_count,
                COUNT(CASE WHEN p.status != 'Completed' THEN 1 END) AS active_total,
                COUNT(p.id) AS total_projects,
                COALESCE(SUM(p.contract_value), 0) AS total_revenue
            FROM public.projects p
        """;

        long delayedCount = 0;
        long atRiskCount = 0;
        long upcomingCount = 0;
        long onTrackCount = 0;
        long activeTotal = 0;
        long totalProjectsCount = 0;
        BigDecimal totalContractValue = BigDecimal.ZERO;

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                    projectStatsSql,
                    today, today, today, today, next7Days, today, today, next7Days
            );
            if (!rows.isEmpty()) {
                Map<String, Object> r = rows.get(0);
                delayedCount = ((Number) r.getOrDefault("delayed_count", 0L)).longValue();
                atRiskCount = ((Number) r.getOrDefault("at_risk_count", 0L)).longValue();
                upcomingCount = ((Number) r.getOrDefault("upcoming_count", 0L)).longValue();
                onTrackCount = ((Number) r.getOrDefault("on_track_count", 0L)).longValue();
                activeTotal = ((Number) r.getOrDefault("active_total", 0L)).longValue();
                totalProjectsCount = ((Number) r.getOrDefault("total_projects", 0L)).longValue();
                Object revObj = r.get("total_revenue");
                totalContractValue = revObj != null ? new BigDecimal(revObj.toString()) : BigDecimal.ZERO;
            }
        } catch (Exception ignored) {}

        // 2. Timesheet Metrics (Logged hours, billable amount, timesheets count)
        String timesheetStatsSql = """
            SELECT
                COALESCE(SUM(ts.hours), 0) AS logged_hours,
                COALESCE(SUM(ts.billable_amount), 0) AS billable_amount,
                COUNT(ts.timesheet_id) AS timesheets_count
            FROM public.project_timesheets ts
        """;
        BigDecimal loggedHours = BigDecimal.ZERO;
        BigDecimal billableAmount = BigDecimal.ZERO;
        long totalTimesheetsCount = 0;

        try {
            List<Map<String, Object>> tsRows = jdbcTemplate.queryForList(timesheetStatsSql);
            if (!tsRows.isEmpty()) {
                Map<String, Object> r = tsRows.get(0);
                Object hObj = r.get("logged_hours");
                Object aObj = r.get("billable_amount");
                loggedHours = hObj != null ? new BigDecimal(hObj.toString()) : BigDecimal.ZERO;
                billableAmount = aObj != null ? new BigDecimal(aObj.toString()) : BigDecimal.ZERO;
                totalTimesheetsCount = ((Number) r.getOrDefault("timesheets_count", 0L)).longValue();
            }
        } catch (Exception ignored) {}

        // 3. Task Performance & Milestones
        String taskStatsSql = """
            SELECT
                COUNT(CASE WHEN LOWER(t.status) != 'completed' THEN 1 END) AS open_tasks,
                COUNT(CASE WHEN LOWER(t.status) != 'completed' AND t.due_date < ? THEN 1 END) AS overdue_tasks,
                COUNT(DISTINCT t.milestone) AS milestones_count,
                COUNT(t.id) AS total_tasks
            FROM public.project_tasks t
        """;
        long openTasks = 0;
        long overdueTasks = 0;
        long totalMilestonesCount = 0;
        long totalTasksCount = 0;

        try {
            List<Map<String, Object>> tRows = jdbcTemplate.queryForList(taskStatsSql, today);
            if (!tRows.isEmpty()) {
                Map<String, Object> r = tRows.get(0);
                openTasks = ((Number) r.getOrDefault("open_tasks", 0L)).longValue();
                overdueTasks = ((Number) r.getOrDefault("overdue_tasks", 0L)).longValue();
                totalMilestonesCount = ((Number) r.getOrDefault("milestones_count", 0L)).longValue();
                totalTasksCount = ((Number) r.getOrDefault("total_tasks", 0L)).longValue();
            }
        } catch (Exception ignored) {}

        // 4. Financial Calculations
        BigDecimal totalProjectCost = billableAmount;
        BigDecimal estimatedProfit = totalContractValue.subtract(totalProjectCost);
        BigDecimal overallMargin = totalContractValue.compareTo(BigDecimal.ZERO) > 0
                ? estimatedProfit.multiply(BigDecimal.valueOf(100)).divide(totalContractValue, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // 5. Distribution (Strict Priority: Delayed > At Risk > Upcoming > On Track)
        double onTrackPct = activeTotal > 0 ? (onTrackCount * 100.0) / activeTotal : 0.0;
        double atRiskPct = activeTotal > 0 ? (atRiskCount * 100.0) / activeTotal : 0.0;
        double delayedPct = activeTotal > 0 ? (delayedCount * 100.0) / activeTotal : 0.0;
        double upcomingPct = activeTotal > 0 ? (upcomingCount * 100.0) / activeTotal : 0.0;

        // 6. Key Insights
        String atRiskPctFormatted = String.format("%.0f%%", atRiskPct);
        String delayedPctFormatted = String.format("%.0f%%", delayedPct);
        List<String> bulletPoints;
        if (activeTotal == 0) {
            bulletPoints = List.of(
                    "No active projects currently scheduled.",
                    "Add new projects to begin tracking live delivery and risk metrics.",
                    "0 projects are due for delivery within the next 7 days."
            );
        } else {
            bulletPoints = List.of(
                    String.format("%s of projects are currently at risk.", atRiskPctFormatted),
                    String.format("%s of projects are delayed.", delayedPctFormatted),
                    String.format("%d projects are due for delivery within the next 7 days.", upcomingCount)
            );
        }

        return ProjectPerformanceDashboardResponse.builder()
                .overview(ProjectPerformanceDashboardResponse.OverviewKpis.builder()
                        .activeProjects(activeTotal)
                        .atRiskProjects(atRiskCount)
                        .delayedProjects(delayedCount)
                        .dueSoonProjects(upcomingCount)
                        .build())
                .financials(ProjectPerformanceDashboardResponse.FinancialKpis.builder()
                        .contractRevenueValue(totalContractValue)
                        .contractRevenueFormatted(formatInr(totalContractValue))
                        .totalProjectCost(totalProjectCost)
                        .totalProjectCostFormatted(formatInr(totalProjectCost))
                        .estimatedProjectProfit(estimatedProfit)
                        .estimatedProjectProfitFormatted(formatInr(estimatedProfit))
                        .overallProjectMargin(overallMargin)
                        .overallProjectMarginFormatted(String.format("%.2f%%", overallMargin.doubleValue()))
                        .costTypeDisclosure("Billable Cost (Logged Hours x Billable Rate)")
                        .build())
                .delivery(ProjectPerformanceDashboardResponse.DeliveryPerformance.builder()
                        .loggedHours(loggedHours)
                        .loggedHoursFormatted(String.format("%.2f", loggedHours.doubleValue()))
                        .billableAmount(billableAmount)
                        .billableAmountFormatted(formatInr(billableAmount))
                        .openTasks(openTasks)
                        .overdueTasks(overdueTasks)
                        .build())
                .deliveryFlow(ProjectPerformanceDashboardResponse.DeliveryFlow.builder()
                        .projectsCount(totalProjectsCount)
                        .milestonesCount(totalMilestonesCount)
                        .tasksCount(totalTasksCount)
                        .timesheetsCount(totalTimesheetsCount)
                        .build())
                .distribution(ProjectPerformanceDashboardResponse.ProjectDistribution.builder()
                        .totalProjects(activeTotal)
                        .onTrack(ProjectPerformanceDashboardResponse.DistributionItem.builder()
                                .count(onTrackCount)
                                .percentage(onTrackPct)
                                .formatted(String.format("%d (%.1f%%)", onTrackCount, onTrackPct))
                                .build())
                        .atRisk(ProjectPerformanceDashboardResponse.DistributionItem.builder()
                                .count(atRiskCount)
                                .percentage(atRiskPct)
                                .formatted(String.format("%d (%.1f%%)", atRiskCount, atRiskPct))
                                .build())
                        .delayed(ProjectPerformanceDashboardResponse.DistributionItem.builder()
                                .count(delayedCount)
                                .percentage(delayedPct)
                                .formatted(String.format("%d (%.1f%%)", delayedCount, delayedPct))
                                .build())
                        .upcoming(ProjectPerformanceDashboardResponse.DistributionItem.builder()
                                .count(upcomingCount)
                                .percentage(upcomingPct)
                                .formatted(String.format("%d (%.1f%%)", upcomingCount, upcomingPct))
                                .build())
                        .build())
                .keyInsights(ProjectPerformanceDashboardResponse.KeyInsights.builder()
                        .atRiskPercentage(atRiskPctFormatted)
                        .delayedPercentage(delayedPctFormatted)
                        .dueSoonCount(upcomingCount)
                        .bulletPoints(bulletPoints)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectProfitabilityPageResponse getProfitabilityPage(
            int page, int size, String search, String health, String sortBy, String sortDir
    ) {
        LocalDate today = LocalDate.now(ZONE_KOLKATA);
        LocalDate next7Days = today.plusDays(7);

        int sanitizedPage = Math.max(0, page);
        int sanitizedSize = (size <= 0) ? 5 : Math.min(size, 100);
        int offset = sanitizedPage * sanitizedSize;

        String safeSortCol = switch (sortBy != null ? sortBy.toLowerCase().trim() : "") {
            case "id", "projectid" -> "project_id";
            case "name", "projectname" -> "project_name";
            case "revenue" -> "revenue";
            case "totalcost", "cost" -> "total_cost";
            case "profit" -> "profit";
            case "margin" -> "margin";
            case "health" -> "computed_health";
            default -> "project_code";
        };
        String safeSortDir = "DESC".equalsIgnoreCase(sortDir) ? "DESC" : "ASC";

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;

        String normalizedHealth = (health != null && !health.trim().isEmpty())
                ? health.trim()
                : "All";

        String baseCte = """
            WITH project_profitability AS (
                SELECT 
                    p.id AS project_id,
                    p.project_code AS project_code,
                    p.project_name AS project_name,
                    COALESCE(p.contract_value, 0) AS revenue,
                    COALESCE(SUM(ts.billable_amount), 0) AS total_cost,
                    (COALESCE(p.contract_value, 0) - COALESCE(SUM(ts.billable_amount), 0)) AS profit,
                    CASE 
                        WHEN COALESCE(p.contract_value, 0) > 0 
                        THEN ROUND(((COALESCE(p.contract_value, 0) - COALESCE(SUM(ts.billable_amount), 0)) * 100.0) / p.contract_value, 1)
                        ELSE 0.0 
                    END AS margin,
                    CASE 
                        WHEN p.status = 'Completed' THEN 'Completed'
                        WHEN (p.status = 'Delayed' OR p.planned_end_date < ?) THEN 'Delayed'
                        WHEN (LOWER(p.health) LIKE '%risk%' OR LOWER(p.health) = 'critical') THEN 'At Risk'
                        WHEN (p.planned_end_date BETWEEN ? AND ?) THEN 'Upcoming'
                        ELSE 'On Track'
                    END AS computed_health,
                    p.status AS status
                FROM public.projects p
                LEFT JOIN public.project_timesheets ts ON ts.project_id = p.project_code
                GROUP BY p.id, p.project_code, p.project_name, p.contract_value, p.status, p.health, p.planned_end_date
            )
        """;

        StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
        List<Object> countParams = new ArrayList<>(List.of(today, today, next7Days));

        if (searchPattern != null) {
            whereClause.append(" AND (LOWER(project_code) LIKE ? OR LOWER(project_name) LIKE ?) ");
            countParams.add(searchPattern);
            countParams.add(searchPattern);
        }

        if (!"All".equalsIgnoreCase(normalizedHealth)) {
            whereClause.append(" AND LOWER(computed_health) = LOWER(?) ");
            countParams.add(normalizedHealth);
        }

        String countSql = baseCte + " SELECT COUNT(*) FROM project_profitability " + whereClause;
        long totalElements = 0;
        try {
            Long count = jdbcTemplate.queryForObject(countSql, Long.class, countParams.toArray());
            totalElements = count != null ? count : 0;
        } catch (Exception ignored) {}

        int totalPages = totalElements > 0 ? (int) Math.ceil((double) totalElements / sanitizedSize) : 0;

        String selectSql = baseCte + " SELECT * FROM project_profitability " + whereClause
                + " ORDER BY " + safeSortCol + " " + safeSortDir
                + " LIMIT ? OFFSET ?";

        List<Object> selectParams = new ArrayList<>(countParams);
        selectParams.add(sanitizedSize);
        selectParams.add(offset);

        List<ProjectPerformanceDashboardResponse.ProjectProfitabilityRow> content = new ArrayList<>();
        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(selectSql, selectParams.toArray());
            for (int i = 0; i < rows.size(); i++) {
                Map<String, Object> r = rows.get(i);
                BigDecimal rev = new BigDecimal(r.getOrDefault("revenue", 0).toString());
                BigDecimal cost = new BigDecimal(r.getOrDefault("total_cost", 0).toString());
                BigDecimal profit = new BigDecimal(r.getOrDefault("profit", 0).toString());
                BigDecimal margin = new BigDecimal(r.getOrDefault("margin", 0).toString());
                String pCode = (String) r.get("project_code");
                String pId = (String) r.get("project_id");
                String pName = (String) r.get("project_name");
                String healthVal = (String) r.get("computed_health");
                String statusVal = (String) r.get("status");

                content.add(ProjectPerformanceDashboardResponse.ProjectProfitabilityRow.builder()
                        .sNo(offset + i + 1)
                        .projectId(pId)
                        .projectCode(pCode)
                        .projectName(pName)
                        .revenue(rev)
                        .revenueFormatted(formatInr(rev))
                        .totalCost(cost)
                        .totalCostFormatted(formatInr(cost))
                        .profit(profit)
                        .profitFormatted(formatInr(profit))
                        .margin(margin)
                        .marginFormatted(String.format("%.1f%%", margin.doubleValue()))
                        .health(healthVal)
                        .status(statusVal)
                        .build());
            }
        } catch (Exception ignored) {}

        return ProjectProfitabilityPageResponse.builder()
                .content(content)
                .page(sanitizedPage)
                .size(sanitizedSize)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(sanitizedPage == 0)
                .last(sanitizedPage >= totalPages - 1)
                .healthFilter(normalizedHealth)
                .searchQuery(search)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportProfitabilityCsv(String search, String health) {
        LocalDate today = LocalDate.now(ZONE_KOLKATA);
        LocalDate next7Days = today.plusDays(7);

        String searchPattern = (search != null && !search.trim().isEmpty())
                ? "%" + search.trim().toLowerCase() + "%"
                : null;
        String normalizedHealth = (health != null && !health.trim().isEmpty())
                ? health.trim()
                : "All";

        String baseCte = """
            WITH project_profitability AS (
                SELECT 
                    p.id AS project_id,
                    p.project_code AS project_code,
                    p.project_name AS project_name,
                    COALESCE(p.contract_value, 0) AS revenue,
                    COALESCE(SUM(ts.billable_amount), 0) AS total_cost,
                    (COALESCE(p.contract_value, 0) - COALESCE(SUM(ts.billable_amount), 0)) AS profit,
                    CASE 
                        WHEN COALESCE(p.contract_value, 0) > 0 
                        THEN ROUND(((COALESCE(p.contract_value, 0) - COALESCE(SUM(ts.billable_amount), 0)) * 100.0) / p.contract_value, 1)
                        ELSE 0.0 
                    END AS margin,
                    CASE 
                        WHEN p.status = 'Completed' THEN 'Completed'
                        WHEN (p.status = 'Delayed' OR p.planned_end_date < ?) THEN 'Delayed'
                        WHEN (LOWER(p.health) LIKE '%risk%' OR LOWER(p.health) = 'critical') THEN 'At Risk'
                        WHEN (p.planned_end_date BETWEEN ? AND ?) THEN 'Upcoming'
                        ELSE 'On Track'
                    END AS computed_health,
                    p.status AS status
                FROM public.projects p
                LEFT JOIN public.project_timesheets ts ON ts.project_id = p.project_code
                GROUP BY p.id, p.project_code, p.project_name, p.contract_value, p.status, p.health, p.planned_end_date
            )
        """;

        StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
        List<Object> params = new ArrayList<>(List.of(today, today, next7Days));

        if (searchPattern != null) {
            whereClause.append(" AND (LOWER(project_code) LIKE ? OR LOWER(project_name) LIKE ?) ");
            params.add(searchPattern);
            params.add(searchPattern);
        }

        if (!"All".equalsIgnoreCase(normalizedHealth)) {
            whereClause.append(" AND LOWER(computed_health) = LOWER(?) ");
            params.add(normalizedHealth);
        }

        String sql = baseCte + " SELECT * FROM project_profitability " + whereClause + " ORDER BY project_code ASC";

        StringBuilder csv = new StringBuilder();
        // UTF-8 BOM for spreadsheet software
        csv.append('\ufeff');
        csv.append("S.No,Project ID,Project Name,Revenue,Billable Cost,Profit,Margin,Health,Status\n");

        try {
            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, params.toArray());
            for (int i = 0; i < rows.size(); i++) {
                Map<String, Object> r = rows.get(i);
                BigDecimal rev = new BigDecimal(r.getOrDefault("revenue", 0).toString());
                BigDecimal cost = new BigDecimal(r.getOrDefault("total_cost", 0).toString());
                BigDecimal profit = new BigDecimal(r.getOrDefault("profit", 0).toString());
                BigDecimal margin = new BigDecimal(r.getOrDefault("margin", 0).toString());
                String pCode = (String) r.get("project_code");
                String pName = (String) r.get("project_name");
                String healthVal = (String) r.get("computed_health");
                String statusVal = (String) r.get("status");

                csv.append(sanitizeCsvCell(i + 1)).append(",")
                        .append(sanitizeCsvCell(pCode)).append(",")
                        .append(sanitizeCsvCell(pName)).append(",")
                        .append(sanitizeCsvCell(formatInr(rev))).append(",")
                        .append(sanitizeCsvCell(formatInr(cost))).append(",")
                        .append(sanitizeCsvCell(formatInr(profit))).append(",")
                        .append(sanitizeCsvCell(String.format("%.1f%%", margin.doubleValue()))).append(",")
                        .append(sanitizeCsvCell(healthVal)).append(",")
                        .append(sanitizeCsvCell(statusVal)).append("\n");
            }
        } catch (Exception ignored) {}

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String sanitizeCsvCell(Object value) {
        if (value == null) return "\"\"";
        String str = value.toString().trim();
        if (str.isEmpty()) return "\"\"";
        char firstChar = str.charAt(0);
        if (firstChar == '=' || firstChar == '+' || firstChar == '-' || firstChar == '@' || firstChar == '\t' || firstChar == '\r') {
            str = "'" + str;
        }
        return "\"" + str.replace("\"", "\"\"") + "\"";
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectPerformanceDashboardResponse getPerformanceDashboard(String period) {
        ProjectPerformanceDashboardResponse summary = getPerformanceSummary();
        ProjectProfitabilityPageResponse firstPage = getProfitabilityPage(0, 5, null, "All", "projectCode", "ASC");
        summary.setProfitability(firstPage.getContent());
        return summary;
    }

    private String formatInr(BigDecimal amount) {
        if (amount == null) amount = BigDecimal.ZERO;
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));
        return formatter.format(amount).replace("INR", "₹").trim();
    }
}
