package com.company.project.projects.controller;

import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.TimesheetService;
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

import java.util.Map;

@RestController
@RequestMapping({"/api/v1/timesheets", "/api/v1/projects/timesheets"})
@RequiredArgsConstructor
@Tag(name = "Timesheets API", description = "Endpoints for project timesheet tracking, approval workflows, and labor cost management")
public class TimesheetController {

    private final TimesheetService timesheetService;

    @GetMapping
    @Operation(summary = "List timesheets", description = "Retrieve paginated, filtered, and sorted timesheets")
    public ResponseEntity<ApiResponse<PageResponse<TimesheetResponse>>> getTimesheets(
            @Parameter(description = "Search across timesheet ID, employee name, project ID, task ID, notes")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by employee ID or name")
            @RequestParam(required = false) String employee,

            @Parameter(description = "Filter by project ID")
            @RequestParam(required = false) String project,

            @Parameter(description = "Filter by approval status (Pending, Approved, Rejected, Draft)")
            @RequestParam(required = false) String approvalStatus,

            @Parameter(description = "Filter by billable status (Yes, No)")
            @RequestParam(required = false) String billable,

            @Parameter(description = "Start of date range (YYYY-MM-DD)")
            @RequestParam(required = false) String dateFrom,

            @Parameter(description = "End of date range (YYYY-MM-DD)")
            @RequestParam(required = false) String dateTo,

            @Parameter(description = "Sort property and direction (e.g. timesheetDate,desc)")
            @RequestParam(required = false) String sort,

            @Parameter(description = "Page number (1-based)")
            @RequestParam(defaultValue = "1") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<TimesheetResponse> response = timesheetService.getTimesheets(
                search, employee, project, approvalStatus, billable, dateFrom, dateTo, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get timesheet KPIs", description = "Retrieve aggregated KPI summary for timesheets")
    public ResponseEntity<ApiResponse<TimesheetKpisResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(timesheetService.getKpis()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get timesheet by ID")
    public ResponseEntity<ApiResponse<TimesheetResponse>> getTimesheetById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(timesheetService.getTimesheetById(id)));
    }

    @PostMapping
    @Operation(summary = "Log time / Create timesheet")
    public ResponseEntity<ApiResponse<TimesheetResponse>> createTimesheet(
            @Valid @RequestBody CreateTimesheetRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        TimesheetResponse response = timesheetService.createTimesheet(request, currentUsername, userRoles);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timesheet created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update timesheet")
    public ResponseEntity<ApiResponse<TimesheetResponse>> updateTimesheet(
            @PathVariable String id,
            @Valid @RequestBody UpdateTimesheetRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        TimesheetResponse response = timesheetService.updateTimesheet(id, request, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Timesheet updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete timesheet")
    public ResponseEntity<ApiResponse<Void>> deleteTimesheet(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        var userRoles = SecurityUtils.getCurrentUserRoles();
        timesheetService.deleteTimesheet(id, currentUsername, userRoles);
        return ResponseEntity.ok(ApiResponse.success("Timesheet deleted successfully", null));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit timesheet for approval")
    public ResponseEntity<ApiResponse<TimesheetResponse>> submitTimesheet(@PathVariable String id) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        TimesheetResponse response = timesheetService.submitTimesheet(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Timesheet submitted for approval", response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Approve timesheet", description = "Restricted to managers, CEOs, and administrators")
    public ResponseEntity<ApiResponse<TimesheetResponse>> approveTimesheet(
            @PathVariable String id,
            @RequestBody(required = false) ApproveTimesheetRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        TimesheetResponse response = timesheetService.approveTimesheet(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Timesheet approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Reject timesheet", description = "Restricted to managers, CEOs, and administrators")
    public ResponseEntity<ApiResponse<TimesheetResponse>> rejectTimesheet(
            @PathVariable String id,
            @Valid @RequestBody RejectTimesheetRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        TimesheetResponse response = timesheetService.rejectTimesheet(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Timesheet rejected", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Update timesheet approval status", description = "Updates approval status to Approved, Rejected, or Pending")
    public ResponseEntity<ApiResponse<TimesheetResponse>> updateApprovalStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        String status = body.getOrDefault("status", body.get("approvalStatus"));
        if (status == null || status.isBlank()) {
            throw new BusinessValidationException("Status is required");
        }
        TimesheetResponse response;
        if ("Approved".equalsIgnoreCase(status.trim())) {
            String rawAssigned = body.getOrDefault("assignedApprover", body.get("approvedBy"));
            ApproveTimesheetRequest req = ApproveTimesheetRequest.builder()
                    .assignedApprover(rawAssigned)
                    .approvedBy(body.get("approvedBy"))
                    .comments(body.get("comments"))
                    .notes(body.get("notes"))
                    .build();
            response = timesheetService.approveTimesheet(id, req, currentUsername);
        } else if ("Rejected".equalsIgnoreCase(status.trim())) {
            String reason = body.getOrDefault("rejectionReason", body.getOrDefault("reason", "Rejected by reviewer"));
            RejectTimesheetRequest req = RejectTimesheetRequest.builder().rejectionReason(reason).build();
            response = timesheetService.rejectTimesheet(id, req, currentUsername);
        } else {
            response = timesheetService.submitTimesheet(id, currentUsername);
        }
        return ResponseEntity.ok(ApiResponse.success("Approval status updated successfully", response));
    }

    @PostMapping("/{id}/override-labor-cost")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO', 'MD', 'MANAGER')")
    @Operation(summary = "Override estimated labor cost", description = "Restricted to managers, CEOs, and administrators")
    public ResponseEntity<ApiResponse<TimesheetResponse>> overrideLaborCost(
            @PathVariable String id,
            @Valid @RequestBody OverrideLaborCostRequest request
    ) {
        String currentUsername = SecurityUtils.getCurrentUsername();
        TimesheetResponse response = timesheetService.overrideLaborCost(id, request, currentUsername);
        return ResponseEntity.ok(ApiResponse.success("Labor cost overridden successfully", response));
    }
}

