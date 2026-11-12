package com.company.project.finance.service;

import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.collections.repository.CollectionPaymentRepository;
import com.company.project.common.exception.BusinessValidationException;
import com.company.project.finance.dto.FinanceDashboardResponse;
import com.company.project.finance.dto.FinancePeriod;
import com.company.project.finance.dto.ReceivablesAgeingBucketDto;
import com.company.project.finance.entity.FinanceTargetEntity;
import com.company.project.finance.repository.ExpenseRepository;
import com.company.project.finance.repository.FinanceTargetRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FinanceServiceImplTest {

    @Mock
    private CollectionInvoiceRepository invoiceRepository;

    @Mock
    private CollectionPaymentRepository paymentRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private FinanceTargetRepository financeTargetRepository;

    @Mock
    private ReceivablesCalculationService receivablesCalculationService;

    @Mock
    private FinanceTargetEvaluator targetEvaluator;

    @InjectMocks
    private FinanceServiceImpl financeService;

    @Test
    @DisplayName("Should resolve THIS_FISCAL_YEAR bounds correctly (April to March)")
    void testResolveFiscalYearBounds() {
        FinanceServiceImpl.PeriodBounds bounds = financeService.resolvePeriodBounds(
                FinancePeriod.THIS_FISCAL_YEAR, null, null);
        assertNotNull(bounds);
        assertEquals(4, bounds.start().getMonthValue());
        assertEquals(1, bounds.start().getDayOfMonth());
        assertEquals(3, bounds.end().getMonthValue());
        assertEquals(31, bounds.end().getDayOfMonth());
        assertEquals(12, bounds.monthsCount());
    }

    @Test
    @DisplayName("Should reject CUSTOM period when dates are missing or invalid")
    void testCustomPeriodValidation() {
        assertThrows(BusinessValidationException.class, () ->
                financeService.resolvePeriodBounds(FinancePeriod.CUSTOM, null, null));

        assertThrows(BusinessValidationException.class, () ->
                financeService.resolvePeriodBounds(FinancePeriod.CUSTOM,
                        LocalDate.of(2025, 5, 1), LocalDate.of(2025, 4, 1)));
    }

    @Test
    @DisplayName("Should assemble dashboard data and calculate operating cash and collection rate correctly")
    void testGetDashboardCalculation() {
        when(invoiceRepository.sumInvoiceAmountInPeriod(any(), any())).thenReturn(BigDecimal.valueOf(1000000));
        when(paymentRepository.sumPaymentsInPeriod(any(), any())).thenReturn(BigDecimal.valueOf(500000));
        when(expenseRepository.sumTotalExpensesInPeriod(any(), any())).thenReturn(BigDecimal.valueOf(300000));
        when(expenseRepository.sumProjectExpensesInPeriod(any(), any())).thenReturn(BigDecimal.valueOf(100000));

        ReceivablesCalculationService.ReceivablesComputationResult receivables =
                ReceivablesCalculationService.ReceivablesComputationResult.builder()
                        .totalOutstanding(BigDecimal.valueOf(500000))
                        .currentReceivables(BigDecimal.valueOf(200000))
                        .hasReceivablesData(true)
                        .ageingBuckets(List.of(
                                ReceivablesAgeingBucketDto.builder()
                                        .bucketKey("current")
                                        .label("Current")
                                        .amount(BigDecimal.valueOf(200000))
                                        .percentage(40)
                                        .count(2)
                                        .build()
                        ))
                        .build();

        when(receivablesCalculationService.computeReceivablesAsOf(any())).thenReturn(receivables);
        when(financeTargetRepository.findAll()).thenReturn(List.of(
                FinanceTargetEntity.builder()
                        .metricKey("invoice_value")
                        .targetValue(BigDecimal.valueOf(100000))
                        .basis("MONTHLY")
                        .comparisonDirection("HIGHER_IS_BETTER")
                        .build()
        ));
        when(targetEvaluator.evaluate(any(), any(), anyInt())).thenReturn(
                new FinanceTargetEvaluator.TargetEvaluation(BigDecimal.valueOf(1200000), "On Track")
        );

        FinanceDashboardResponse dashboard = financeService.getDashboard(
                FinancePeriod.THIS_FISCAL_YEAR, null, null, LocalDate.of(2025, 3, 31));

        assertNotNull(dashboard);
        assertEquals(0, new BigDecimal("1000000.00").compareTo(dashboard.getKpis().getInvoiceValue().getRawValue()));
        assertEquals(0, new BigDecimal("500000.00").compareTo(dashboard.getKpis().getCollectedPayments().getRawValue()));
        assertEquals(0, new BigDecimal("300000.00").compareTo(dashboard.getKpis().getTotalExpenses().getRawValue()));
        // Operating cash = 500,000 - 300,000 = 200,000
        assertEquals(0, new BigDecimal("200000.00").compareTo(dashboard.getKpis().getOperatingCashResult().getRawValue()));
        // Collection rate = 500,000 / 1,000,000 * 100 = 50.00%
        assertEquals(0, new BigDecimal("50.00").compareTo(dashboard.getKpis().getCollectionRate().getRawValue()));
        assertTrue(dashboard.isHasReceivablesData());
        assertTrue(dashboard.isHasExpensesData());
    }
}
