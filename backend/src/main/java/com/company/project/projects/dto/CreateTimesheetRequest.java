package com.company.project.projects.dto;

import jakarta.validation.constraints.*;
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
public class CreateTimesheetRequest {

    private LocalDate timesheetDate;
    private String date; // Accepts date string or timesheetDate

    @NotBlank(message = "employeeId is required")
    private String employeeId;

    private String employeeName;

    @NotBlank(message = "projectId is required")
    private String projectId;

    @NotBlank(message = "taskId is required")
    private String taskId;

    @DecimalMin(value = "0.25", message = "Hours must be at least 0.25")
    @DecimalMax(value = "24.00", message = "Hours cannot exceed 24.00")
    @com.fasterxml.jackson.annotation.JsonAlias({"hoursWorked", "hoursSpent"})
    private BigDecimal hours;

    private BigDecimal hoursSpent;
    private BigDecimal hoursWorked;

    private Boolean isBillable;
    private String billable; // "Yes" / "No"

    @DecimalMin(value = "0.00", message = "Billable rate must be non-negative")
    @com.fasterxml.jackson.annotation.JsonAlias({"hourlyRate"})
    private BigDecimal billableRate;
    private BigDecimal hourlyRate;

    private String notes;
    private String taskDescription;

    private String approvalStatus;
    private Boolean draft;

    @com.fasterxml.jackson.annotation.JsonAlias({"assigned_approver", "approver", "intendedApprover"})
    private String assignedApprover;

    @com.fasterxml.jackson.annotation.JsonAlias({"approved_by"})
    private String approvedBy;

    private BigDecimal laborCostOverride;
    private String overrideReason;

    public BigDecimal getHours() {
        if (hours != null) return hours;
        if (hoursSpent != null) return hoursSpent;
        return hoursWorked;
    }

    public BigDecimal getHoursSpent() {
        return getHours();
    }

    public BigDecimal getBillableRate() {
        if (billableRate != null) return billableRate;
        return hourlyRate;
    }

    public BigDecimal getHourlyRate() {
        return getBillableRate();
    }

    public String getTaskDescription() {
        return taskDescription != null ? taskDescription : notes;
    }
}
