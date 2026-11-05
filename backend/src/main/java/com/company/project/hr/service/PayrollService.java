package com.company.project.hr.service;

import com.company.project.common.response.PageResponse;
import com.company.project.hr.dto.*;

import java.util.List;

public interface PayrollService {

    PageResponse<PayrollRecordDto> getPayrollRecords(
            String search,
            String payrollMonth,
            String employmentType,
            String status,
            String employee,
            String sort,
            int page,
            int size
    );

    List<PayrollRecordDto> getAllFilteredPayrollRecords(
            String search,
            String payrollMonth,
            String employmentType,
            String status,
            String employee,
            String sort
    );

    PayrollRecordDto getPayrollRecordById(String payrollId);

    PayrollRecordDto processPayroll(ProcessPayrollRequest request);

    PayrollRecordDto updatePayrollRecord(String payrollId, UpdatePayrollRequest request);

    void deletePayrollRecord(String payrollId);

    PayrollKpiResponse getKpis(String month);

    PayrollFilterOptionsResponse getFilterOptions();
}

