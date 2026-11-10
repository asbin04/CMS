package com.company.project.finance.dto;

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
public class ExpenseDto {
    private Long id;
    private String expenseCode;
    private LocalDate expenseDate;
    private String category;
    private String vendorId;
    private String projectId;
    private String employeeId;
    private String description;
    private BigDecimal amountBeforeTax;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String paymentMode;
    private String status;
    private String approvedBy;
    private String monthLabel;
    private String expenseBucket;
    private boolean isProjectExpense;
    private String projectLabel;
    private String createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

