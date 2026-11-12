package com.company.project.finance.repository;

import com.company.project.finance.entity.FinanceCashFlowEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface FinanceCashFlowRepository extends JpaRepository<FinanceCashFlowEntity, Long>, JpaSpecificationExecutor<FinanceCashFlowEntity> {

    Optional<FinanceCashFlowEntity> findByCashFlowId(String cashFlowId);

    Optional<FinanceCashFlowEntity> findByPeriodCode(String periodCode);

    boolean existsByPeriodCode(String periodCode);

    boolean existsByCashFlowId(String cashFlowId);

    /**
     * Retrieve the latest available Cash Flow record ordered chronologically.
     */
    Optional<FinanceCashFlowEntity> findFirstByOrderByPeriodCodeDesc();

    /**
     * Find the record immediately preceding the given periodCode for Opening Cash pre-fill.
     */
    Optional<FinanceCashFlowEntity> findFirstByPeriodCodeLessThanOrderByPeriodCodeDesc(String periodCode);

    /**
     * Fetch top N latest periods (to be reversed chronologically for the trend chart).
     */
    List<FinanceCashFlowEntity> findTop6ByOrderByPeriodCodeDesc();
}

