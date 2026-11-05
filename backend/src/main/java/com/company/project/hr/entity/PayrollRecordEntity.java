package com.company.project.hr.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "hr_payroll_records", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payroll_id", nullable = false, unique = true, length = 50)
    private String payrollId;

    @Column(name = "payroll_month", nullable = false, length = 50)
    private String payrollMonth;

    @Column(name = "employee_id", nullable = false, length = 50)
    private String employeeId;

    @Column(name = "employee_name", nullable = false)
    private String employeeName;

    @Column(name = "employment_type", nullable = false, length = 50)
    private String employmentType;

    @Column(name = "monthly_ctc", nullable = false, precision = 15, scale = 2)
    private BigDecimal monthlyCtc;

    @Column(name = "working_days", nullable = false)
    private Integer workingDays;

    @Column(name = "paid_days", nullable = false)
    private Integer paidDays;

    @Column(name = "lop_days", nullable = false)
    private Integer lopDays;

    @Column(name = "basic_pay", nullable = false, precision = 15, scale = 2)
    private BigDecimal basicPay;

    @Column(name = "hra", nullable = false, precision = 15, scale = 2)
    private BigDecimal hra;

    @Column(name = "allowances", nullable = false, precision = 15, scale = 2)
    private BigDecimal allowances;

    @Column(name = "gross_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossSalary;

    @Column(name = "deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal deductions;

    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "pan_number", length = 20)
    private String panNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}

