package com.company.project.dashboard.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.dashboard.dto.CreateEmployeeRequest;
import com.company.project.dashboard.dto.EmployeeMasterDto;
import com.company.project.dashboard.dto.EmployeeMasterSummaryDto;
import com.company.project.dashboard.service.EmployeeMasterService;
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
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Master", description = "Endpoints for managing employee master records")
public class EmployeeMasterController {

    private final EmployeeMasterService service;

    @GetMapping
    @Operation(summary = "Get all employees with optional department, designation, employment type, status, location, reporting manager, and search filters")
    public ResponseEntity<ApiResponse<List<EmployeeMasterDto>>> getAllEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String designation,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String reportingManager,
            @RequestParam(required = false) String search
    ) {
        List<EmployeeMasterDto> list = service.getAllEmployees(department, designation, employmentType, status, location, reportingManager, search);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get summary metrics for KPI cards on Employee Master page")
    public ResponseEntity<ApiResponse<EmployeeMasterSummaryDto>> getSummary() {
        EmployeeMasterSummaryDto summary = service.getSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single employee by ID")
    public ResponseEntity<ApiResponse<EmployeeMasterDto>> getById(@PathVariable Long id) {
        EmployeeMasterDto dto = service.getById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new employee")
    public ResponseEntity<ApiResponse<EmployeeMasterDto>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        EmployeeMasterDto created = service.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Employee created successfully", created));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Bulk import employees")
    public ResponseEntity<ApiResponse<List<EmployeeMasterDto>>> bulkCreateEmployees(
            @RequestBody List<CreateEmployeeRequest> requests
    ) {
        List<EmployeeMasterDto> created = service.createEmployees(requests);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Imported " + created.size() + " employees successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an employee")
    public ResponseEntity<ApiResponse<EmployeeMasterDto>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody CreateEmployeeRequest request
    ) {
        EmployeeMasterDto updated = service.updateEmployee(id, request);
        return ResponseEntity.ok(ApiResponse.success("Employee updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an employee")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        service.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success("Employee deleted successfully", null));
    }
}
