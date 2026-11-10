package com.company.project.finance.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.service.ExpenseService;
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
@RequestMapping("/api/v1/finance/expenses")
@RequiredArgsConstructor
@Tag(name = "Finance Expenses", description = "Management APIs for company expenses, reimbursements and project costs")
public class ExpenseController {

    private final ExpenseService service;

    @GetMapping
    @Operation(summary = "Get all expenses with optional query filters")
    public ResponseEntity<ApiResponse<List<ExpenseDto>>> getAllExpenses(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String month
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllExpenses(search, category, status, projectId, month)));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get expense KPI metrics")
    public ResponseEntity<ApiResponse<ExpenseKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter dropdown options for expenses")
    public ResponseEntity<ApiResponse<ExpenseFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get expense by ID")
    public ResponseEntity<ApiResponse<ExpenseDto>> getExpenseById(@PathVariable Long id) {
        ExpenseDto dto = service.getExpenseById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get expense by Expense Code")
    public ResponseEntity<ApiResponse<ExpenseDto>> getExpenseByCode(@PathVariable String code) {
        ExpenseDto dto = service.getExpenseByCode(code);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new expense entry")
    public ResponseEntity<ApiResponse<ExpenseDto>> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        ExpenseDto created = service.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expense created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing expense entry")
    public ResponseEntity<ApiResponse<ExpenseDto>> updateExpense(@PathVariable Long id, @RequestBody UpdateExpenseRequest request) {
        ExpenseDto updated = service.updateExpense(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Expense updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Delete an expense entry")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(@PathVariable Long id) {
        service.deleteExpense(id);
        return ResponseEntity.ok(ApiResponse.success("Expense deleted successfully", null));
    }
}

