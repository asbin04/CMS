package com.company.project.finance.repository;

import com.company.project.finance.entity.FinancePaymentCounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FinancePaymentCounterRepository extends JpaRepository<FinancePaymentCounterEntity, String> {
}

