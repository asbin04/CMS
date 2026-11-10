package com.company.project.projects.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class UpdateTimesheetRequest {

    private LocalDate timesheetDate;
    private String date;

    private String employeeId;
    private String projectId;
    private String taskId;

    @DecimalMin(value = "0.25", message = "Hours must be at least 0.25")
    @DecimalMax(value = "24.00", message = "Hours cannot exceed 24.00")
    private BigDecimal hours;
    private BigDecimal hoursSpent;

    private Boolean isBillable;
    private String billable;

    @DecimalMin(value = "0.00", message = "Billable rate must be non-negative")
    private BigDecimal billableRate;
    private BigDecimal hourlyRate;

    private String notes;
    private String taskDescription;
    private String approvalStatus;

    @com.fasterxml.jackson.annotation.JsonAlias({"assigned_approver", "approver", "intendedApprover"})
    private String assignedApprover;

    @com.fasterxml.jackson.annotation.JsonAlias({"approved_by"})
    private String approvedBy;

    public BigDecimal getHoursSpent() {
        return hoursSpent != null ? hoursSpent : hours;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate != null ? hourlyRate : billableRate;
    }

    public String getTaskDescription() {
        return taskDescription != null ? taskDescription : notes;
    }
}
