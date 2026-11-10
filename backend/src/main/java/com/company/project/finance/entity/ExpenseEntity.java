package com.company.project.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "expenses", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_code", length = 50, unique = true)
    private String expenseCode;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Column(name = "category", length = 100, nullable = false)
    private String category;

    @Column(name = "vendor_id", length = 50)
    private String vendorId;

    @Column(name = "project_id", length = 50)
    private String projectId;

    @Column(name = "employee_id", length = 50)
    private String employeeId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "amount_before_tax", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountBeforeTax = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "amount", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amount = BigDecimal.ZERO;

    @Column(name = "payment_mode", length = 50, nullable = false)
    @Builder.Default
    private String paymentMode = "Card";

    @Column(name = "status", length = 50, nullable = false)
    @Builder.Default
    private String status = "Approved";

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "month_label", length = 50, nullable = false)
    @Builder.Default
    private String monthLabel = "Oct 2026";

    @Column(name = "expense_bucket", length = 50, nullable = false)
    @Builder.Default
    private String expenseBucket = "Operational";

    @Column(name = "is_project_expense", nullable = false)
    @Builder.Default
    private boolean isProjectExpense = false;

    @Column(name = "project_label", length = 255)
    private String projectLabel;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
