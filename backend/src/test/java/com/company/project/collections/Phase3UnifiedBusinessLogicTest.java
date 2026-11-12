package com.company.project.collections;

import com.company.project.collections.dto.*;
import com.company.project.collections.entity.CollectionInvoiceEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.collections.service.CollectionsCalculationService;
import com.company.project.collections.service.CollectionsService;
import com.company.project.collections.service.InvoiceIdGeneratorService;
import com.company.project.collections.service.PaymentReversalService;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class Phase3UnifiedBusinessLogicTest {

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
    private CollectionsService collectionsService;

    @Autowired
    private PaymentReversalService reversalService;

    @Autowired
    private CollectionsCalculationService calculationService;

    @Autowired
    private InvoiceIdGeneratorService idGeneratorService;

    @Autowired
    private CollectionInvoiceRepository invoiceRepository;

    @Autowired
    private CollectionPaymentRepository paymentRepository;

    @Autowired
    private CollectionPaymentReversalRepository paymentReversalRepository;

    // =========================================================================
    // 1. INVOICE OPERATIONS
    // =========================================================================

    @Test
    @Transactional
    @DisplayName("1.1 Create Invoice with full Finance fields and atomic ID")
    void testCreateInvoiceFinanceFields() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Unified Tech Corp")
                .clientId("CL-9901")
                .projectId("PRJ-ALPHA-1")
                .contractId("CNT-2026-X")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .taxRate(new BigDecimal("18.00"))
                .paymentTermsDays(30)
                .notes("Phase 3 Finance invoice test")
                .build();

        InvoiceResponse response = collectionsService.createInvoice(req);

        assertNotNull(response.getId());
        assertTrue(response.getId().startsWith("INV-2026-"));
        assertEquals("Unified Tech Corp", response.getClient());
        assertEquals("CL-9901", response.getClientId());
        assertEquals("PRJ-ALPHA-1", response.getProjectId());
        assertEquals("CNT-2026-X", response.getContractId());
        assertEquals(new BigDecimal("100000.00"), response.getAmountBeforeTax());
        assertEquals(new BigDecimal("18.00"), response.getTaxRate());
        assertEquals(new BigDecimal("18000.00"), response.getTaxAmount());
        assertEquals(new BigDecimal("118000.00"), response.getInvoiceAmount());
        assertEquals(new BigDecimal("118000.00"), response.getOutstanding());
        assertEquals(BigDecimal.ZERO, response.getAmountPaid());
        assertEquals(30, response.getPaymentTermsDays());
        assertEquals("Unpaid", response.getInvoiceStatus());
        assertEquals("Phase 3 Finance invoice test", response.getNotes());
    }

    @Test
    @DisplayName("1.2 Create Invoice rejects invalid / negative amounts")
    void testInvalidInvoiceAmountNegative() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Invalid Client")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("-500.00"))
                .build();

        assertThrows(BusinessValidationException.class, () -> collectionsService.createInvoice(req));
    }

    @Test
    @Transactional
    @DisplayName("1.3 Update Invoice details and recalculate status")
    void testUpdateInvoiceDetailsAndRecalculate() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Update Target Corp")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        UpdateInvoiceRequest updateReq = UpdateInvoiceRequest.builder()
                .notes("Updated notes content")
                .paymentTermsDays(45)
                .amountBeforeTax(new BigDecimal("60000.00"))
                .taxRate(new BigDecimal("10.00"))
                .build();

        InvoiceResponse updated = collectionsService.updateInvoice(created.getId(), updateReq);

        assertEquals("Updated notes content", updated.getNotes());
        assertEquals(45, updated.getPaymentTermsDays());
        assertEquals(new BigDecimal("60000.00"), updated.getAmountBeforeTax());
        assertEquals(new BigDecimal("6000.00"), updated.getTaxAmount());
        assertEquals(new BigDecimal("66000.00"), updated.getInvoiceAmount());
        assertEquals(new BigDecimal("66000.00"), updated.getOutstanding());
    }

    @Test
    @Transactional
    @DisplayName("1.4 Update Invoice amount cannot be less than already paid balance")
    void testUpdateInvoiceAmountLessThanPaid() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Paid Invoice Corp")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        // Record payment of ₹50,000
        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("50000.00"));
        payReq.setPaymentMethod("Wire");
        collectionsService.recordPayment(created.getId(), payReq);

        // Attempt updating total invoice amount to ₹40,000 (< paid ₹50,000)
        UpdateInvoiceRequest updateReq = UpdateInvoiceRequest.builder()
                .amountBeforeTax(new BigDecimal("40000.00"))
                .taxRate(BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .build();

        assertThrows(BusinessValidationException.class, () ->
                collectionsService.updateInvoice(created.getId(), updateReq));
    }

    @Test
    @Transactional
    @DisplayName("1.5 Delete Invoice restrictions: forbidden if payments exist, allowed if clean")
    void testDeleteInvoiceRestrictions() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Delete Test Client")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("25000.00"))
                .build();
        InvoiceResponse cleanInv = collectionsService.createInvoice(req);

        // Should succeed on clean invoice
        collectionsService.deleteInvoice(cleanInv.getId());
        assertFalse(invoiceRepository.existsById(cleanInv.getId()));

        // Create another invoice and record payment
        InvoiceResponse paidInv = collectionsService.createInvoice(req);
        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("5000.00"));
        collectionsService.recordPayment(paidInv.getId(), payReq);

        // Deletion must be rejected
        assertThrows(BusinessValidationException.class, () ->
                collectionsService.deleteInvoice(paidInv.getId()));
    }

    @Test
    @DisplayName("1.6 Concurrent invoice ID generation produces unique sequences")
    void testConcurrentInvoiceIdGeneration() throws Exception {
        int threads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> idGeneratorService.generateAndAllocateNextInvoiceId(2026)));
        }

        Set<String> generatedIds = new HashSet<>();
        for (Future<String> future : futures) {
            String id = future.get(10, TimeUnit.SECONDS);
            assertNotNull(id);
            generatedIds.add(id);
        }
        executor.shutdown();

        assertEquals(threads, generatedIds.size(), "All concurrently generated IDs must be distinct");
    }

    // =========================================================================
    // 2. PAYMENT OPERATIONS
    // =========================================================================

    @Test
    @Transactional
    @DisplayName("2.1 Partial and Full payment transitions and status recalculation")
    void testPartialAndFullPaymentAndStatusRecalculation() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Payment Lifecycle Corp")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        // 1. Partial payment of ₹40,000
        RecordPaymentRequest partialReq = new RecordPaymentRequest();
        partialReq.setAmount(new BigDecimal("40000.00"));
        partialReq.setReferenceId("TXN-PARTIAL-001");
        PaymentRecordResponse partialRes = collectionsService.recordPayment(created.getId(), partialReq);

        assertEquals(new BigDecimal("40000.00"), partialRes.getAmount());

        InvoiceResponse afterPartial = collectionsService.getInvoiceById(created.getId());
        assertEquals(new BigDecimal("60000.00"), afterPartial.getOutstanding());
        assertEquals(new BigDecimal("40000.00"), afterPartial.getAmountPaid());
        assertEquals("Partially Paid", afterPartial.getInvoiceStatus());

        // 2. Full payment of remaining ₹60,000
        RecordPaymentRequest fullReq = new RecordPaymentRequest();
        fullReq.setAmount(new BigDecimal("60000.00"));
        fullReq.setReferenceId("TXN-FULL-002");
        collectionsService.recordPayment(created.getId(), fullReq);

        InvoiceResponse afterFull = collectionsService.getInvoiceById(created.getId());
        assertEquals(BigDecimal.ZERO, afterFull.getOutstanding());
        assertEquals(new BigDecimal("100000.00"), afterFull.getAmountPaid());
        assertEquals("Paid", afterFull.getInvoiceStatus());
        assertEquals("Completed", afterFull.getCollectionStatus());
        assertEquals("Paid", afterFull.getStatus());
        assertEquals("Current", afterFull.getAgeingBucket());
        assertNull(afterFull.getDaysOverdue());
    }

    @Test
    @Transactional
    @DisplayName("2.2 Payment exceeding outstanding balance is rejected")
    void testExcessPaymentRejection() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Excess Pay Client")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        RecordPaymentRequest excessReq = new RecordPaymentRequest();
        excessReq.setAmount(new BigDecimal("50000.01"));

        assertThrows(BusinessValidationException.class, () ->
                collectionsService.recordPayment(created.getId(), excessReq));
    }

    @Test
    @Transactional
    @DisplayName("2.3 Duplicate normalized payment reference is rejected with ConflictException")
    void testDuplicatePaymentReferenceRejection() {
        CreateInvoiceRequest req = CreateInvoiceRequest.builder()
                .client("Dup Ref Client")
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse created = collectionsService.createInvoice(req);

        RecordPaymentRequest firstPay = new RecordPaymentRequest();
        firstPay.setAmount(new BigDecimal("10000.00"));
        firstPay.setReferenceId("TXN-REF-999");
        collectionsService.recordPayment(created.getId(), firstPay);

        // Attempt recording payment with same reference in lowercase and whitespace
        RecordPaymentRequest dupPay = new RecordPaymentRequest();
        dupPay.setAmount(new BigDecimal("10000.00"));
        dupPay.setReferenceId("  txn-ref-999  ");

        assertThrows(ConflictException.class, () ->
                collectionsService.recordPayment(created.getId(), dupPay));
    }

    // =========================================================================
    // 3. PAYMENT REVERSAL ENGINE
    // =========================================================================

    @Test
    @DisplayName("3.1 Valid Partial and Full Reversal with balance restoration")
    void testReversalLifecycle() {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        // Create an invoice outside transactional wrapper for safe two-tier worker tests
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Reversal Lifecycle Corp " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse inv = collectionsService.createInvoice(invReq);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("70000.00"));
        payReq.setReferenceId("TXN-REV-TEST-" + runId);
        PaymentRecordResponse payment = collectionsService.recordPayment(inv.getId(), payReq);

        // 1. Partial Reversal of ₹30,000
        CreatePaymentReversalRequest revReq1 = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("30000.00"))
                .reason("Customer requested refund")
                .referenceId("REV-TXN-PARTIAL-" + runId)
                .idempotencyKey("IDEMP-KEY-P3-1-" + runId)
                .createdBy("TestRunner")
                .build();

        PaymentReversalResponse rev1 = reversalService.reversePayment(inv.getId(), payment.getId(), revReq1);
        assertEquals(new BigDecimal("30000.00"), rev1.getAmount());
        assertEquals(new BigDecimal("60000.00"), rev1.getInvoiceOutstanding());
        assertEquals(new BigDecimal("40000.00"), rev1.getInvoiceAmountPaid());

        // 2. Full Reversal of remaining ₹40,000
        CreatePaymentReversalRequest revReq2 = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("40000.00"))
                .reason("Full remaining reversal")
                .referenceId("REV-TXN-FULL-" + runId)
                .idempotencyKey("IDEMP-KEY-P3-2-" + runId)
                .createdBy("TestRunner")
                .build();

        PaymentReversalResponse rev2 = reversalService.reversePayment(inv.getId(), payment.getId(), revReq2);
        assertEquals(new BigDecimal("40000.00"), rev2.getAmount());
        assertEquals(new BigDecimal("100000.00"), rev2.getInvoiceOutstanding());
        assertEquals(0, BigDecimal.ZERO.compareTo(rev2.getInvoiceAmountPaid()));
        assertEquals("Unpaid", rev2.getInvoiceStatus());

        // 3. Excess Reversal on now-exhausted payment should be rejected
        CreatePaymentReversalRequest excessRev = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("5000.00"))
                .reason("Attempt excess reversal")
                .build();

        assertThrows(BusinessValidationException.class, () ->
                reversalService.reversePayment(inv.getId(), payment.getId(), excessRev));

        // Cleanup
        paymentReversalRepository.deleteAll(paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(inv.getId()));
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(inv.getId()));
        invoiceRepository.deleteById(inv.getId());
    }

    @Test
    @DisplayName("3.2 Idempotency: Repeated key returns original reversal, mismatched payload throws Conflict")
    void testReversalIdempotencySafety() {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Idempotency Corp " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse inv = collectionsService.createInvoice(invReq);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("20000.00"));
        payReq.setReferenceId("TXN-PAY-IDEMP-" + runId);
        PaymentRecordResponse payment = collectionsService.recordPayment(inv.getId(), payReq);

        String idempKey = "IDEMP-MATCH-" + runId;
        String refId = "TXN-REV-IDEMP-" + runId;
        CreatePaymentReversalRequest revReq = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("5000.00"))
                .reason("Idempotency test")
                .referenceId(refId)
                .idempotencyKey(idempKey)
                .createdBy("IdempTester")
                .build();

        // First attempt
        PaymentReversalResponse first = reversalService.reversePayment(inv.getId(), payment.getId(), revReq);
        assertNotNull(first.getId());

        // Repeat identical request: should return exact same reversal safely
        PaymentReversalResponse repeat = reversalService.reversePayment(inv.getId(), payment.getId(), revReq);
        assertEquals(first.getId(), repeat.getId());
        assertEquals(first.getAmount(), repeat.getAmount());

        // Repeated request with mismatched amount: should throw ConflictException (HTTP 409)
        CreatePaymentReversalRequest mismatchedAmountReq = CreatePaymentReversalRequest.builder()
                .reversalAmount(new BigDecimal("9999.00")) // Different amount!
                .reason("Idempotency test mismatch")
                .referenceId(refId)
                .idempotencyKey(idempKey)
                .build();

        assertThrows(ConflictException.class, () ->
                reversalService.reversePayment(inv.getId(), payment.getId(), mismatchedAmountReq));

        // Cleanup
        paymentReversalRepository.deleteAll(paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(inv.getId()));
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(inv.getId()));
        invoiceRepository.deleteById(inv.getId());
    }

    // =========================================================================
    // 4. SHARED STATUS CALCULATIONS
    // =========================================================================

    @Test
    @DisplayName("4.1 Calculation Service evaluates unified statuses correctly")
    void testCalculationServicePrecedence() {
        // 1. Fully Paid
        CollectionInvoiceEntity paidEntity = CollectionInvoiceEntity.builder()
                .invoiceAmount(new BigDecimal("50000.00"))
                .amountPaid(new BigDecimal("50000.00"))
                .outstanding(BigDecimal.ZERO)
                .dueDate(LocalDate.of(2025, 2, 1))
                .build();
        calculationService.applyUnifiedStatus(paidEntity);
        assertEquals("Paid", paidEntity.getInvoiceStatus());
        assertEquals("Completed", paidEntity.getCollectionStatus());
        assertEquals("Paid", paidEntity.getStatus());
        assertNull(paidEntity.getDaysOverdue());
        assertEquals("Current", paidEntity.getAgeingBucket());

        // 2. Overdue with balance
        CollectionInvoiceEntity overdueEntity = CollectionInvoiceEntity.builder()
                .invoiceAmount(new BigDecimal("50000.00"))
                .amountPaid(new BigDecimal("10000.00"))
                .outstanding(new BigDecimal("40000.00"))
                .dueDate(LocalDate.of(2025, 2, 1))
                .build();
        calculationService.applyUnifiedStatus(overdueEntity);
        assertEquals("Partially Paid", overdueEntity.getInvoiceStatus());
        assertEquals("Follow Up", overdueEntity.getCollectionStatus());
        assertEquals("Overdue", overdueEntity.getStatus());
        assertNotNull(overdueEntity.getDaysOverdue());
        assertTrue(overdueEntity.getDaysOverdue() > 0);

        // 3. Due date change shifts status
        overdueEntity.setDueDate(LocalDate.of(2025, 4, 15)); // Not overdue against baseline 2025-03-21
        calculationService.applyUnifiedStatus(overdueEntity);
        assertEquals("Partially Paid", overdueEntity.getInvoiceStatus());
        assertEquals("In Progress", overdueEntity.getCollectionStatus());
    }

    // =========================================================================
    // 5. FINANCE INVOICE KPIS
    // =========================================================================

    @Test
    @DisplayName("5.1 Finance Invoice KPIs are computed consistently")
    void testFinanceInvoiceKpis() {
        FinanceInvoiceKpiResponse kpis = collectionsService.getFinanceInvoiceKpis();
        assertNotNull(kpis);
        assertTrue(kpis.getTotalInvoices() > 0);
        assertNotNull(kpis.getTotalInvoiceValue());
        assertNotNull(kpis.getPaidAmount());
        assertNotNull(kpis.getOutstandingAmount());
        assertEquals(kpis.getTotalInvoiceValue(), kpis.getPaidAmount().add(kpis.getOutstandingAmount()));
    }
}
