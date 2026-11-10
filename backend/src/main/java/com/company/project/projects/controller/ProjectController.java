package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects API", description = "Endpoints for project and task management")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjects()));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get project KPIs and metrics")
    public ResponseEntity<ApiResponse<ProjectKpiResponse>> getProjectKpis() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct project filter options")
    public ResponseEntity<ApiResponse<ProjectFilterOptionsResponse>> getProjectFilters() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable String id) {
        ProjectDto dto = projectService.getProjectById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        ProjectDto created = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing project")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(@PathVariable String id, @RequestBody UpdateProjectRequest request) {
        ProjectDto updated = projectService.updateProject(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete a project")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
    }

    // --- Project Tasks Endpoints ---

    @GetMapping("/tasks")
    @Operation(summary = "List all project tasks")
    public ResponseEntity<ApiResponse<List<ProjectTaskDto>>> getAllTasks() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllTasks()));
    }

    @GetMapping("/tasks/filters")
    @Operation(summary = "Get distinct project task filter options")
    public ResponseEntity<ApiResponse<TaskFilterOptionsResponse>> getTaskFilters() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getTaskFilterOptions()));
    }

    @GetMapping("/{id}/tasks")
    @Operation(summary = "List all tasks for a specific project")
    public ResponseEntity<ApiResponse<List<ProjectTaskDto>>> getTasksByProject(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getTasksByProjectId(id)));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get project task by ID")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> getTaskById(@PathVariable String taskId) {
        ProjectTaskDto dto = projectService.getTaskById(taskId);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new project task")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> createTask(@Valid @RequestBody CreateProjectTaskRequest request) {
        ProjectTaskDto created = projectService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", created));
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing task")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> updateTask(@PathVariable String taskId, @RequestBody UpdateProjectTaskRequest request) {
        ProjectTaskDto updated = projectService.updateTask(taskId, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", updated));
    }

    @DeleteMapping("/tasks/{taskId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete a task")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable String taskId) {
        projectService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}
