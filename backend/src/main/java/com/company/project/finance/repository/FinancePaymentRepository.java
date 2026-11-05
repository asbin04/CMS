package com.company.project.finance.repository;

import com.company.project.finance.entity.FinancePaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FinancePaymentRepository extends JpaRepository<FinancePaymentEntity, String>, JpaSpecificationExecutor<FinancePaymentEntity> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM FinancePaymentEntity p WHERE p.status IN ('Matched', 'Partially Matched') AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalPaymentsReceivedBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM FinancePaymentEntity p WHERE p.status = 'Pending' AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumPendingPaymentsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM FinancePaymentEntity p WHERE p.status = 'Matched' AND p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumMatchedPaymentsBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.varianceAmount), 0) FROM FinancePaymentEntity p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    BigDecimal sumVarianceAmountBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT MAX(p.updatedAt) FROM FinancePaymentEntity p")
    Instant findLatestUpdatedAt();

    @Query("SELECT DISTINCT p.mode FROM FinancePaymentEntity p ORDER BY p.mode ASC")
    List<String> findDistinctModes();

    @Query("SELECT DISTINCT p.status FROM FinancePaymentEntity p ORDER BY p.status ASC")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT p.clientId, p.clientName FROM FinancePaymentEntity p ORDER BY p.clientName ASC")
    List<Object[]> findDistinctClients();

    @Query("SELECT DISTINCT TO_CHAR(p.paymentDate, 'YYYY-MM') FROM FinancePaymentEntity p ORDER BY 1 DESC")
    List<String> findDistinctMonths();
}

