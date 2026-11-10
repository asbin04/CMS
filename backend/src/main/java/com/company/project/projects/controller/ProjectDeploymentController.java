package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.ProjectDeploymentService;
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
@RequestMapping("/api/v1/projects/deployments")
@RequiredArgsConstructor
@Tag(name = "Deployment / Go-Live", description = "Management APIs for project deployments, releases, environments, and handover tracking")
public class ProjectDeploymentController {

    private final ProjectDeploymentService service;

    @GetMapping
    @Operation(summary = "Get all project deployments with optional filters")
    public ResponseEntity<ApiResponse<List<ProjectDeploymentDto>>> getAllDeployments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String handoverStatus
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllDeployments(search, environment, status, handoverStatus)));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get deployment summary KPIs and metrics")
    public ResponseEntity<ApiResponse<DeploymentKpisResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter options for deployments")
    public ResponseEntity<ApiResponse<DeploymentFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get deployment by ID")
    public ResponseEntity<ApiResponse<ProjectDeploymentDto>> getDeploymentById(@PathVariable String id) {
        ProjectDeploymentDto dto = service.getDeploymentById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new project deployment")
    public ResponseEntity<ApiResponse<ProjectDeploymentDto>> createDeployment(@Valid @RequestBody CreateProjectDeploymentRequest request) {
        ProjectDeploymentDto created = service.createDeployment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Deployment created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing deployment")
    public ResponseEntity<ApiResponse<ProjectDeploymentDto>> updateDeployment(@PathVariable String id, @RequestBody UpdateProjectDeploymentRequest request) {
        ProjectDeploymentDto updated = service.updateDeployment(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Deployment updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete a deployment")
    public ResponseEntity<ApiResponse<Void>> deleteDeployment(@PathVariable String id) {
        service.deleteDeployment(id);
        return ResponseEntity.ok(ApiResponse.success("Deployment deleted successfully", null));
    }

    @PostMapping("/reset")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Reset deployments to initial demo seed dataset")
    public ResponseEntity<ApiResponse<Void>> resetSeedData() {
        service.resetSeedData();
        return ResponseEntity.ok(ApiResponse.success("Deployments reset successfully", null));
    }
}

