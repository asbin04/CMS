package com.company.project.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRecordDto {
    private Long id;
    private String payrollId;
    private String payrollMonth;
    private String employeeId;
    private String employeeName;
    private String employmentType;
    private BigDecimal monthlyCtc;
    private Integer workingDays;
    private Integer paidDays;
    private Integer lopDays;
    private BigDecimal basicPay;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal grossSalary;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private String paymentStatus;
    private LocalDate paymentDate;
    private String paymentMode;
    private String bankName;
    private String bankAccount;
    private String panNumber;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

