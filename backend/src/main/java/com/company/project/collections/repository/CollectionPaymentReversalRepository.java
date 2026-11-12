package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionPaymentReversalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CollectionPaymentReversalRepository extends JpaRepository<CollectionPaymentReversalEntity, String> {

    @Query("SELECT r FROM CollectionPaymentReversalEntity r " +
           "JOIN FETCH r.invoice " +
           "JOIN FETCH r.payment " +
           "WHERE r.payment.id = :paymentId AND UPPER(TRIM(r.referenceId)) = UPPER(TRIM(:referenceId))")
    Optional<CollectionPaymentReversalEntity> findByPaymentIdAndNormalizedReference(
            @Param("paymentId") String paymentId,
            @Param("referenceId") String referenceId);

    @Query("SELECT r FROM CollectionPaymentReversalEntity r " +
           "JOIN FETCH r.invoice " +
           "JOIN FETCH r.payment " +
           "WHERE r.idempotencyKey = :idempotencyKey")
    Optional<CollectionPaymentReversalEntity> findByIdempotencyKey(@Param("idempotencyKey") String idempotencyKey);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM CollectionPaymentReversalEntity r WHERE r.payment.id = :paymentId")
    BigDecimal sumReversalsByPaymentId(@Param("paymentId") String paymentId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM CollectionPaymentReversalEntity r WHERE r.invoice.id = :invoiceId")
    BigDecimal sumReversalsByInvoiceId(@Param("invoiceId") String invoiceId);

    List<CollectionPaymentReversalEntity> findByInvoice_IdOrderByReversalDateDesc(String invoiceId);

    List<CollectionPaymentReversalEntity> findByPayment_IdOrderByReversalDateDesc(String paymentId);

    boolean existsByInvoice_Id(String invoiceId);

    boolean existsByPayment_Id(String paymentId);
}

