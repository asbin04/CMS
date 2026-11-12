package com.company.project.finance.repository;

import com.company.project.finance.entity.FinancePaymentCounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FinancePaymentCounterRepository extends JpaRepository<FinancePaymentCounterEntity, String> {
}

