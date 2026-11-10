package com.company.project.finance.dto;

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
public class CreateExpenseRequest {
    private String expenseCode;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    @NotBlank(message = "Category is required")
    private String category;

    private String vendorId;
    private String projectId;
    private String employeeId;

    @NotBlank(message = "Description is required")
    private String description;

    private BigDecimal amountBeforeTax;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    // For backwards compatibility with FinanceServiceImpl
    private BigDecimal amount;
    @Builder.Default
    private boolean isProjectExpense = false;
    private String projectLabel;

    private String paymentMode;
    private String status;
    private String approvedBy;
    private String monthLabel;
    private String expenseBucket;

    public String getNormalizedCategory() {
        return category != null ? category.trim() : null;
    }

    public BigDecimal getAmount() {
        if (amount != null) {
            return amount;
        }
        if (totalAmount != null) {
            return totalAmount;
        }
        return amountBeforeTax != null ? amountBeforeTax : BigDecimal.ZERO;
    }

    public boolean isProjectExpense() {
        return isProjectExpense || (projectId != null && !projectId.isBlank());
    }

    public String getProjectLabel() {
        if (projectLabel != null && !projectLabel.isBlank()) {
            return projectLabel;
        }
        return projectId;
    }
}
