package com.company.project.collections.controller;

import com.company.project.collections.dto.*;
import com.company.project.collections.service.CollectionsService;
import com.company.project.collections.service.PaymentReversalService;
import com.company.project.common.response.ApiResponse;
import com.company.project.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@Tag(name = "Finance Invoices API", description = "Endpoints for Finance Invoices CRUD, Status Tracking, KPIs, and Payment Reversals")
public class InvoiceController {

    private final CollectionsService collectionsService;
    private final PaymentReversalService paymentReversalService;

    @GetMapping
    @Operation(summary = "List invoices", description = "Retrieve paginated, filtered, and sorted invoices across Finance and Collections")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoices retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid query parameters")
    })
    public ResponseEntity<ApiResponse<PageResponse<InvoiceResponse>>> getInvoices(
            @Parameter(description = "Search across invoice ID, client name, project ID, contract ID")
            @RequestParam(required = false) String search,

            @Parameter(description = "Filter by client name")
            @RequestParam(required = false) String client,

            @Parameter(description = "Filter by project ID")
            @RequestParam(required = false) String project,

            @Parameter(description = "Filter by unified status (Paid, Partially Paid, Due Soon, Overdue, Open)")
            @RequestParam(required = false) String status,

            @Parameter(description = "Filter by settlement invoiceStatus (Paid, Partially Paid, Unpaid)")
            @RequestParam(required = false) String invoiceStatus,

            @Parameter(description = "Filter by workflow collectionStatus (Completed, Follow Up, In Progress, Pending)")
            @RequestParam(required = false) String collectionStatus,

            @Parameter(description = "Filter by ageing bucket (Current, 1–30 days, 31–60 days, 61–90 days, 90+ days)")
            @RequestParam(required = false) String ageing,

            @Parameter(description = "Quick preset filter (overdue, due-soon)")
            @RequestParam(required = false) String preset,

            @Parameter(description = "Alias for preset query parameter (e.g. ?filter=overdue, ?filter=due-soon)")
            @RequestParam(required = false) String filter,

            @Parameter(description = "Filter by start of invoiceDate range (inclusive, YYYY-MM-DD)")
            @RequestParam(required = false) String invoiceDateFrom,

            @Parameter(description = "Filter by end of invoiceDate range (inclusive, YYYY-MM-DD)")
            @RequestParam(required = false) String invoiceDateTo,

            @Parameter(description = "Sort field (createdAt, invoiceDate, dueDate, outstanding, invoiceAmount, id)")
            @RequestParam(required = false) String sortField,

            @Parameter(description = "Sort order (asc, desc)")
            @RequestParam(required = false) String sortOrder,

            @Parameter(description = "Page number (0-based)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size")
            @RequestParam(defaultValue = "10") int size
    ) {
        // Handle preset shortcuts from navigation (supports both preset and filter query params)
        String effectivePreset = (filter != null && !filter.isBlank()) ? filter : preset;
        String effectiveStatus = status;
        String effectiveCollStatus = collectionStatus;
        if ("overdue".equalsIgnoreCase(effectivePreset)) {
            effectiveStatus = "Overdue";
        } else if ("due-soon".equalsIgnoreCase(effectivePreset)) {
            effectiveStatus = "Due Soon";
        }

        PageResponse<InvoiceResponse> data = collectionsService.getInvoicesFiltered(
                search, client, effectiveStatus, invoiceStatus, effectiveCollStatus, project, ageing,
                invoiceDateFrom, invoiceDateTo, sortField, sortOrder, page, size
        );

        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", data));
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get Finance invoice KPI summary", description = "Calculate totals for invoices count, total invoiced value, amount paid, and outstanding balance")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "KPIs calculated successfully")
    })
    public ResponseEntity<ApiResponse<FinanceInvoiceKpiResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.success("Invoice KPIs retrieved successfully", collectionsService.getFinanceInvoiceKpis()));
    }

    @GetMapping("/next-id")
    @Operation(summary = "Get next suggested invoice ID", description = "Preview the next available atomic invoice ID without advancing or consuming the database sequence counter")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Next invoice ID generated successfully")
    })
    public ResponseEntity<ApiResponse<NextInvoiceIdResponse>> getNextInvoiceId(
            @Parameter(description = "Target year for invoice prefix (defaults to current baseline year)")
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(ApiResponse.success("Next invoice ID generated successfully", collectionsService.getNextInvoiceId(year)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice details by ID", description = "Retrieve complete invoice header details including all V19 financial attributes")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice details retrieved"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(
            @Parameter(description = "Invoice unique identifier (e.g. INV-2025-001)")
            @PathVariable String id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Invoice retrieved successfully", collectionsService.getInvoiceById(id)));
    }

    @PostMapping
    @Operation(summary = "Create invoice", description = "Create a new Finance invoice with tax breakdown and atomic sequence generation")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Invoice created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(
            @Valid @RequestBody CreateInvoiceRequest request
    ) {
        InvoiceResponse created = collectionsService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Invoice created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update invoice", description = "Update invoice details, terms, and tax breakdown with balance validation")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation failed or new amount is less than already paid balance"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    public ResponseEntity<ApiResponse<InvoiceResponse>> updateInvoice(
            @Parameter(description = "Invoice unique identifier")
            @PathVariable String id,
            @Valid @RequestBody UpdateInvoiceRequest request
    ) {
        InvoiceResponse updated = collectionsService.updateInvoice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Invoice updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete invoice", description = "Delete an invoice only when no payments, reversals, or paid balances exist")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Invoice deleted successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Deletion forbidden because payments or reversals exist"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(
            @Parameter(description = "Invoice unique identifier")
            @PathVariable String id
    ) {
        collectionsService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully", null));
    }

    @GetMapping("/{id}/payments")
    @Operation(summary = "Get payment history", description = "Retrieve immutable payment ledger entries recorded against this invoice")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Payments retrieved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice not found")
    })
    public ResponseEntity<ApiResponse<List<PaymentRecordResponse>>> getPayments(
            @Parameter(description = "Invoice unique identifier")
            @PathVariable String id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", collectionsService.getPaymentsForInvoice(id)));
    }

    @PostMapping("/{invoiceId}/payments/{paymentId}/reversals")
    @Operation(summary = "Reverse payment", description = "Reverse a payment transactionally with idempotency and balance safeguards")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Payment reversed successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid reversal amount or exceeds reversible limit"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Invoice or payment not found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Idempotency or reference conflict detected")
    })
    public ResponseEntity<ApiResponse<PaymentReversalResponse>> reversePayment(
            @Parameter(description = "Invoice unique identifier")
            @PathVariable String invoiceId,

            @Parameter(description = "Payment unique identifier to reverse")
            @PathVariable String paymentId,

            @Valid @RequestBody CreatePaymentReversalRequest request
    ) {
        PaymentReversalResponse response = paymentReversalService.reversePayment(invoiceId, paymentId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Payment reversal recorded successfully", response));
    }
}

