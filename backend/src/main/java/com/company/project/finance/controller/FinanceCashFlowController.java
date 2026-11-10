package com.company.project.finance.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.service.FinanceCashFlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/finance/cash-flows")
@RequiredArgsConstructor
@Tag(name = "Finance Cash Flow API", description = "Endpoints for managing monthly cash flow records, KPI metrics, trends analysis, and CSV export")
public class FinanceCashFlowController {

    private final FinanceCashFlowService cashFlowService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get paginated, filtered and sorted cash flow records")
    public ResponseEntity<ApiResponse<PageResponse<CashFlowResponse>>> getCashFlows(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<CashFlowResponse> response = cashFlowService.getCashFlows(search, period, status, sort, page, size);
        return ResponseEntity.ok(ApiResponse.success("Cash flow records retrieved successfully", response));
    }

    @GetMapping("/kpis")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get latest period KPI metrics for the Cash Flow dashboard")
    public ResponseEntity<ApiResponse<CashFlowKpisResponse>> getKpis() {
        CashFlowKpisResponse response = cashFlowService.getKpis();
        return ResponseEntity.ok(ApiResponse.success("Cash flow KPIs retrieved successfully", response));
    }

    @GetMapping("/trends")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get historical trends, monthly comparisons, outflow breakdown donut, and key insights")
    public ResponseEntity<ApiResponse<CashFlowTrendsResponse>> getTrends() {
        CashFlowTrendsResponse response = cashFlowService.getTrends();
        return ResponseEntity.ok(ApiResponse.success("Cash flow trends retrieved successfully", response));
    }

    @GetMapping("/suggested-opening-cash")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Suggest opening cash for a period based on the previous period's closing cash")
    public ResponseEntity<ApiResponse<SuggestedOpeningCashResponse>> getSuggestedOpeningCash(
            @RequestParam(required = false) String period
    ) {
        SuggestedOpeningCashResponse response = cashFlowService.getSuggestedOpeningCash(period);
        return ResponseEntity.ok(ApiResponse.success("Suggested opening cash calculated successfully", response));
    }

    @GetMapping("/next-id")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Preview the next available Cash Flow ID for the given year")
    public ResponseEntity<ApiResponse<NextCashFlowIdResponse>> getNextId(
            @RequestParam(required = false) String year
    ) {
        NextCashFlowIdResponse response = cashFlowService.getNextId(year);
        return ResponseEntity.ok(ApiResponse.success("Next cash flow ID retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get cash flow record by ID or Cash Flow ID")
    public ResponseEntity<ApiResponse<CashFlowResponse>> getCashFlowById(@PathVariable String id) {
        CashFlowResponse response = cashFlowService.getCashFlowById(id);
        return ResponseEntity.ok(ApiResponse.success("Cash flow record retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Create a new cash flow record")
    public ResponseEntity<ApiResponse<CashFlowResponse>> createCashFlow(
            @Valid @RequestBody CreateCashFlowRequest request,
            Principal principal
    ) {
        String username = (principal != null) ? principal.getName() : "System";
        CashFlowResponse created = cashFlowService.createCashFlow(request, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Cash flow record created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update an existing cash flow record (locked if status is Completed)")
    public ResponseEntity<ApiResponse<CashFlowResponse>> updateCashFlow(
            @PathVariable String id,
            @Valid @RequestBody UpdateCashFlowRequest request,
            Principal principal
    ) {
        String username = (principal != null) ? principal.getName() : "System";
        CashFlowResponse updated = cashFlowService.updateCashFlow(id, request, username);
        return ResponseEntity.ok(ApiResponse.success("Cash flow record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a cash flow record (ADMIN only; locked if status is Completed)")
    public ResponseEntity<ApiResponse<Void>> deleteCashFlow(
            @PathVariable String id,
            Principal principal
    ) {
        String username = (principal != null) ? principal.getName() : "Admin";
        cashFlowService.deleteCashFlow(id, username);
        return ResponseEntity.ok(ApiResponse.success("Cash flow record deleted successfully", null));
    }

    @GetMapping("/export")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Export filtered cash flow records as CSV")
    public ResponseEntity<byte[]> exportCashFlows(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String status
    ) {
        byte[] csvData = cashFlowService.exportCashFlowsToCsv(search, period, status);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"cash-flows-export.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}

