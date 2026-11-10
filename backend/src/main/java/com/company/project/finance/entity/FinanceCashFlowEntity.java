package com.company.project.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "finance_cash_flows",
    schema = "public",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_cf_cash_flow_id", columnNames = {"cash_flow_id"}),
        @UniqueConstraint(name = "uq_cf_period_code", columnNames = {"period_code"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinanceCashFlowEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cash_flow_id", length = 50, nullable = false, unique = true)
    private String cashFlowId;

    @Column(name = "period", length = 50, nullable = false)
    private String period;

    @Column(name = "period_code", length = 10, nullable = false, unique = true)
    private String periodCode;

    @Column(name = "opening_cash", precision = 15, scale = 2, nullable = false)
    private BigDecimal openingCash;

    @Column(name = "collections", precision = 15, scale = 2, nullable = false)
    private BigDecimal collections;

    @Column(name = "other_inflows", precision = 15, scale = 2, nullable = false)
    private BigDecimal otherInflows;

    @Column(name = "total_inflows", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalInflows;

    @Column(name = "vendor_payments", precision = 15, scale = 2, nullable = false)
    private BigDecimal vendorPayments;

    @Column(name = "payroll_payments", precision = 15, scale = 2, nullable = false)
    private BigDecimal payrollPayments;

    @Column(name = "operating_expenses", precision = 15, scale = 2, nullable = false)
    private BigDecimal operatingExpenses;

    @Column(name = "other_outflows", precision = 15, scale = 2, nullable = false)
    private BigDecimal otherOutflows;

    @Column(name = "total_outflows", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalOutflows;

    @Column(name = "net_cash_flow", precision = 15, scale = 2, nullable = false)
    private BigDecimal netCashFlow;

    @Column(name = "closing_cash", precision = 15, scale = 2, nullable = false)
    private BigDecimal closingCash;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @Column(name = "updated_by", length = 100, nullable = false)
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateFinancials() {
        if (openingCash == null) openingCash = BigDecimal.ZERO;
        if (collections == null) collections = BigDecimal.ZERO;
        if (otherInflows == null) otherInflows = BigDecimal.ZERO;
        if (vendorPayments == null) vendorPayments = BigDecimal.ZERO;
        if (payrollPayments == null) payrollPayments = BigDecimal.ZERO;
        if (operatingExpenses == null) operatingExpenses = BigDecimal.ZERO;
        if (otherOutflows == null) otherOutflows = BigDecimal.ZERO;

        totalInflows = collections.add(otherInflows);
        totalOutflows = vendorPayments.add(payrollPayments).add(operatingExpenses).add(otherOutflows);
        netCashFlow = totalInflows.subtract(totalOutflows);
        closingCash = openingCash.add(netCashFlow);
    }
}

