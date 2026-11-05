package com.company.project.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollFilterOptionsResponse {
    private List<String> payrollMonths;
    private List<String> employmentTypes;
    private List<String> statuses;
    private List<EmployeeOptionDto> employees;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmployeeOptionDto {
        private String employeeId;
        private String employeeName;
    }
}

