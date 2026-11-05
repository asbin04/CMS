package com.company.project.hr.dto;

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
public class UpdatePayrollRequest {
    private String paymentStatus;
    private LocalDate paymentDate;
    private Integer workingDays;
    private Integer paidDays;
    private Integer lopDays;
    private BigDecimal monthlyCtc;
    private BigDecimal basicPay;
    private BigDecimal hra;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private String paymentMode;
    private String bankName;
    private String bankAccount;
    private String panNumber;
    private String notes;
}

