package com.company.project.support.controller;

import com.company.project.common.response.ApiResponse;
import com.company.project.support.dto.*;
import com.company.project.support.service.SupportTicketService;
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
@RequestMapping("/api/v1/support/tickets")
@RequiredArgsConstructor
@Tag(name = "Support Tickets", description = "Management APIs for client support tickets and SLA monitoring")
public class SupportTicketController {

    private final SupportTicketService service;

    @GetMapping
    @Operation(summary = "Get all support tickets with optional query filters")
    public ResponseEntity<ApiResponse<List<SupportTicketDto>>> getAllTickets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String ticketType,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String slaStatus
    ) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllTickets(search, ticketType, priority, status, slaStatus)));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get support ticket KPI metrics")
    public ResponseEntity<ApiResponse<SupportTicketKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success(service.getKpis()));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get support ticket trends and SLA analytics")
    public ResponseEntity<ApiResponse<SupportTicketTrendsResponse>> getTrends() {
        return ResponseEntity.ok(ApiResponse.success(service.getTrends()));
    }

    @GetMapping("/filters")
    @Operation(summary = "Get distinct filter dropdown options for support tickets")
    public ResponseEntity<ApiResponse<SupportTicketFilterOptionsResponse>> getFilterOptions() {
        return ResponseEntity.ok(ApiResponse.success(service.getFilterOptions()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get support ticket by ID")
    public ResponseEntity<ApiResponse<SupportTicketDto>> getTicketById(@PathVariable Long id) {
        SupportTicketDto dto = service.getTicketById(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get support ticket by Ticket Code")
    public ResponseEntity<ApiResponse<SupportTicketDto>> getTicketByCode(@PathVariable String code) {
        SupportTicketDto dto = service.getTicketByCode(code);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Create a new support ticket")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createTicket(@Valid @RequestBody CreateSupportTicketRequest request) {
        SupportTicketDto created = service.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CEO')")
    @Operation(summary = "Update an existing support ticket")
    public ResponseEntity<ApiResponse<SupportTicketDto>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupportTicketRequest request
    ) {
        SupportTicketDto updated = service.updateTicket(id, request);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("Support ticket updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a support ticket")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable Long id) {
        service.deleteTicket(id);
        return ResponseEntity.ok(ApiResponse.success("Support ticket deleted successfully", null));
    }
}

