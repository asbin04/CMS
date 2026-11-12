package com.company.project.reports.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.reports.dto.TransactionControlResponse;
import com.company.project.reports.service.TransactionControlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports/transaction-control")
@RequiredArgsConstructor
@Tag(name = "Reports & Control API", description = "Endpoints for transaction control checks and source record auditing")
public class TransactionControlController {

    private final TransactionControlService transactionControlService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Evaluate the six transaction control checks against live database records")
    public ResponseEntity<ApiResponse<TransactionControlResponse>> getTransactionControlChecks() {
        TransactionControlResponse response = transactionControlService.evaluateControls();
        return ResponseEntity.ok(ApiResponse.success("Transaction control checks evaluated successfully", response));
    }

    @PostMapping("/recheck")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Re-evaluate all transaction control checks against live database records")
    public ResponseEntity<ApiResponse<TransactionControlResponse>> recheckTransactionControlChecks() {
        TransactionControlResponse response = transactionControlService.evaluateControls();
        return ResponseEntity.ok(ApiResponse.success("Transaction control checks re-evaluated successfully", response));
    }
}

