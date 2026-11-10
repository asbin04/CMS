package com.company.project.finance.service;

import com.company.project.finance.entity.FinanceCashFlowCounterEntity;
import com.company.project.finance.repository.FinanceCashFlowCounterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class FinanceCashFlowIdGeneratorService {

    private final FinanceCashFlowCounterRepository counterRepository;

    /**
     * Atomically increment and return the next formatted Cash Flow ID (e.g., 'CF-2026-001').
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public synchronized String generateNextCashFlowId(String year) {
        String effectiveYear = (year != null && !year.isBlank()) ? year.trim() : String.valueOf(LocalDate.now().getYear());

        FinanceCashFlowCounterEntity counter = counterRepository.findByPeriodYearForUpdate(effectiveYear)
                .orElseGet(() -> FinanceCashFlowCounterEntity.builder()
                        .periodYear(effectiveYear)
                        .lastNumber(0)
                        .build());

        int nextNumber = (counter.getLastNumber() != null ? counter.getLastNumber() : 0) + 1;
        counter.setLastNumber(nextNumber);
        counterRepository.saveAndFlush(counter);

        String generatedId = String.format("CF-%s-%03d", effectiveYear, nextNumber);
        log.info("Generated new atomic Cash Flow ID: {}", generatedId);
        return generatedId;
    }

    /**
     * Preview the next Cash Flow ID without incrementing or locking the counter.
     */
    @Transactional(readOnly = true)
    public String peekNextCashFlowId(String year) {
        String effectiveYear = (year != null && !year.isBlank()) ? year.trim() : String.valueOf(LocalDate.now().getYear());

        int nextNumber = counterRepository.findById(effectiveYear)
                .map(c -> (c.getLastNumber() != null ? c.getLastNumber() : 0) + 1)
                .orElse(1);

        return String.format("CF-%s-%03d", effectiveYear, nextNumber);
    }
}

