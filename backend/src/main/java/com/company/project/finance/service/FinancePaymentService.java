package com.company.project.finance.service;

import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface FinancePaymentService {
    PageResponse<FinancePaymentDto> getPayments(
            String search,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String mode,
            String client,
            String month,
            String sort,
            int page,
            int size
    );

    FinancePaymentKpiResponse getKpiSummary(String month);

    FinancePaymentFilterOptionsResponse getFilterOptions();

    FinancePaymentDto getPaymentById(String id);

    FinancePaymentDto recordPayment(RecordPaymentRequest request);

    FinancePaymentDto updatePayment(String id, UpdatePaymentRequest request);

    void deletePayment(String id);

    List<FinancePaymentDto> getAllPaymentsForExport(
            String search,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            String mode,
            String client,
            String month
    );
}

