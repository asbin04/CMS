package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.DevelopmentService;
import com.company.project.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/developments", "/api/v1/projects/developments"})
@RequiredArgsConstructor
@Tag(name = "Development API", description = "Endpoints for project development lifecycle, code progress, builds, QA handoff and releases")
public class DevelopmentController {

    private final DevelopmentService developmentService;

    @GetMapping
    @Operation(summary = "List developments", description = "Retrieve paginated, filtered, and sorted development records")
    public ResponseEntity<ApiResponse<PageResponse<DevelopmentResponse>>> getDevelopments(
            @Parameter(description = "Search across development ID, project ID, requirement ID, task ID, developer name")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by project ID")
            @RequestParam(required = false) String project,

            @Parameter(description = "Filter by environment (Dev, QA, Staging, Prod)")
            @RequestParam(required = false) String environment,

            @Parameter(description = "Filter by development status (In Progress, QA, Released)")
            @RequestParam(required = false) String status,

            @Parameter(description = "Filter by code review status (Approved, In Review, Changes Requested)")
            @RequestParam(required = false) String reviewStatus,

            @Parameter(description = "Sort property and direction (e.g. createdAt,desc)")
            @RequestParam(required = false) String sort,

            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<DevelopmentResponse> response = developmentService.getDevelopments(
                search, project, environment, status, reviewStatus, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get development KPIs", description = "Retrieve aggregated dynamic KPI metrics for developments")
    public ResponseEntity<ApiResponse<DevelopmentKpisResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(developmentService.getKpis()));
    }

    @GetMapping("/next-id")
    @Operation(summary = "Preview next development ID", description = "Inspect the next sequential development ID without incrementing sequence")
    public ResponseEntity<ApiResponse<Map<String, String>>> getNextId() {
        String nextId = developmentService.getNextDevelopmentId();
        return ResponseEntity.ok(ApiResponse.success(Map.of("nextId", nextId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get development by ID")
    public ResponseEntity<ApiResponse<DevelopmentResponse>> getDevelopmentById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(developmentService.getDevelopmentById(id)));
    }

    @PostMapping
    @Operation(summary = "Create development")
    public ResponseEntity<ApiResponse<DevelopmentResponse>> createDevelopment(
            @Valid @RequestBody CreateDevelopmentRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        DevelopmentResponse response = developmentService.createDevelopment(request, currentUsername);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Development created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update development")
    public ResponseEntity<ApiResponse<DevelopmentResponse>> updateDevelopment(
            @PathVariable String id,
            @Valid @RequestBody UpdateDevelopmentRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        DevelopmentResponse response = developmentService.updateDevelopment(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Development updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update development status")
    public ResponseEntity<ApiResponse<DevelopmentResponse>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateDevelopmentStatusRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        DevelopmentResponse response = developmentService.updateStatus(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @PatchMapping("/{id}/code-review-status")
    @Operation(summary = "Update code review status")
    public ResponseEntity<ApiResponse<DevelopmentResponse>> updateCodeReviewStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateCodeReviewStatusRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        DevelopmentResponse response = developmentService.updateCodeReviewStatus(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Code review status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete development")
    public ResponseEntity<ApiResponse<Void>> deleteDevelopment(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        developmentService.deleteDevelopment(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Development deleted successfully", null));
    }

    @GetMapping("/export")
    @Operation(summary = "Export developments to CSV", description = "Download filtered development records as CSV")
    public ResponseEntity<byte[]> exportDevelopments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String project,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String reviewStatus
    ) {
        byte[] csvBytes = developmentService.exportDevelopmentsToCsv(
                search, project, environment, status, reviewStatus
        );
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"developments.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }
}

