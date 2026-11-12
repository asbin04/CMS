package com.company.project.finance.repository;

import com.company.project.finance.entity.FinanceCashFlowCounterEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface FinanceCashFlowCounterRepository extends JpaRepository<FinanceCashFlowCounterEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM FinanceCashFlowCounterEntity c WHERE c.periodYear = :periodYear")
    Optional<FinanceCashFlowCounterEntity> findByPeriodYearForUpdate(@Param("periodYear") String periodYear);
}

