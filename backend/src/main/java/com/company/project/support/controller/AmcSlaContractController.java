package com.company.project.support.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.support.dto.*;
import com.company.project.support.service.AmcSlaContractService;
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
@RequestMapping("/api/v1/support/amc-sla")
@RequiredArgsConstructor
@Tag(name = "AMC & SLA Contracts", description = "Management APIs for Annual Maintenance Contracts (AMC) and Service Level Agreements (SLA)")
public class AmcSlaContractController {

    private final AmcSlaContractService service;

    @GetMapping
    @Operation(summary = "Get all AMC/SLA contracts with optional search and filters")
    public ResponseEntity<ApiResponse<List<AmcSlaContractDto>>> getAllContracts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String serviceType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String renewalAlert,
            @RequestParam(required = false) String owner,
            @RequestParam(required = false) String renewalWindow
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllContracts(search, serviceType, status, renewalAlert, owner, renewalWindow)));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get AMC/SLA contracts KPI metrics")
    public ResponseEntity<ApiResponse<AmcSlaKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter dropdown options for AMC/SLA contracts")
    public ResponseEntity<ApiResponse<AmcSlaFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get AMC/SLA contract by ID")
    public ResponseEntity<ApiResponse<AmcSlaContractDto>> getContractById(@PathVariable Long id) {
        AmcSlaContractDto dto = service.getContractById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get AMC/SLA contract by Contract Code")
    public ResponseEntity<ApiResponse<AmcSlaContractDto>> getContractByCode(@PathVariable String code) {
        AmcSlaContractDto dto = service.getContractByCode(code);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new AMC/SLA contract")
    public ResponseEntity<ApiResponse<AmcSlaContractDto>> createContract(@Valid @RequestBody CreateAmcSlaContractRequest request) {
        AmcSlaContractDto created = service.createContract(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("AMC/SLA contract created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing AMC/SLA contract")
    public ResponseEntity<ApiResponse<AmcSlaContractDto>> updateContract(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAmcSlaContractRequest request
    ) {
        AmcSlaContractDto updated = service.updateContract(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("AMC/SLA contract updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an AMC/SLA contract")
    public ResponseEntity<ApiResponse<Void>> deleteContract(@PathVariable Long id) {
        service.deleteContract(id);
        return ResponseEntity.ok(ApiResponse.success("AMC/SLA contract deleted successfully", null));
    }
}

