package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_timesheets", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTimesheetEntity {

    @Id
    @Column(name = "timesheet_id", length = 50, nullable = false)
    private String timesheetId;

    @Column(name = "timesheet_date", nullable = false)
    private LocalDate timesheetDate;

    @Column(name = "employee_id", length = 50, nullable = false)
    private String employeeId;

    @Column(name = "employee_name", length = 255, nullable = false)
    private String employeeName;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "task_id", length = 50, nullable = false)
    private String taskId;

    @Column(name = "hours", precision = 5, scale = 2, nullable = false)
    private BigDecimal hours;

    @Column(name = "is_billable", nullable = false)
    @Builder.Default
    private Boolean isBillable = true;

    @Column(name = "billable_rate", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal billableRate = BigDecimal.ZERO;

    @Column(name = "billable_amount", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal billableAmount = BigDecimal.ZERO;

    @Column(name = "approval_status", length = 50, nullable = false)
    @Builder.Default
    private String approvalStatus = "Pending";

    @Column(name = "assigned_approver", length = 100)
    @Builder.Default
    private String assignedApprover = "Admin – Akshit Ujjain";

    @Column(name = "approved_by", length = 255)
    private String approvedBy;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "estimated_labor_cost", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal estimatedLaborCost = BigDecimal.ZERO;

    @Column(name = "labor_cost_override", nullable = false)
    @Builder.Default
    private Boolean laborCostOverride = false;

    @Column(name = "labor_cost_override_by", length = 100)
    private String laborCostOverrideBy;

    @Column(name = "labor_cost_override_at")
    private OffsetDateTime laborCostOverrideAt;

    @Column(name = "labor_cost_override_reason", columnDefinition = "TEXT")
    private String laborCostOverrideReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Transient
    private BigDecimal laborCostCalculated;

    @Transient
    private String clientApprovalStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Compatibility aliases
    public BigDecimal getHoursSpent() {
        return hours;
    }

    public void setHoursSpent(BigDecimal h) {
        this.hours = h;
    }

    public BigDecimal getHourlyRate() {
        return billableRate;
    }

    public void setHourlyRate(BigDecimal r) {
        this.billableRate = r;
    }

    public String getTaskDescription() {
        return notes;
    }

    public void setTaskDescription(String td) {
        this.notes = td;
    }

    public BigDecimal getLaborCost() {
        return estimatedLaborCost;
    }

    public void setLaborCost(BigDecimal c) {
        this.estimatedLaborCost = c;
    }

    public BigDecimal getLaborCostCalculated() {
        return laborCostCalculated != null ? laborCostCalculated : estimatedLaborCost;
    }

    public void setLaborCostCalculated(BigDecimal c) {
        this.laborCostCalculated = c;
    }

    public String getClientApprovalStatus() {
        return clientApprovalStatus != null ? clientApprovalStatus : "Pending";
    }

    public void setClientApprovalStatus(String s) {
        this.clientApprovalStatus = s;
    }

    public void setLaborCostOverride(BigDecimal overrideVal) {
        this.laborCostOverride = (overrideVal != null && overrideVal.compareTo(BigDecimal.ZERO) > 0);
    }

    public static class ProjectTimesheetEntityBuilder {
        public ProjectTimesheetEntityBuilder hoursSpent(BigDecimal h) {
            return hours(h);
        }

        public ProjectTimesheetEntityBuilder hourlyRate(BigDecimal r) {
            return billableRate(r);
        }

        public ProjectTimesheetEntityBuilder taskDescription(String td) {
            return notes(td);
        }

        public ProjectTimesheetEntityBuilder laborCost(BigDecimal c) {
            return estimatedLaborCost(c);
        }

        public ProjectTimesheetEntityBuilder laborCostOverride(BigDecimal overrideVal) {
            return laborCostOverride(overrideVal != null && overrideVal.compareTo(BigDecimal.ZERO) > 0);
        }

        public ProjectTimesheetEntityBuilder laborCostOverride(Boolean overrideVal) {
            this.laborCostOverride$value = Boolean.TRUE.equals(overrideVal);
            this.laborCostOverride$set = true;
            return this;
        }
    }
}
