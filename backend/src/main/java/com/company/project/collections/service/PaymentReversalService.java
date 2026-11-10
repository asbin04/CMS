package com.company.project.collections.service;

import com.company.project.collections.dto.CreatePaymentReversalRequest;
import com.company.project.collections.dto.PaymentReversalResponse;
import com.company.project.collections.entity.CollectionPaymentReversalEntity;
import com.company.project.collections.repository.CollectionPaymentReversalRepository;
import com.company.project.common.exception.ConflictException;
import com.company.project.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReversalService {

    private final PaymentReversalTxWorker txWorker;
    private final CollectionPaymentReversalRepository paymentReversalRepository;
    private final CollectionsCalculationService calculationService;

    public PaymentReversalResponse reversePayment(
            String invoiceId,
            String paymentId,
            CreatePaymentReversalRequest request) {

        String normRef = request.getReferenceId() != null && !request.getReferenceId().isBlank()
                ? request.getReferenceId().trim().toUpperCase()
                : null;
        String idempKey = request.getIdempotencyKey() != null && !request.getIdempotencyKey().isBlank()
                ? request.getIdempotencyKey().trim()
                : null;

        try {
            // Tier 1: Execute inside dedicated REQUIRES_NEW transaction
            PaymentReversalTxWorker.ReversalExecutionResult result =
                    txWorker.executeReversalTransaction(invoiceId, paymentId, request);

            return mapToReversalResponse(result.getEntity());

        } catch (DataIntegrityViolationException dive) {
            log.warn("DataIntegrityViolationException during payment reversal: {}", dive.getMessage());

            // Tier 2: Safe recovery. The worker's transaction has rolled back.
            // Safely query the existing reversal record in a clean read.
            Optional<CollectionPaymentReversalEntity> existing = Optional.empty();

            if (idempKey != null) {
                existing = paymentReversalRepository.findByIdempotencyKey(idempKey);
            }
            if (existing.isEmpty() && normRef != null) {
                existing = paymentReversalRepository.findByPaymentIdAndNormalizedReference(paymentId, normRef);
            }

            if (existing.isPresent()) {
                CollectionPaymentReversalEntity rec = existing.get();
                // Validate all attributes match exactly
                txWorker.validateIdempotentPayload(
                        rec, invoiceId, paymentId, request.getReversalAmount(), normRef, idempKey);

                log.info("Safe recovery: Returning original reversal {} after duplicate constraint error", rec.getId());
                return mapToReversalResponse(rec);
            }

            // Not a duplicate key conflict that can be safely recovered
            throw dive;
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentReversalResponse> getReversalsForInvoice(String invoiceId) {
        return paymentReversalRepository.findByInvoice_IdOrderByReversalDateDesc(invoiceId).stream()
                .map(this::mapToReversalResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentReversalResponse> getReversalsForPayment(String paymentId) {
        return paymentReversalRepository.findByPayment_IdOrderByReversalDateDesc(paymentId).stream()
                .map(this::mapToReversalResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PaymentReversalResponse getReversalById(String id) {
        CollectionPaymentReversalEntity entity = paymentReversalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reversal not found with ID: " + id));
        return mapToReversalResponse(entity);
    }

    private PaymentReversalResponse mapToReversalResponse(CollectionPaymentReversalEntity entity) {
        return PaymentReversalResponse.builder()
                .id(entity.getId())
                .paymentId(entity.getPayment().getId())
                .invoiceId(entity.getInvoice().getId())
                .reversalDate(calculationService.formatDate(entity.getReversalDate()))
                .amount(entity.getAmount())
                .reason(entity.getReason())
                .referenceId(entity.getReferenceId())
                .idempotencyKey(entity.getIdempotencyKey())
                .createdBy(entity.getCreatedBy())
                .createdAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null)
                .invoiceOutstanding(entity.getInvoice().getOutstanding())
                .invoiceAmountPaid(entity.getInvoice().getAmountPaid())
                .invoiceStatus(entity.getInvoice().getInvoiceStatus())
                .collectionStatus(entity.getInvoice().getCollectionStatus())
                .status(entity.getInvoice().getStatus())
                .build();
    }
}

