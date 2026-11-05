package com.company.project.hr.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPayrollRequest {

    @NotBlank(message = "Payroll month is required (e.g. Oct 2026)")
    private String payrollMonth;

    @NotBlank(message = "Employee ID is required")
    private String employeeId;

    @NotBlank(message = "Employee name is required")
    private String employeeName;

    @NotBlank(message = "Employment type is required")
    private String employmentType;

    @NotNull(message = "Monthly CTC is required")
    private BigDecimal monthlyCtc;

    private Integer workingDays;
    private Integer paidDays;
    private Integer lopDays;

    private BigDecimal basicPay;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal deductions;

    private String paymentStatus;
    private LocalDate paymentDate;
    private String paymentMode;
    private String bankName;
    private String bankAccount;
    private String panNumber;
    private String notes;
}

