package com.company.project.collections.controller;

import com.company.project.collections.dto.*;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.collections.service.CollectionsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class FinanceInvoiceControllerTest {

    static {
        File[] envFiles = new File[]{ new File(".env"), new File("backend/.env"), new File("../.env") };
        for (File envFile : envFiles) {
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception ignored) {}
                break;
            }
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CollectionsService collectionsService;

    @Autowired
    private CollectionInvoiceRepository invoiceRepository;

    @Autowired
    private CollectionPaymentRepository paymentRepository;

    @Autowired
    private CollectionPaymentReversalRepository paymentReversalRepository;

    @Test
    @DisplayName("1. GET /api/v1/invoices returns paginated invoices")
    void testListInvoicesPaginated() throws Exception {
        mockMvc.perform(get("/api/v1/invoices")
                        .param("page", "0")
                        .param("size", "10")
                        .param("sortField", "createdAt")
                        .param("sortOrder", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.pageNumber", is(0)))
                .andExpect(jsonPath("$.data.pageSize", is(10)))
                .andExpect(jsonPath("$.data.totalElements", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("2. GET /api/v1/invoices with search and preset filters (supports both preset and filter params)")
    void testFilterInvoices() throws Exception {
        mockMvc.perform(get("/api/v1/invoices")
                        .param("preset", "overdue")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content[0].status", is("Overdue")));

        // Test with ?filter=overdue alias used by Management Collections navigation
        mockMvc.perform(get("/api/v1/invoices")
                        .param("filter", "overdue")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content[0].status", is("Overdue")));
    }

    @Test
    @DisplayName("3. GET /api/v1/invoices/kpis returns calculated summary")
    void testGetKpis() throws Exception {
        mockMvc.perform(get("/api/v1/invoices/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalInvoices", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalInvoiceValue", notNullValue()))
                .andExpect(jsonPath("$.data.paidAmount", notNullValue()))
                .andExpect(jsonPath("$.data.outstandingAmount", notNullValue()));
    }

    @Test
    @DisplayName("4. GET /api/v1/invoices/next-id returns suggested preview ID without consuming counter")
    void testGetNextInvoiceId() throws Exception {
        mockMvc.perform(get("/api/v1/invoices/next-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.nextInvoiceId", matchesPattern("^INV-\\d{4}-\\d+$")))
                .andExpect(jsonPath("$.data.format", is("INV-YYYY-XXX")));
    }

    @Test
    @DisplayName("5. POST /api/v1/invoices creates new Finance invoice and GET /{id} retrieves it")
    void testCreateAndGetInvoice() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Apex Systems " + runId)
                .clientId("CL-" + runId)
                .projectId("PRJ-" + runId)
                .contractId("CNT-" + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .taxRate(new BigDecimal("18.00"))
                .paymentTermsDays(30)
                .notes("API Integration Test Invoice")
                .build();

        String responseBody = mockMvc.perform(post("/api/v1/invoices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", matchesPattern("^INV-\\d{4}-\\d+$")))
                .andExpect(jsonPath("$.data.amountBeforeTax", is(100000.00)))
                .andExpect(jsonPath("$.data.taxAmount", is(18000.00)))
                .andExpect(jsonPath("$.data.invoiceAmount", is(118000.00)))
                .andExpect(jsonPath("$.data.outstanding", is(118000.00)))
                .andExpect(jsonPath("$.data.invoiceStatus", is("Unpaid")))
                .andReturn().getResponse().getContentAsString();

        String createdId = objectMapper.readTree(responseBody).path("data").path("id").asText();

        // Retrieve by ID
        mockMvc.perform(get("/api/v1/invoices/" + createdId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", is(createdId)))
                .andExpect(jsonPath("$.data.projectId", is("PRJ-" + runId)))
                .andExpect(jsonPath("$.data.notes", is("API Integration Test Invoice")));

        // Cleanup
        invoiceRepository.deleteById(createdId);
    }

    @Test
    @DisplayName("6. PUT /api/v1/invoices/{id} updates invoice details")
    void testUpdateInvoice() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Update Target " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        UpdateInvoiceRequest updateReq = UpdateInvoiceRequest.builder()
                .notes("Updated notes via PUT")
                .paymentTermsDays(60)
                .amountBeforeTax(new BigDecimal("60000.00"))
                .taxRate(new BigDecimal("10.00"))
                .build();

        mockMvc.perform(put("/api/v1/invoices/" + created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.notes", is("Updated notes via PUT")))
                .andExpect(jsonPath("$.data.paymentTermsDays", is(60)))
                .andExpect(jsonPath("$.data.invoiceAmount", is(66000.00)));

        // Cleanup
        invoiceRepository.deleteById(created.getId());
    }

    @Test
    @DisplayName("7. DELETE /api/v1/invoices/{id} restrictions: allowed when clean, forbidden when payments exist")
    void testDeleteInvoiceRestrictions() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Delete Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("30000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        // Record payment
        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("10000.00"));
        collectionsService.recordPayment(created.getId(), payReq);

        // Attempt DELETE -> 400 Bad Request
        mockMvc.perform(delete("/api/v1/invoices/" + created.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Cannot delete invoice")));

        // Cleanup
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(created.getId()));
        invoiceRepository.deleteById(created.getId());
    }

    @Test
    @DisplayName("8. GET /api/v1/invoices/{id}/payments returns payment history")
    void testGetInvoicePayments() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("History Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("15000.00"));
        payReq.setPaymentMethod("Credit Card");
        payReq.setReferenceId("TXN-HIST-" + runId);
        collectionsService.recordPayment(created.getId(), payReq);

        mockMvc.perform(get("/api/v1/invoices/" + created.getId() + "/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].amount", is(15000.00)))
                .andExpect(jsonPath("$.data[0].referenceId", is("TXN-HIST-" + runId)));

        // Cleanup
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(created.getId()));
        invoiceRepository.deleteById(created.getId());
    }

    @Test
    @DisplayName("9. POST /api/v1/invoices/{invoiceId}/payments/{paymentId}/reversals reverses payment with idempotency")
    void testPaymentReversalEndpoint() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Reversal API Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse invoice = collectionsService.createInvoice(req);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("25000.00"));
        payReq.setReferenceId("TXN-PAY-" + runId);
        PaymentRecordResponse payment = collectionsService.recordPayment(invoice.getId(), payReq);

        String idempKey = "IDEMP-API-" + runId;
        CreatePaymentReversalRequest revReq = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("10000.00"))
                .reason("API Endpoint Reversal Test")
                .referenceId("REV-API-" + runId)
                .idempotencyKey(idempKey)
                .createdBy("ApiTester")
                .build();

        // First attempt -> 201 Created
        mockMvc.perform(post("/api/v1/invoices/" + invoice.getId() + "/payments/" + payment.getId() + "/reversals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(revReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", matchesPattern("^REV-\\d{4}-\\d+$")))
                .andExpect(jsonPath("$.data.amount", is(10000.00)))
                .andExpect(jsonPath("$.data.invoiceOutstanding", is(35000.00)))
                .andExpect(jsonPath("$.data.invoiceAmountPaid", is(15000.00)));

        // Repeated request with same idempotency key -> 201 Created with original reversal
        mockMvc.perform(post("/api/v1/invoices/" + invoice.getId() + "/payments/" + payment.getId() + "/reversals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(revReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.amount", is(10000.00)));

        // Mismatched amount on same idempotency key -> 409 Conflict
        CreatePaymentReversalRequest conflictReq = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("12345.00"))
                .reason("Mismatched amount")
                .referenceId("REV-API-" + runId)
                .idempotencyKey(idempKey)
                .build();

        mockMvc.perform(post("/api/v1/invoices/" + invoice.getId() + "/payments/" + payment.getId() + "/reversals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.status", is(409)));

        // Cleanup
        paymentReversalRepository.deleteAll(paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(invoice.getId()));
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(invoice.getId()));
        invoiceRepository.deleteById(invoice.getId());
    }

    @Test
    @DisplayName("10. Existing Management -> Collections endpoints remain 100% backward compatible")
    void testExistingCollectionsEndpointsCompatibility() throws Exception {
        mockMvc.perform(get("/api/v1/collections/invoices").param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", notNullValue()));

        mockMvc.perform(get("/api/v1/collections/kpis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalOutstanding", notNullValue()));

        mockMvc.perform(get("/api/v1/collections/clients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data[0]", is("All Clients")));
    }

    @Test
    @DisplayName("11. Invoice Date filtering by range (invoiceDateFrom and invoiceDateTo) includes inclusive boundary dates")
    void testInvoiceDateRangeFiltering() throws Exception {
        String testSuffix = UUID.randomUUID().toString().substring(0, 6);

        // 1. Create Sep 30 invoice (excluded from Oct)
        CreateInvoiceRequest reqSep = CreateInvoiceRequest.builder()
                .client("DateTestClient-" + testSuffix)
                .clientId("CL-DATE-" + testSuffix)
                .invoiceDate("2026-09-30")
                .dueDate("2026-10-30")
                .amountBeforeTax(new BigDecimal("10000.00"))
                .taxRate(new BigDecimal("18.00"))
                .notes("Sep boundary test")
                .build();
        InvoiceResponse invSep = collectionsService.createInvoice(reqSep);

        // 2. Create Oct 1 invoice (included in Oct)
        CreateInvoiceRequest reqOct1 = CreateInvoiceRequest.builder()
                .client("DateTestClient-" + testSuffix)
                .clientId("CL-DATE-" + testSuffix)
                .invoiceDate("2026-10-01")
                .dueDate("2026-10-31")
                .amountBeforeTax(new BigDecimal("20000.00"))
                .taxRate(new BigDecimal("18.00"))
                .notes("Oct start boundary test")
                .build();
        InvoiceResponse invOct1 = collectionsService.createInvoice(reqOct1);

        // 3. Create Oct 31 invoice (included in Oct)
        CreateInvoiceRequest reqOct31 = CreateInvoiceRequest.builder()
                .client("DateTestClient-" + testSuffix)
                .clientId("CL-DATE-" + testSuffix)
                .invoiceDate("2026-10-31")
                .dueDate("2026-11-30")
                .amountBeforeTax(new BigDecimal("30000.00"))
                .taxRate(new BigDecimal("18.00"))
                .notes("Oct end boundary test")
                .build();
        InvoiceResponse invOct31 = collectionsService.createInvoice(reqOct31);

        // 4. Create Nov 1 invoice (excluded from Oct)
        CreateInvoiceRequest reqNov = CreateInvoiceRequest.builder()
                .client("DateTestClient-" + testSuffix)
                .clientId("CL-DATE-" + testSuffix)
                .invoiceDate("2026-11-01")
                .dueDate("2026-12-01")
                .amountBeforeTax(new BigDecimal("40000.00"))
                .taxRate(new BigDecimal("18.00"))
                .notes("Nov boundary test")
                .build();
        InvoiceResponse invNov = collectionsService.createInvoice(reqNov);

        try {
            // Query for October 2026: 2026-10-01 to 2026-10-31 for this test client
            mockMvc.perform(get("/api/v1/invoices")
                            .param("client", "DateTestClient-" + testSuffix)
                            .param("invoiceDateFrom", "2026-10-01")
                            .param("invoiceDateTo", "2026-10-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success", is(true)))
                    .andExpect(jsonPath("$.data.totalElements", is(2)))
                    .andExpect(jsonPath("$.data.content[*].id", hasItems(invOct1.getId(), invOct31.getId())))
                    .andExpect(jsonPath("$.data.content[*].id", not(hasItem(invSep.getId()))))
                    .andExpect(jsonPath("$.data.content[*].id", not(hasItem(invNov.getId()))));

            // Query for September 2026
            mockMvc.perform(get("/api/v1/invoices")
                            .param("client", "DateTestClient-" + testSuffix)
                            .param("invoiceDateFrom", "2026-09-01")
                            .param("invoiceDateTo", "2026-09-30"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalElements", is(1)))
                    .andExpect(jsonPath("$.data.content[0].id", is(invSep.getId())));

            // Query for November 2026
            mockMvc.perform(get("/api/v1/invoices")
                            .param("client", "DateTestClient-" + testSuffix)
                            .param("invoiceDateFrom", "2026-11-01")
                            .param("invoiceDateTo", "2026-11-30"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.totalElements", is(1)))
                    .andExpect(jsonPath("$.data.content[0].id", is(invNov.getId())));

        } finally {
            // Cleanup test records
            invoiceRepository.deleteById(invSep.getId());
            invoiceRepository.deleteById(invOct1.getId());
            invoiceRepository.deleteById(invOct31.getId());
            invoiceRepository.deleteById(invNov.getId());
        }
    }
}

