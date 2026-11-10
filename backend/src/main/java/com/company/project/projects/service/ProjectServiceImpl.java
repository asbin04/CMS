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
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;

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
}
