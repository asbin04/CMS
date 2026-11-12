package com.company.project.collections;

import com.company.project.collections.dto.*;
import com.company.project.collections.entity.CollectionPaymentReversalEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.collections.service.CollectionsService;
import com.company.project.collections.service.InvoiceIdGeneratorService;
import com.company.project.collections.service.PaymentReversalService;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class Phase3ConcurrencyVerificationTest {

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
    private InvoiceIdGeneratorService idGeneratorService;

    @Autowired
    private CollectionInvoiceRepository invoiceRepository;

    @Autowired
    private CollectionPaymentRepository paymentRepository;

    @Autowired
    private CollectionPaymentReversalRepository paymentReversalRepository;

    // =========================================================================
    // 1. CONCURRENT PAYMENT REQUESTS
    // =========================================================================

    @Test
    @DisplayName("1.1 Concurrent payments on same invoice: balance never negative, cannot exceed invoice amount")
    void testConcurrentPaymentBalanceIntegrity() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Concurrent Payment Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse invoice = collectionsService.createInvoice(invReq);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);
        List<Throwable> exceptions = Collections.synchronizedList(new ArrayList<>());

        // Thread 1: attempts to pay ₹60,000
        executor.submit(() -> {
            try {
                startLatch.await();
                RecordPaymentRequest req1 = new RecordPaymentRequest();
                req1.setAmount(new BigDecimal("60000.00"));
                req1.setReferenceId("TXN-CONCUR-A-" + runId);
                collectionsService.recordPayment(invoice.getId(), req1);
                successCount.incrementAndGet();
            } catch (BusinessValidationException bve) {
                rejectedCount.incrementAndGet();
            } catch (Throwable t) {
                exceptions.add(t);
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: simultaneously attempts to pay ₹60,000 (total = ₹120,000 > ₹100,000)
        executor.submit(() -> {
            try {
                startLatch.await();
                RecordPaymentRequest req2 = new RecordPaymentRequest();
                req2.setAmount(new BigDecimal("60000.00"));
                req2.setReferenceId("TXN-CONCUR-B-" + runId);
                collectionsService.recordPayment(invoice.getId(), req2);
                successCount.incrementAndGet();
            } catch (BusinessValidationException bve) {
                rejectedCount.incrementAndGet();
            } catch (Throwable t) {
                exceptions.add(t);
            } finally {
                doneLatch.countDown();
            }
        });

        startLatch.countDown();
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS));
        executor.shutdown();

        assertTrue(exceptions.isEmpty(), "Unexpected exceptions: " + exceptions);
        assertEquals(1, successCount.get(), "Exactly one of the concurrent overpaying requests must succeed");
        assertEquals(1, rejectedCount.get(), "The other concurrent request must be rejected for exceeding balance");

        // Verify database balance invariants
        InvoiceResponse updated = collectionsService.getInvoiceById(invoice.getId());
        assertEquals(new BigDecimal("60000.00"), updated.getAmountPaid());
        assertEquals(new BigDecimal("40000.00"), updated.getOutstanding());
        assertTrue(updated.getOutstanding().compareTo(BigDecimal.ZERO) >= 0, "Outstanding balance must NEVER be negative");
        assertEquals(updated.getInvoiceAmount(), updated.getAmountPaid().add(updated.getOutstanding()));

        // Cleanup
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(invoice.getId()));
        invoiceRepository.deleteById(invoice.getId());
    }

    @Test
    @DisplayName("1.2 Concurrent payments with duplicate normalized reference are safely rejected")
    void testConcurrentPaymentDuplicateReference() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Dup Reference Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse invoice = collectionsService.createInvoice(invReq);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        String sharedRef = "TXN-CONCUR-DUP-" + runId;

        // Thread 1: uppercase reference
        executor.submit(() -> {
            try {
                startLatch.await();
                RecordPaymentRequest req1 = new RecordPaymentRequest();
                req1.setAmount(new BigDecimal("20000.00"));
                req1.setReferenceId(sharedRef.toUpperCase());
                collectionsService.recordPayment(invoice.getId(), req1);
                successCount.incrementAndGet();
            } catch (ConflictException ce) {
                conflictCount.incrementAndGet();
            } catch (Exception ignored) {
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: lowercase with whitespace
        executor.submit(() -> {
            try {
                startLatch.await();
                RecordPaymentRequest req2 = new RecordPaymentRequest();
                req2.setAmount(new BigDecimal("20000.00"));
                req2.setReferenceId("   " + sharedRef.toLowerCase() + "   ");
                collectionsService.recordPayment(invoice.getId(), req2);
                successCount.incrementAndGet();
            } catch (ConflictException ce) {
                conflictCount.incrementAndGet();
            } catch (Exception ignored) {
            } finally {
                doneLatch.countDown();
            }
        });

        startLatch.countDown();
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS));
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one payment must succeed");
        assertEquals(1, conflictCount.get(), "The duplicate reference payment must be rejected with ConflictException");

        // Cleanup
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(invoice.getId()));
        invoiceRepository.deleteById(invoice.getId());
    }

    // =========================================================================
    // 2. CONCURRENT PAYMENT ID GENERATION
    // =========================================================================

    @Test
    @DisplayName("2.1 Concurrent payment ID generation produces strictly unique PAY IDs")
    void testConcurrentPaymentIdGeneration() throws Exception {
        int threads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> idGeneratorService.generateAndAllocateNextPaymentId(2026)));
        }

        Set<String> generatedIds = new HashSet<>();
        for (Future<String> future : futures) {
            String payId = future.get(10, TimeUnit.SECONDS);
            assertNotNull(payId);
            assertTrue(payId.startsWith("PAY-2026-"), "Must match format PAY-YYYY-XXX");
            generatedIds.add(payId);
        }
        executor.shutdown();

        assertEquals(threads, generatedIds.size(), "All concurrently generated payment IDs must be strictly unique");
    }

    // =========================================================================
    // 3. CONCURRENT REVERSAL REQUESTS
    // =========================================================================

    @Test
    @DisplayName("3.1 Concurrent reversals on same payment: total reversal never exceeds payment amount")
    void testConcurrentReversalsAmountLimit() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Concurrent Reversal Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .build();
        InvoiceResponse invoice = collectionsService.createInvoice(invReq);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("70000.00"));
        payReq.setReferenceId("TXN-PAY-" + runId);
        PaymentRecordResponse payment = collectionsService.recordPayment(invoice.getId(), payReq);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger rejectedCount = new AtomicInteger(0);

        // Thread 1: attempts to reverse ₹50,000
        executor.submit(() -> {
            try {
                startLatch.await();
                CreatePaymentReversalRequest revReq1 = CreatePaymentReversalRequest.builder()
                        .reversalAmount(new BigDecimal("50000.00"))
                        .reason("Concurrent rev A")
                        .idempotencyKey("IDEMP-REV-A-" + runId)
                        .build();
                reversalService.reversePayment(invoice.getId(), payment.getId(), revReq1);
                successCount.incrementAndGet();
            } catch (BusinessValidationException bve) {
                rejectedCount.incrementAndGet();
            } catch (Exception ignored) {
            } finally {
                doneLatch.countDown();
            }
        });

        // Thread 2: simultaneously attempts to reverse ₹50,000 (total = ₹100,000 > ₹70,000)
        executor.submit(() -> {
            try {
                startLatch.await();
                CreatePaymentReversalRequest revReq2 = CreatePaymentReversalRequest.builder()
                        .reversalAmount(new BigDecimal("50000.00"))
                        .reason("Concurrent rev B")
                        .idempotencyKey("IDEMP-REV-B-" + runId)
                        .build();
                reversalService.reversePayment(invoice.getId(), payment.getId(), revReq2);
                successCount.incrementAndGet();
            } catch (BusinessValidationException bve) {
                rejectedCount.incrementAndGet();
            } catch (Exception ignored) {
            } finally {
                doneLatch.countDown();
            }
        });

        startLatch.countDown();
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS));
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one reversal request must succeed");
        assertEquals(1, rejectedCount.get(), "The other reversal request must be rejected for exceeding reversible balance");

        // Verify balances
        InvoiceResponse updated = collectionsService.getInvoiceById(invoice.getId());
        assertEquals(new BigDecimal("20000.00"), updated.getAmountPaid());
        assertEquals(new BigDecimal("80000.00"), updated.getOutstanding());
        assertEquals(updated.getInvoiceAmount(), updated.getAmountPaid().add(updated.getOutstanding()));

        // Cleanup
        paymentReversalRepository.deleteAll(paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(invoice.getId()));
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(invoice.getId()));
        invoiceRepository.deleteById(invoice.getId());
    }

    @Test
    @DisplayName("3.2 Concurrent reversal requests with identical idempotency key return single reversal without duplicates")
    void testConcurrentReversalsDuplicateIdempotencyKey() throws Exception {
        String runId = UUID.randomUUID().toString().substring(0, 8);
        CreateInvoiceRequest invReq = CreateInvoiceRequest.builder()
                .client("Idemp Concur Client " + runId)
                .invoiceDate("2026-03-01")
                .dueDate("2026-03-31")
                .amountBeforeTax(new BigDecimal("50000.00"))
                .build();
        InvoiceResponse invoice = collectionsService.createInvoice(invReq);

        RecordPaymentRequest payReq = new RecordPaymentRequest();
        payReq.setAmount(new BigDecimal("30000.00"));
        PaymentRecordResponse payment = collectionsService.recordPayment(invoice.getId(), payReq);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threads);

        String sharedIdempKey = "IDEMP-CONCUR-KEY-" + runId;
        List<PaymentReversalResponse> responses = Collections.synchronizedList(new ArrayList<>());
        List<Throwable> errors = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    CreatePaymentReversalRequest req = CreatePaymentReversalRequest.builder()
                            .reversalAmount(new BigDecimal("10000.00"))
                            .reason("Concurrent duplicate request")
                            .referenceId("TXN-REV-DUP-" + runId)
                            .idempotencyKey(sharedIdempKey)
                            .createdBy("ConcurrentRunner")
                            .build();
                    PaymentReversalResponse resp = reversalService.reversePayment(invoice.getId(), payment.getId(), req);
                    responses.add(resp);
                } catch (Throwable t) {
                    errors.add(t);
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(15, TimeUnit.SECONDS));
        executor.shutdown();

        assertTrue(errors.isEmpty(), "Concurrent identical requests must succeed or safely recover: " + errors);
        assertEquals(2, responses.size(), "Both callers must receive a response");

        // Both callers must receive the exact same reversal ID
        assertEquals(responses.get(0).getId(), responses.get(1).getId(), "Both callers must receive identical reversal ID");

        // Exactly 1 reversal record in DB for this idempotency key
        Optional<CollectionPaymentReversalEntity> inDb = paymentReversalRepository.findByIdempotencyKey(sharedIdempKey);
        assertTrue(inDb.isPresent());

        // Balance updated exactly once (₹30,000 - ₹10,000 = ₹20,000 paid)
        InvoiceResponse updated = collectionsService.getInvoiceById(invoice.getId());
        assertEquals(new BigDecimal("20000.00"), updated.getAmountPaid());
        assertEquals(new BigDecimal("30000.00"), updated.getOutstanding());

        // Cleanup
        paymentReversalRepository.deleteAll(paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(invoice.getId()));
        paymentRepository.deleteAll(paymentRepository.findByInvoice_IdOrderByPaymentDateDesc(invoice.getId()));
        invoiceRepository.deleteById(invoice.getId());
    }

    // =========================================================================
    // 4. CONCURRENT REVERSAL ID GENERATION
    // =========================================================================

    @Test
    @DisplayName("4.1 Concurrent reversal ID generation produces strictly unique REV IDs")
    void testConcurrentReversalIdGeneration() throws Exception {
        int threads = 10;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        List<Future<String>> futures = new ArrayList<>();

        for (int i = 0; i < threads; i++) {
            futures.add(executor.submit(() -> idGeneratorService.generateAndAllocateNextReversalId(2026)));
        }

        Set<String> generatedIds = new HashSet<>();
        for (Future<String> future : futures) {
            String revId = future.get(10, TimeUnit.SECONDS);
            assertNotNull(revId);
            assertTrue(revId.startsWith("REV-2026-"), "Must match format REV-YYYY-XXX");
            generatedIds.add(revId);
        }
        executor.shutdown();

        assertEquals(threads, generatedIds.size(), "All concurrently generated reversal IDs must be strictly unique");
    }
}

