package com.company.project.finance.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;
import com.company.project.finance.service.FinancePaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/finance/payments")
@RequiredArgsConstructor
@Tag(name = "Finance Payments API", description = "Endpoints for managing client invoice payments, matching, and KPI metrics")
public class FinancePaymentController {

    private final FinancePaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get paginated, filtered and sorted payment records")
    public ResponseEntity<ApiResponse<PageResponse<FinancePaymentDto>>> getPayments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String client,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<FinancePaymentDto> response = paymentService.getPayments(
                search, startDate, endDate, status, mode, client, month, sort, page, size
        );
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", response));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get dynamic KPI summary cards metrics")
    public ResponseEntity<ApiResponse<FinancePaymentKpiResponse>> getKpis(
            @RequestParam(required = false) String month
    ) {
        FinancePaymentKpiResponse kpis = paymentService.getKpiSummary(month);
        return ResponseEntity.ok(ApiResponse.success("Payment KPIs retrieved successfully", kpis));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter dropdown options from database")
    public ResponseEntity<ApiResponse<FinancePaymentFilterOptionsResponse>> getFilterOptions() {
        FinancePaymentFilterOptionsResponse filters = paymentService.getFilterOptions();
        return ResponseEntity.ok(ApiResponse.success("Filter options retrieved successfully", filters));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment details by ID")
    public ResponseEntity<ApiResponse<FinancePaymentDto>> getPaymentById(@PathVariable String id) {
        FinancePaymentDto payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
    }

    @PostMapping
    @Operation(summary = "Record a new payment")
    public ResponseEntity<ApiResponse<FinancePaymentDto>> recordPayment(@Valid @RequestBody RecordPaymentRequest request) {
        FinancePaymentDto created = paymentService.recordPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment recorded successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing payment")
    public ResponseEntity<ApiResponse<FinancePaymentDto>> updatePayment(
            @PathVariable String id,
            @Valid @RequestBody UpdatePaymentRequest request
    ) {
        FinancePaymentDto updated = paymentService.updatePayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a payment record")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable String id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }

    @GetMapping("/export")
    @Operation(summary = "Export all payments matching current filter")
    public ResponseEntity<ApiResponse<List<FinancePaymentDto>>> exportPayments(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String client,
            @RequestParam(required = false) String month
    ) {
        List<FinancePaymentDto> list = paymentService.getAllPaymentsForExport(
                search, startDate, endDate, status, mode, client, month
        );
        return ResponseEntity.ok(ApiResponse.success("Export data retrieved successfully", list));
    }
}

