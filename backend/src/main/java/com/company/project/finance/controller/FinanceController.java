package com.company.project.finance.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.finance.dto.FinanceDashboardResponse;
import com.company.project.finance.dto.FinancePeriod;
import com.company.project.finance.service.FinanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@Tag(name = "Finance API", description = "Endpoints for Finance Dashboard, Expense Management, and Export")
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Get aggregated finance dashboard data for a period")
    public ResponseEntity<ApiResponse<FinanceDashboardResponse>> getDashboard(
            @RequestParam(required = false, defaultValue = "THIS_FISCAL_YEAR") FinancePeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOf
    ) {
        FinanceDashboardResponse response = financeService.getDashboard(period, from, to, asOf);
        return ResponseEntity.ok(ApiResponse.success("Finance dashboard data retrieved successfully", response));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Export finance dashboard summary to CSV")
    public void exportCsv(
            @RequestParam(required = false, defaultValue = "THIS_FISCAL_YEAR") FinancePeriod period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletResponse response
    ) throws IOException {
        financeService.exportCsv(period, from, to, response);
    }
}

