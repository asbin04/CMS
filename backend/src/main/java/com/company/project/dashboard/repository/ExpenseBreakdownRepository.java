package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.ExpenseBreakdown;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseBreakdownRepository extends JpaRepository<ExpenseBreakdown, Long> {
    List<ExpenseBreakdown> findAllByOrderBySortOrderAsc();
}

