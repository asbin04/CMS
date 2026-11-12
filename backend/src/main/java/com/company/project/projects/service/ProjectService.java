package com.company.project.projects.service;

import com.company.project.projects.dto.*;

import java.util.List;

public interface ProjectService {

    List<ProjectDto> getAllProjects();

    ProjectDto getProjectById(String id);

    ProjectDto createProject(CreateProjectRequest request);

    ProjectDto updateProject(String id, UpdateProjectRequest request);

    void deleteProject(String id);

    List<ProjectTaskDto> getAllTasks();

    List<ProjectTaskDto> getTasksByProjectId(String projectId);

    ProjectTaskDto getTaskById(String id);

    ProjectTaskDto createTask(CreateProjectTaskRequest request);

    ProjectTaskDto updateTask(String id, UpdateProjectTaskRequest request);

    void deleteTask(String id);

    ProjectKpiResponse getProjectKpis();

    ProjectFilterOptionsResponse getProjectFilterOptions();

    TaskFilterOptionsResponse getTaskFilterOptions();

    ProjectPerformanceDashboardResponse getPerformanceSummary();

    ProjectProfitabilityPageResponse getProfitabilityPage(int page, int size, String search, String health, String sortBy, String sortDir);

    byte[] exportProfitabilityCsv(String search, String health);

    ProjectPerformanceDashboardResponse getPerformanceDashboard(String period);
}
