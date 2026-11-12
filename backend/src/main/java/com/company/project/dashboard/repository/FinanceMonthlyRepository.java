package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.FinanceMonthly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FinanceMonthlyRepository extends JpaRepository<FinanceMonthly, Long> {
    List<FinanceMonthly> findAllByOrderBySortOrderAsc();
}

