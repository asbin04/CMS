package com.company.project.finance;

import com.company.project.finance.dto.*;
import com.company.project.finance.entity.ExpenseEntity;
import com.company.project.finance.repository.ExpenseRepository;
import com.company.project.finance.service.ExpenseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExpenseServiceTest {

    @Mock
    private ExpenseRepository repository;

    @InjectMocks
    private ExpenseServiceImpl service;

    private ExpenseEntity sampleEntity;

    @BeforeEach
    void setUp() {
        sampleEntity = ExpenseEntity.builder()
                .id(1L)
                .expenseCode("EXP-2026-0483")
                .expenseDate(LocalDate.of(2026, 10, 28))
                .category("Software")
                .vendorId("VEN-001")
                .projectId("PRJ-001")
                .employeeId("EMP-014")
                .description("Figma annual license renewal")
                .amountBeforeTax(new BigDecimal("25000.00"))
                .taxAmount(new BigDecimal("4500.00"))
                .totalAmount(new BigDecimal("29500.00"))
                .amount(new BigDecimal("29500.00"))
                .paymentMode("Card")
                .status("Approved")
                .approvedBy("Rohan Verma")
                .monthLabel("Oct 2026")
                .expenseBucket("Operational")
                .isProjectExpense(true)
                .projectLabel("PRJ-001")
                .createdBy("EMP-014")
                .build();
    }

    @Test
    void testGetAllExpensesReturnsMappedDtos() {
        when(repository.searchExpenses(null, null, null, null, null))
                .thenReturn(List.of(sampleEntity));

        List<ExpenseDto> list = service.getAllExpenses(null, null, null, null, null);
        assertThat(list).hasSize(1);
        assertThat(list.get(0).getExpenseCode()).isEqualTo("EXP-2026-0483");
        assertThat(list.get(0).getTotalAmount()).isEqualByComparingTo("29500.00");
        assertThat(list.get(0).getCategory()).isEqualTo("Software");
    }

    @Test
    void testGetKpisCalculatesAccurately() {
        when(repository.sumTotalExpenses()).thenReturn(new BigDecimal("18760.00"));
        when(repository.sumExpensesByStatus("Approved")).thenReturn(new BigDecimal("15760.00"));
        when(repository.sumExpensesByStatus("Pending")).thenReturn(new BigDecimal("23760.00"));
        when(repository.sumExpensesByStatus("Rejected")).thenReturn(new BigDecimal("37950.00"));
        when(repository.sumExpensesByMonth("Oct 2026")).thenReturn(new BigDecimal("37950.00"));
        when(repository.count()).thenReturn(124L);

        ExpenseKpiResponse kpis = service.getKpis();
        assertThat(kpis.getTotalExpenses()).isEqualByComparingTo("18760.00");
        assertThat(kpis.getApprovedExpenses()).isEqualByComparingTo("15760.00");
        assertThat(kpis.getPendingApproval()).isEqualByComparingTo("23760.00");
        assertThat(kpis.getRejectedExpenses()).isEqualByComparingTo("37950.00");
        assertThat(kpis.getThisMonthExpenses()).isEqualByComparingTo("37950.00");
        assertThat(kpis.getTotalCount()).isEqualTo(124L);
    }

    @Test
    void testCreateExpenseSavesCorrectly() {
        CreateExpenseRequest req = CreateExpenseRequest.builder()
                .expenseCode("EXP-2026-0484")
                .expenseDate(LocalDate.of(2026, 10, 29))
                .category("Travel")
                .vendorId("VEN-014")
                .projectId("PRJ-002")
                .employeeId("EMP-009")
                .description("Flight tickets")
                .amountBeforeTax(new BigDecimal("10000.00"))
                .taxAmount(new BigDecimal("1800.00"))
                .totalAmount(new BigDecimal("11800.00"))
                .paymentMode("UPI")
                .status("Pending")
                .expenseBucket("Project")
                .build();

        when(repository.save(any(ExpenseEntity.class))).thenAnswer(invocation -> {
            ExpenseEntity saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        ExpenseDto created = service.createExpense(req);
        assertThat(created.getExpenseCode()).isEqualTo("EXP-2026-0484");
        assertThat(created.getCategory()).isEqualTo("Travel");
        assertThat(created.getTotalAmount()).isEqualByComparingTo("11800.00");
        verify(repository, times(1)).save(any(ExpenseEntity.class));
    }

    @Test
    void testUpdateExpenseModifiesFields() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        when(repository.save(any(ExpenseEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateExpenseRequest updateReq = UpdateExpenseRequest.builder()
                .status("Rejected")
                .approvedBy("Divya Patel")
                .build();

        ExpenseDto updated = service.updateExpense(1L, updateReq);
        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo("Rejected");
        assertThat(updated.getApprovedBy()).isEqualTo("Divya Patel");
    }

    @Test
    void testDeleteExpenseInvokesRepository() {
        service.deleteExpense(1L);
        verify(repository, times(1)).deleteById(1L);
    }
}

