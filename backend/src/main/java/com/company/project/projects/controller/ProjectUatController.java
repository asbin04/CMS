package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.ProjectUatService;
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
@RequestMapping("/api/v1/projects/uat")
@RequiredArgsConstructor
@Tag(name = "UAT Deliverables", description = "Management APIs for User Acceptance Testing (UAT) executions, test cases and client approvals")
public class ProjectUatController {

    private final ProjectUatService service;

    @GetMapping
    @Operation(summary = "Get all UAT test executions with optional query filters")
    public ResponseEntity<ApiResponse<List<ProjectUatDto>>> getAllUats(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String clientApproval,
            @RequestParam(required = false) String tester
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllUats(search, projectId, status, clientApproval, tester)));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get UAT KPIs and metrics")
    public ResponseEntity<ApiResponse<UatKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter options for UAT tests")
    public ResponseEntity<ApiResponse<UatFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get UAT test execution by ID")
    public ResponseEntity<ApiResponse<ProjectUatDto>> getUatById(@PathVariable String id) {
        ProjectUatDto dto = service.getUatById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get UAT tests for a specific project")
    public ResponseEntity<ApiResponse<List<ProjectUatDto>>> getUatsByProject(@PathVariable String projectId) {
        return ResponseEntity.ok(ApiResponse.success(service.getUatsByProjectId(projectId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new UAT test execution")
    public ResponseEntity<ApiResponse<ProjectUatDto>> createUat(@Valid @RequestBody CreateProjectUatRequest request) {
        ProjectUatDto created = service.createUat(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("UAT execution created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing UAT test execution")
    public ResponseEntity<ApiResponse<ProjectUatDto>> updateUat(@PathVariable String id, @RequestBody UpdateProjectUatRequest request) {
        ProjectUatDto updated = service.updateUat(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("UAT execution updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete a UAT test execution")
    public ResponseEntity<ApiResponse<Void>> deleteUat(@PathVariable String id) {
        service.deleteUat(id);
        return ResponseEntity.ok(ApiResponse.success("UAT execution deleted successfully", null));
    }
}

