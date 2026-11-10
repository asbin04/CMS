package com.company.project.projects.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.RequirementService;
import com.company.project.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/requirements", "/api/v1/projects/requirements"})
@RequiredArgsConstructor
@Tag(name = "Requirements API", description = "Endpoints for project requirements management, scope freeze controls, and approval lifecycle")
public class RequirementController {

    private final RequirementService requirementService;

    @GetMapping
    @Operation(summary = "List requirements", description = "Retrieve paginated, filtered, and sorted requirements")
    public ResponseEntity<ApiResponse<PageResponse<RequirementResponse>>> getRequirements(
            @Parameter(description = "Search across requirement ID, feature name, description, project ID, client ID, owner ID")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by project ID")
            @RequestParam(required = false) String project,

            @Parameter(description = "Filter by requirement type")
            @RequestParam(required = false) String type,

            @Parameter(description = "Filter by priority (High, Medium, Low, Critical)")
            @RequestParam(required = false) String priority,

            @Parameter(description = "Filter by status (In Progress, Completed, Pending Approval, Draft, Cancelled)")
            @RequestParam(required = false) String status,

            @Parameter(description = "Filter by scope freeze (Yes, No)")
            @RequestParam(required = false) String scopeFreeze,

            @Parameter(description = "Sort property and direction (e.g. requirementDate,desc)")
            @RequestParam(required = false) String sort,

            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<RequirementResponse> response = requirementService.getRequirements(
                search, project, type, priority, status, scopeFreeze, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get requirement KPIs", description = "Retrieve aggregated KPI summary for requirements")
    public ResponseEntity<ApiResponse<RequirementKpisResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(requirementService.getKpis()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get requirement by ID")
    public ResponseEntity<ApiResponse<RequirementResponse>> getRequirementById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(requirementService.getRequirementById(id)));
    }

    @PostMapping
    @Operation(summary = "Create requirement")
    public ResponseEntity<ApiResponse<RequirementResponse>> createRequirement(
            @Valid @RequestBody CreateRequirementRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.createRequirement(request, currentUsername, userRoles);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Requirement created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update requirement", description = "Updates requirement fields; fails if scope frozen unless caller has manager/admin role")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirement(
            @PathVariable String id,
            @Valid @RequestBody UpdateRequirementRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.updateRequirement(id, request, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Requirement updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete requirement", description = "Deletes requirement; fails if scope frozen unless caller has manager/admin role")
    public ResponseEntity<ApiResponse<Void>> deleteRequirement(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        requirementService.deleteRequirement(id, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Requirement deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update requirement status")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateRequirementStatusRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.updateStatus(id, request, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", response));
    }

    @PatchMapping("/{id}/completion")
    @Operation(summary = "Update completion percentage")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateCompletionPercentage(
            @PathVariable String id,
            @Valid @RequestBody UpdateCompletionPercentageRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.updateCompletionPercentage(id, request, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Completion percentage updated successfully", response));
    }

    @PostMapping("/{id}/scope-freeze")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Toggle scope freeze", description = "Freezes or unfreezes requirement. Restricted to managers, CEOs, and administrators.")
    public ResponseEntity<ApiResponse<RequirementResponse>> toggleScopeFreeze(
            @PathVariable String id,
            @Valid @RequestBody ScopeFreezeRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.toggleScopeFreeze(id, request, currentUsername, userRoles);
        String msg = Boolean.TRUE.equals(request.getScopeFreeze()) ? "Requirement scope frozen" : "Requirement scope unfrozen";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Approve requirement", description = "Restricted to managers, CEOs, and administrators. Sets status to Completed and populates Approved By and Date.")
    public ResponseEntity<ApiResponse<RequirementResponse>> approveRequirement(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.approveRequirement(id, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Requirement approved successfully", response));
    }

    @PostMapping("/{id}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Revoke requirement approval / reopen", description = "Restricted to managers, CEOs, and administrators. Clears approval metadata.")
    public ResponseEntity<ApiResponse<RequirementResponse>> revokeApproval(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        RequirementResponse response = requirementService.revokeApproval(id, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Requirement approval revoked successfully", response));
    }
}

