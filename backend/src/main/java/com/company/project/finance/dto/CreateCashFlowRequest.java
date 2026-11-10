package com.company.project.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCashFlowRequest {

    /**
     * Optional client-suggested ID; backend validates/generates authoritative atomic ID.
     */
    private String cashFlowId;

    @NotBlank(message = "Period is required (e.g. 'Nov 2026')")
    private String period;

    /**
     * Canonical period code format 'YYYY-MM' (e.g. '2026-11').
     * If omitted, will be derived automatically from 'period'.
     */
    private String periodCode;

    @NotNull(message = "Opening Cash is required")
    @DecimalMin(value = "0.00", message = "Opening Cash must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Opening Cash must have at most 13 integer digits and 2 decimal places")
    private BigDecimal openingCash;

    @NotNull(message = "Collections is required")
    @DecimalMin(value = "0.00", message = "Collections must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Collections must have at most 13 integer digits and 2 decimal places")
    private BigDecimal collections;

    @DecimalMin(value = "0.00", message = "Other Inflows must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Other Inflows must have at most 13 integer digits and 2 decimal places")
    @Builder.Default
    private BigDecimal otherInflows = BigDecimal.ZERO;

    @NotNull(message = "Vendor Payments is required")
    @DecimalMin(value = "0.00", message = "Vendor Payments must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Vendor Payments must have at most 13 integer digits and 2 decimal places")
    private BigDecimal vendorPayments;

    @NotNull(message = "Payroll Payments is required")
    @DecimalMin(value = "0.00", message = "Payroll Payments must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Payroll Payments must have at most 13 integer digits and 2 decimal places")
    private BigDecimal payrollPayments;

    @NotNull(message = "Operating Expenses is required")
    @DecimalMin(value = "0.00", message = "Operating Expenses must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Operating Expenses must have at most 13 integer digits and 2 decimal places")
    private BigDecimal operatingExpenses;

    @DecimalMin(value = "0.00", message = "Other Outflows must not be negative")
    @Digits(integer = 13, fraction = 2, message = "Other Outflows must have at most 13 integer digits and 2 decimal places")
    @Builder.Default
    private BigDecimal otherOutflows = BigDecimal.ZERO;

    @Builder.Default
    private String status = "Pending";

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}

