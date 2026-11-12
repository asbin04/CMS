package com.company.project.finance.repository;

import com.company.project.finance.entity.FinanceTargetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FinanceTargetRepository extends JpaRepository<FinanceTargetEntity, Long> {
    Optional<FinanceTargetEntity> findByMetricKey(String metricKey);
}

