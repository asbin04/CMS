package com.company.project.finance.service;

import com.company.project.finance.entity.FinancePaymentCounterEntity;
import com.company.project.finance.repository.FinancePaymentCounterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class FinancePaymentIdGeneratorService {

    private final FinancePaymentCounterRepository counterRepository;

    @Transactional
    public synchronized String generateNextPaymentId(LocalDate date) {
        String yearMonth = (date != null ? date : LocalDate.now()).format(DateTimeFormatter.ofPattern("yyyyMM"));
        
        FinancePaymentCounterEntity counter = counterRepository.findById(yearMonth)
                .orElseGet(() -> FinancePaymentCounterEntity.builder()
                        .yearMonth(yearMonth)
                        .lastNumber(0)
                        .build());

        int nextNumber = counter.getLastNumber() + 1;
        counter.setLastNumber(nextNumber);
        counterRepository.save(counter);

        return String.format("PAY-%s-%03d", yearMonth, nextNumber);
    }
}

