package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionPaymentEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionPaymentRepository extends JpaRepository<CollectionPaymentEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM CollectionPaymentEntity p WHERE p.id = :id")
    Optional<CollectionPaymentEntity> findByIdWithLock(@Param("id") String id);

    @Query("SELECT p FROM CollectionPaymentEntity p WHERE p.invoice.id = :invoiceId AND UPPER(TRIM(p.referenceId)) = UPPER(TRIM(:referenceId))")
    Optional<CollectionPaymentEntity> findByInvoiceIdAndNormalizedReference(@Param("invoiceId") String invoiceId, @Param("referenceId") String referenceId);

    boolean existsByInvoice_Id(String invoiceId);

    List<CollectionPaymentEntity> findByInvoice_IdOrderByPaymentDateDesc(String invoiceId);

    @Query("SELECT p FROM CollectionPaymentEntity p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<CollectionPaymentEntity> findPaymentsInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM CollectionPaymentEntity p")
    BigDecimal sumTotalPayments();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM CollectionPaymentEntity p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPaymentsInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT p.invoice.id, COALESCE(SUM(p.amount), 0) FROM CollectionPaymentEntity p WHERE p.paymentDate <= :asOfDate GROUP BY p.invoice.id")
    List<Object[]> sumPaymentsByInvoiceOnOrBefore(@Param("asOfDate") LocalDate asOfDate);
}
