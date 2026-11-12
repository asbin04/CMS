package com.company.project.sales.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.sales.dto.dashboard.*;
import com.company.project.sales.service.SalesDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/reports/sales-dashboard")
@RequiredArgsConstructor
@Tag(name = "Sales Dashboard API", description = "Endpoints for Sales Performance & Pipeline Dashboard, KPIs, funnels, and exports")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGEMENT', 'SALES', 'CEO')")
public class SalesDashboardController {

    private final SalesDashboardService salesDashboardService;

    @GetMapping
    @Operation(summary = "Get complete sales dashboard payload (KPIs, performance cards, conversion funnel, and workflow)")
    public ResponseEntity<ApiResponse<SalesDashboardResponse>> getDashboard(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String period
    ) {
        SalesDashboardResponse response = salesDashboardService.getDashboard(startDate, endDate, period);
        return ResponseEntity.ok(ApiResponse.success("Sales dashboard retrieved successfully", response));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get top 4 KPI metrics for the sales dashboard")
    public ResponseEntity<ApiResponse<SalesDashboardKpisDto>> getKpis(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String period
    ) {
        SalesDashboardKpisDto kpis = salesDashboardService.getKpis(startDate, endDate, period);
        return ResponseEntity.ok(ApiResponse.success("Sales dashboard KPIs retrieved successfully", kpis));
    }

    @GetMapping("/performance")
    @Operation(summary = "Get detailed performance metrics for leads, opportunities, proposals, and contracts")
    public ResponseEntity<ApiResponse<SalesPerformanceDto>> getPerformance(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String period
    ) {
        SalesPerformanceDto performance = salesDashboardService.getPerformance(startDate, endDate, period);
        return ResponseEntity.ok(ApiResponse.success("Sales performance metrics retrieved successfully", performance));
    }

    @GetMapping("/funnel")
    @Operation(summary = "Get relationship-based sales conversion funnel and transition rates")
    public ResponseEntity<ApiResponse<SalesConversionFunnelDto>> getFunnel(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String period
    ) {
        SalesConversionFunnelDto funnel = salesDashboardService.getFunnel(startDate, endDate, period);
        return ResponseEntity.ok(ApiResponse.success("Sales conversion funnel retrieved successfully", funnel));
    }

    @GetMapping("/export")
    @Operation(summary = "Export complete sales performance and pipeline report as a UTF-8 BOM CSV spreadsheet")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String period
    ) {
        byte[] csvBytes = salesDashboardService.exportCsv(startDate, endDate, period);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "sales_performance_report_" + timestamp + ".csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}

