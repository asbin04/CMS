package com.company.project.collections.service;

import com.company.project.collections.dto.CreatePaymentReversalRequest;
import com.company.project.collections.entity.CollectionInvoiceEntity;
import com.company.project.collections.entity.CollectionPaymentEntity;
import com.company.project.collections.entity.CollectionPaymentReversalEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.common.exception.ConflictException;
import com.company.project.common.exception.ResourceNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReversalTxWorker {

    public enum ReversalExecutionStatus {
        SUCCESS,
        IDEMPOTENT_RETRY
    }

    @Getter
    @AllArgsConstructor
    public static class ReversalExecutionResult {
        private final ReversalExecutionStatus status;
        private final CollectionPaymentReversalEntity entity;
    }

    private final CollectionInvoiceRepository invoiceRepository;
    private final CollectionPaymentRepository paymentRepository;
    private final CollectionPaymentReversalRepository paymentReversalRepository;
    private final CollectionsCalculationService calculationService;
    private final InvoiceIdGeneratorService idGeneratorService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ReversalExecutionResult executeReversalTransaction(
            String invoiceId,
            String paymentId,
            CreatePaymentReversalRequest request) {

        String normRef = request.getReferenceId() != null && !request.getReferenceId().isBlank()
                ? request.getReferenceId().trim().toUpperCase()
                : null;
        String idempKey = request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()
                ? request.getIdempotencyKey().trim()
                : null;
        BigDecimal reversalAmount = request.getReversalAmount();

        if (reversalAmount == null || reversalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessValidationException("Reversal amount must be greater than zero");
        }

        // 1. Acquire pessimistic write lock on Invoice
        CollectionInvoiceEntity invoice = invoiceRepository.findByIdWithLock(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        // 2. Acquire pessimistic write lock on Payment
        CollectionPaymentEntity payment = paymentRepository.findByIdWithLock(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (!payment.getInvoice().getId().equals(invoice.getId())) {
            throw new BusinessValidationException("Payment " + paymentId + " does not belong to invoice " + invoiceId);
        }

        // 3. Post-Lock Idempotency and Reference Checks
        if (idempKey != null) {
            Optional<CollectionPaymentReversalEntity> byKey = paymentReversalRepository.findByIdempotencyKey(idempKey);
            if (byKey.isPresent()) {
                CollectionPaymentReversalEntity existing = byKey.get();
                validateIdempotentPayload(existing, invoiceId, paymentId, reversalAmount, normRef, idempKey);
                log.info("Post-lock idempotency match for key: {}", idempKey);
                return new ReversalExecutionResult(ReversalExecutionStatus.IDEMPOTENT_RETRY, existing);
            }
        }

        if (normRef != null) {
            Optional<CollectionPaymentReversalEntity> byRef =
                    paymentReversalRepository.findByPaymentIdAndNormalizedReference(paymentId, normRef);
            if (byRef.isPresent()) {
                CollectionPaymentReversalEntity existing = byRef.get();
                validateIdempotentPayload(existing, invoiceId, paymentId, reversalAmount, normRef, idempKey);
                log.info("Post-lock normalized reference match for payment {} ref {}", paymentId, normRef);
                return new ReversalExecutionResult(ReversalExecutionStatus.IDEMPOTENT_RETRY, existing);
            }
        }

        // 4. Financial Reversal Limits Validation
        BigDecimal existingReversalsForPayment = paymentReversalRepository.sumReversalsByPaymentId(paymentId);
        BigDecimal remainingReversibleOnPayment = payment.getAmount().subtract(existingReversalsForPayment);

        if (reversalAmount.compareTo(remainingReversibleOnPayment) > 0) {
            throw new BusinessValidationException(
                    "Reversal amount (" + reversalAmount + ") exceeds payment's remaining reversible balance (" + remainingReversibleOnPayment + ")"
            );
        }

        if (reversalAmount.compareTo(invoice.getAmountPaid()) > 0) {
            throw new BusinessValidationException(
                    "Reversal amount (" + reversalAmount + ") exceeds invoice's current amount paid (" + invoice.getAmountPaid() + ")"
            );
        }

        // 5. Update Invoice Balance Transactionally
        BigDecimal newAmountPaid = invoice.getAmountPaid().subtract(reversalAmount);
        BigDecimal newOutstanding = invoice.getOutstanding().add(reversalAmount);

        if (newAmountPaid.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessValidationException("Invoice amount paid cannot become negative");
        }

        invoice.setAmountPaid(newAmountPaid);
        invoice.setOutstanding(newOutstanding);

        // 6. Status Recalculation
        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setOutstanding(BigDecimal.ZERO);
            invoice.setDaysOverdue(null);
            invoice.setAgeingBucket("Current");
            invoice.setInvoiceStatus("Paid");
            invoice.setCollectionStatus("Completed");
            invoice.setStatus("Paid");
            invoice.setRecommendedAction("Receipt Issued");
        } else {
            calculationService.applyUnifiedStatus(invoice);
        }

        // 7. Atomic Reversal ID Allocation & Audit Entity Persistence
        int targetYear = LocalDate.now().getYear();
        String reversalId = idGeneratorService.generateAndAllocateNextReversalId(targetYear);

        CollectionPaymentReversalEntity reversal = CollectionPaymentReversalEntity.builder()
                .id(reversalId)
                .payment(payment)
                .invoice(invoice)
                .reversalDate(LocalDate.now())
                .amount(reversalAmount)
                .reason(request.getReason() != null ? request.getReason().trim() : "Payment Reversal")
                .referenceId(request.getReferenceId() != null ? request.getReferenceId().trim() : null)
                .idempotencyKey(idempKey)
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy().trim() : "System")
                .build();

        CollectionPaymentReversalEntity savedReversal = paymentReversalRepository.save(reversal);
        invoiceRepository.save(invoice);

        log.info("Successfully executed reversal {} for invoice {} payment {} amount {}",
                reversalId, invoiceId, paymentId, reversalAmount);

        return new ReversalExecutionResult(ReversalExecutionStatus.SUCCESS, savedReversal);
    }

    public void validateIdempotentPayload(
            CollectionPaymentReversalEntity existing,
            String invoiceId,
            String paymentId,
            BigDecimal amount,
            String normalizedRef,
            String idempotencyKey) {

        if (!existing.getInvoice().getId().equals(invoiceId)) {
            throw new ConflictException("Idempotency conflict: existing reversal belongs to invoice " +
                    existing.getInvoice().getId() + " but request specified " + invoiceId);
        }

        if (!existing.getPayment().getId().equals(paymentId)) {
            throw new ConflictException("Idempotency conflict: existing reversal belongs to payment " +
                    existing.getPayment().getId() + " but request specified " + paymentId);
        }

        if (amount != null && existing.getAmount().compareTo(amount) != 0) {
            throw new ConflictException("Idempotency conflict: existing reversal amount (" +
                    existing.getAmount() + ") does not match requested amount (" + amount + ")");
        }

        if (normalizedRef != null && !normalizedRef.isBlank()) {
            String existingRef = existing.getReferenceId() != null ? existing.getReferenceId().trim().toUpperCase() : "";
            if (!existingRef.equals(normalizedRef)) {
                throw new ConflictException("Idempotency conflict: existing reversal reference (" +
                        existingRef + ") does not match requested reference (" + normalizedRef + ")");
            }
        }

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            String existingKey = existing.getIdempotencyKey() != null ? existing.getIdempotencyKey().trim() : "";
            if (!existingKey.isEmpty() && !existingKey.equals(idempotencyKey.trim())) {
                throw new ConflictException("Idempotency conflict: existing reversal idempotency key (" +
                        existingKey + ") does not match requested key (" + idempotencyKey.trim() + ")");
            }
        }
    }
}

