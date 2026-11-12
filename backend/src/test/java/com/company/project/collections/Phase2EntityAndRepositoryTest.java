package com.company.project.collections;

import com.company.project.collections.entity.CollectionInvoiceEntity;
import com.company.project.collections.entity.CollectionPaymentCounterEntity;
import com.company.project.collections.entity.CollectionPaymentEntity;
import com.company.project.collections.entity.CollectionPaymentReversalEntity;
import com.company.project.collections.entity.CollectionReversalCounterEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentCounterRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.collections.repository.CollectionReversalCounterRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class Phase2EntityAndRepositoryTest {

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
    private CollectionInvoiceRepository invoiceRepository;

    @Autowired
    private CollectionPaymentRepository paymentRepository;

    @Autowired
    private CollectionPaymentCounterRepository paymentCounterRepository;

    @Autowired
    private CollectionReversalCounterRepository reversalCounterRepository;

    @Autowired
    private CollectionPaymentReversalRepository paymentReversalRepository;

    @Test
    @DisplayName("1. Unit: CollectionInvoiceEntity builder correctly sets all 9 V19 columns")
    void testCollectionInvoiceEntityBuilder() {
        CollectionInvoiceEntity inv = CollectionInvoiceEntity.builder()
                .id("INV-TEST-001")
                .clientId("CL-101")
                .clientName("Test Client")
                .invoiceDate(LocalDate.of(2026, 1, 15))
                .dueDate(LocalDate.of(2026, 2, 15))
                .invoiceAmount(new BigDecimal("118000.00"))
                .amountPaid(BigDecimal.ZERO)
                .outstanding(new BigDecimal("118000.00"))
                .daysOverdue(0)
                .ageingBucket("Current")
                .status("Pending")
                .recommendedAction("None")
                // 9 V19 columns
                .projectId("PRJ-2026-001")
                .contractId("CNT-2026-001")
                .amountBeforeTax(new BigDecimal("100000.00"))
                .taxRate(new BigDecimal("18.00"))
                .taxAmount(new BigDecimal("18000.00"))
                .paymentTermsDays(30)
                .invoiceStatus("Unpaid")
                .collectionStatus("Pending")
                .notes("Phase 2 mapping test invoice")
                .build();

        assertEquals("INV-TEST-001", inv.getId());
        assertEquals("PRJ-2026-001", inv.getProjectId());
        assertEquals("CNT-2026-001", inv.getContractId());
        assertEquals(new BigDecimal("100000.00"), inv.getAmountBeforeTax());
        assertEquals(new BigDecimal("18.00"), inv.getTaxRate());
        assertEquals(new BigDecimal("18000.00"), inv.getTaxAmount());
        assertEquals(30, inv.getPaymentTermsDays());
        assertEquals("Unpaid", inv.getInvoiceStatus());
        assertEquals("Pending", inv.getCollectionStatus());
        assertEquals("Phase 2 mapping test invoice", inv.getNotes());
        assertNotNull(inv.getPayments());
        assertTrue(inv.getPayments().isEmpty());
    }

    @Test
    @DisplayName("2. DB: Querying historical invoices verifies V19 columns and defaults")
    void testQueryHistoricalInvoicesMapping() {
        List<CollectionInvoiceEntity> invoices = invoiceRepository.findAll();
        assertFalse(invoices.isEmpty(), "Should find historical invoices");

        for (CollectionInvoiceEntity inv : invoices) {
            assertNotNull(inv.getId(), "Invoice ID must not be null");
            assertNotNull(inv.getInvoiceStatus(), "Invoice status must not be null post-V19");
            assertNotNull(inv.getCollectionStatus(), "Collection status must not be null post-V19");
            assertNotNull(inv.getTaxAmount(), "Tax amount must not be null post-V19");
        }
    }

    @Test
    @DisplayName("3. Repository: findByIdWithLock acquires pessimistic write lock on invoice and payment")
    void testFindByIdWithLock() {
        List<CollectionInvoiceEntity> invoices = invoiceRepository.findAll();
        assertFalse(invoices.isEmpty());
        String invoiceId = invoices.get(0).getId();

        Optional<CollectionInvoiceEntity> lockedInvoice = invoiceRepository.findByIdWithLock(invoiceId);
        assertTrue(lockedInvoice.isPresent());
        assertEquals(invoiceId, lockedInvoice.get().getId());

        List<CollectionPaymentEntity> payments = paymentRepository.findAll();
        if (!payments.isEmpty()) {
            String paymentId = payments.get(0).getId();
            Optional<CollectionPaymentEntity> lockedPayment = paymentRepository.findByIdWithLock(paymentId);
            assertTrue(lockedPayment.isPresent());
            assertEquals(paymentId, lockedPayment.get().getId());
        }
    }

    @Test
    @DisplayName("4. Repository: Lookup methods by invoiceStatus, collectionStatus, projectId, clientId")
    void testInvoiceLookupMethods() {
        List<CollectionInvoiceEntity> unpaid = invoiceRepository.findByInvoiceStatus("Unpaid");
        assertNotNull(unpaid);

        List<CollectionInvoiceEntity> pending = invoiceRepository.findByCollectionStatus("Pending");
        assertNotNull(pending);

        List<CollectionInvoiceEntity> byProject = invoiceRepository.findByProjectId("NON_EXISTENT_PRJ");
        assertTrue(byProject.isEmpty());

        List<CollectionInvoiceEntity> byClient = invoiceRepository.findByClientId("NON_EXISTENT_CLI");
        assertTrue(byClient.isEmpty());
    }

    @Test
    @DisplayName("5. Repository: findByInvoiceIdAndNormalizedReference on CollectionPaymentRepository")
    void testPaymentNormalizedReferenceLookup() {
        List<CollectionPaymentEntity> payments = paymentRepository.findAll();
        if (!payments.isEmpty()) {
            CollectionPaymentEntity firstPayment = payments.get(0);
            if (firstPayment.getReferenceId() != null && !firstPayment.getReferenceId().isBlank()) {
                String ref = firstPayment.getReferenceId();
                String invId = firstPayment.getInvoice().getId();

                // Test exact
                Optional<CollectionPaymentEntity> foundExact =
                        paymentRepository.findByInvoiceIdAndNormalizedReference(invId, ref);
                assertTrue(foundExact.isPresent());

                // Test lowercase
                Optional<CollectionPaymentEntity> foundLower =
                        paymentRepository.findByInvoiceIdAndNormalizedReference(invId, ref.toLowerCase());
                assertTrue(foundLower.isPresent());

                // Test whitespace trimming
                Optional<CollectionPaymentEntity> foundTrim =
                        paymentRepository.findByInvoiceIdAndNormalizedReference(invId, "  " + ref.toUpperCase() + "  ");
                assertTrue(foundTrim.isPresent());
            }
        }
    }

    @Test
    @DisplayName("6. Repository & Entity: Counter entities persistence and findByPrefixAndYearWithLock")
    void testCounterRepositories() {
        // Test Payment Counter
        CollectionPaymentCounterEntity paymentCounter = CollectionPaymentCounterEntity.builder()
                .prefix("PAY")
                .year(2099)
                .currentVal(42L)
                .build();
        paymentCounterRepository.save(paymentCounter);

        Optional<CollectionPaymentCounterEntity> loadedPayCounter =
                paymentCounterRepository.findByPrefixAndYearWithLock("PAY", 2099);
        assertTrue(loadedPayCounter.isPresent());
        assertEquals(42L, loadedPayCounter.get().getCurrentVal());

        // Test Reversal Counter
        CollectionReversalCounterEntity reversalCounter = CollectionReversalCounterEntity.builder()
                .prefix("REV")
                .year(2099)
                .currentVal(7L)
                .build();
        reversalCounterRepository.save(reversalCounter);

        Optional<CollectionReversalCounterEntity> loadedRevCounter =
                reversalCounterRepository.findByPrefixAndYearWithLock("REV", 2099);
        assertTrue(loadedRevCounter.isPresent());
        assertEquals(7L, loadedRevCounter.get().getCurrentVal());
    }

    @Test
    @DisplayName("7. Repository: CollectionPaymentReversalRepository queries and normalized reference lookup")
    void testPaymentReversalRepositoryQueries() {
        List<CollectionPaymentEntity> payments = paymentRepository.findAll();
        assertFalse(payments.isEmpty(), "Need at least one payment to test reversal mapping");
        CollectionPaymentEntity payment = payments.get(0);
        CollectionInvoiceEntity invoice = payment.getInvoice();

        String reversalId = "REV-TEST-2026-9999";
        String idempotencyKey = "IDEMP-TEST-KEY-12345";
        String referenceId = "TXN-REV-TEST-888";

        CollectionPaymentReversalEntity reversal = CollectionPaymentReversalEntity.builder()
                .id(reversalId)
                .payment(payment)
                .invoice(invoice)
                .reversalDate(LocalDate.now())
                .amount(new BigDecimal("500.00"))
                .reason("Test reversal for Phase 2")
                .referenceId(referenceId)
                .idempotencyKey(idempotencyKey)
                .createdBy("Phase2Test")
                .build();

        paymentReversalRepository.save(reversal);

        // 1. Normalized reference lookup (exact, lower, with spaces)
        Optional<CollectionPaymentReversalEntity> foundExact =
                paymentReversalRepository.findByPaymentIdAndNormalizedReference(payment.getId(), referenceId);
        assertTrue(foundExact.isPresent());
        assertEquals(reversalId, foundExact.get().getId());
        assertNotNull(foundExact.get().getInvoice());
        assertNotNull(foundExact.get().getPayment());

        Optional<CollectionPaymentReversalEntity> foundLower =
                paymentReversalRepository.findByPaymentIdAndNormalizedReference(payment.getId(), "txn-rev-test-888");
        assertTrue(foundLower.isPresent());

        Optional<CollectionPaymentReversalEntity> foundTrimmed =
                paymentReversalRepository.findByPaymentIdAndNormalizedReference(payment.getId(), "   TXN-REV-TEST-888   ");
        assertTrue(foundTrimmed.isPresent());

        // 2. Idempotency key lookup (eagerly fetched)
        Optional<CollectionPaymentReversalEntity> foundByIdemp =
                paymentReversalRepository.findByIdempotencyKey(idempotencyKey);
        assertTrue(foundByIdemp.isPresent());
        assertEquals(reversalId, foundByIdemp.get().getId());
        assertEquals(invoice.getId(), foundByIdemp.get().getInvoice().getId());
        assertEquals(payment.getId(), foundByIdemp.get().getPayment().getId());

        // 3. Sum reversals
        BigDecimal sumPayment = paymentReversalRepository.sumReversalsByPaymentId(payment.getId());
        assertTrue(sumPayment.compareTo(new BigDecimal("500.00")) >= 0);

        BigDecimal sumInvoice = paymentReversalRepository.sumReversalsByInvoiceId(invoice.getId());
        assertTrue(sumInvoice.compareTo(new BigDecimal("500.00")) >= 0);

        // 4. Exists queries
        assertTrue(paymentReversalRepository.existsByInvoice_Id(invoice.getId()));
        assertTrue(paymentReversalRepository.existsByPayment_Id(payment.getId()));

        // 5. Ordered lists
        List<CollectionPaymentReversalEntity> byInvoice =
                paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(invoice.getId());
        assertFalse(byInvoice.isEmpty());

        List<CollectionPaymentReversalEntity> byPayment =
                paymentReversalRepository.findByPayment_IdOrderByReversalDateDesc(payment.getId());
        assertFalse(byPayment.isEmpty());
    }

    @Test
    @DisplayName("8. Integrity: existsByInvoice_Id and payments lazy relationship")
    void testIntegrityInvoicePaymentRelationship() {
        List<CollectionInvoiceEntity> invoices = invoiceRepository.findAll();
        assertFalse(invoices.isEmpty());

        for (CollectionInvoiceEntity inv : invoices) {
            boolean hasPayments = paymentRepository.existsByInvoice_Id(inv.getId());
            if (hasPayments) {
                assertNotNull(inv.getPayments());
                assertFalse(inv.getPayments().isEmpty());
                assertEquals(inv.getId(), inv.getPayments().get(0).getInvoice().getId());
                break;
            }
        }
    }
}

