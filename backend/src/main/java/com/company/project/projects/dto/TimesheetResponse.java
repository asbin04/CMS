package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TimesheetResponse {
    private String timesheetId;
    private LocalDate timesheetDate;
    private String date; // Alias for frontend (YYYY-MM-DD)
    private String employeeId;
    private String employeeName;
    private String projectId;
    private String taskId;
    private String taskName;
    private BigDecimal hours;
    private BigDecimal hoursSpent;
    private Boolean isBillable;
    private String billable; // "Yes" / "No"
    private BigDecimal billableRate;
    private BigDecimal hourlyRate;
    private BigDecimal billableAmount;
    private String approvalStatus;
    private String clientApprovalStatus;
    private String assignedApprover;
    private String approvedBy;
    private OffsetDateTime approvedAt;
    private String rejectionReason;
    private BigDecimal estimatedLaborCost;
    private BigDecimal laborCost;
    private BigDecimal laborCostCalculated;
    private Boolean laborCostOverride;
    private String laborCostOverrideBy;
    private OffsetDateTime laborCostOverrideAt;
    private String laborCostOverrideReason;
    private String notes;
    private String taskDescription;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public BigDecimal getHoursSpent() {
        return hoursSpent != null ? hoursSpent : hours;
    }

    public BigDecimal getLaborCost() {
        return laborCost != null ? laborCost : estimatedLaborCost;
    }

    public String getTaskDescription() {
        return taskDescription != null ? taskDescription : notes;
    }
}
