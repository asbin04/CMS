package com.company.project.finance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "finance_payments", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancePaymentEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "invoice_id", length = 50, nullable = false)
    private String invoiceId;

    @Column(name = "client_id", length = 50, nullable = false)
    private String clientId;

    @Column(name = "client_name", length = 255, nullable = false)
    private String clientName;

    @Column(name = "amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "invoice_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal invoiceAmount;

    @Column(name = "mode", length = 50, nullable = false)
    private String mode;

    @Column(name = "reference_no", length = 100, nullable = false)
    private String referenceNo;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "variance_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal varianceAmount;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

