package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.projects.dto.ProjectDto;
import com.company.project.projects.dto.ProjectTaskDto;
import com.company.project.projects.service.ProjectMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
@Tag(name = "Projects API", description = "Endpoints for project and task master records")
public class ProjectController {

    private final ProjectMasterService projectMasterService;

    @GetMapping
    @Operation(summary = "List all projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getAllProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectMasterService.getAllProjects()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(projectMasterService.getProjectById(id)));
    }

    @GetMapping("/{id}/tasks")
    @Operation(summary = "List all tasks for a project")
    public ResponseEntity<ApiResponse<List<ProjectTaskDto>>> getTasksByProject(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(projectMasterService.getTasksByProjectId(id)));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get project task by ID")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> getTaskById(@PathVariable String taskId) {
        return ResponseEntity.ok(ApiResponse.success(projectMasterService.getTaskById(taskId)));
    }
}

