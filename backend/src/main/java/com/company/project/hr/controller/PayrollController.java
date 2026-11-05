package com.company.project.hr.controller;

import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;
import com.company.project.hr.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hr/payroll")
@RequiredArgsConstructor
@Tag(name = "Payroll & Salary API", description = "Endpoints for managing monthly employee payroll, deductions, salaries and payslips")
public class PayrollController {

    private final PayrollService payrollService;

    @GetMapping
    @Operation(summary = "Get paginated, filtered, and sorted payroll records")
    public ResponseEntity<PageResponse<PayrollRecordDto>> getPayrollRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String payrollMonth,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employee,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(payrollService.getPayrollRecords(
                search, payrollMonth, employmentType, status, employee, sort, page, size
        ));
    }

    @GetMapping("/export")
    @Operation(summary = "Get all filtered payroll records for export")
    public ResponseEntity<List<PayrollRecordDto>> getExportRecords(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String payrollMonth,
            @RequestParam(required = false) String employmentType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String employee,
            @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(payrollService.getAllFilteredPayrollRecords(
                search, payrollMonth, employmentType, status, employee, sort
        ));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get dynamic KPI metrics calculated from payroll records")
    public ResponseEntity<PayrollKpiResponse> getKpis(@RequestParam(required = false) String month) {
        return ResponseEntity.ok(payrollService.getKpis(month));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get available payroll filter options")
    public ResponseEntity<PayrollFilterOptionsResponse> getFilterOptions() {
        return ResponseEntity.ok(payrollService.getFilterOptions());
    }

    @GetMapping("/{payrollId}")
    @Operation(summary = "Get single payroll record by Payroll ID")
    public ResponseEntity<PayrollRecordDto> getPayrollRecordById(@PathVariable String payrollId) {
        return ResponseEntity.ok(payrollService.getPayrollRecordById(payrollId));
    }

    @PostMapping("/process")
    @Operation(summary = "Process and create a new payroll record")
    public ResponseEntity<PayrollRecordDto> processPayroll(@Valid @RequestBody ProcessPayrollRequest request) {
        PayrollRecordDto created = payrollService.processPayroll(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{payrollId}")
    @Operation(summary = "Update an existing payroll record")
    public ResponseEntity<PayrollRecordDto> updatePayrollRecord(
            @PathVariable String payrollId,
            @Valid @RequestBody UpdatePayrollRequest request
    ) {
        return ResponseEntity.ok(payrollService.updatePayrollRecord(payrollId, request));
    }

    @DeleteMapping("/{payrollId}")
    @Operation(summary = "Delete a payroll record")
    public ResponseEntity<Void> deletePayrollRecord(@PathVariable String payrollId) {
        payrollService.deletePayrollRecord(payrollId);
        return ResponseEntity.noContent().build();
    }
}

