package com.company.project.finance.service;

import com.company.project.finance.dto.*;

import java.util.List;

public interface ExpenseService {
    List<ExpenseDto> getAllExpenses(String search, String category, String status, String projectId, String month);
    ExpenseKpiResponse getKpis();
    ExpenseFilterOptionsResponse getFilterOptions();
    ExpenseDto getExpenseById(Long id);
    ExpenseDto getExpenseByCode(String code);
    ExpenseDto createExpense(CreateExpenseRequest request);
    ExpenseDto updateExpense(Long id, UpdateExpenseRequest request);
    void deleteExpense(Long id);
}

