package com.company.project.collections.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "collections_invoices", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionInvoiceEntity {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "client_id", length = 50)
    private String clientId;

    @Column(name = "client_name", length = 255, nullable = false)
    private String clientName;

    @Column(name = "invoice_date", nullable = false)
    private LocalDate invoiceDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "invoice_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal invoiceAmount;

    @Column(name = "amount_paid", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "outstanding", precision = 14, scale = 2, nullable = false)
    private BigDecimal outstanding;

    @Column(name = "days_overdue")
    private Integer daysOverdue;

    @Column(name = "ageing_bucket", length = 50, nullable = false)
    private String ageingBucket;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "recommended_action", length = 255)
    private String recommendedAction;

    // V19 Extended Fields for Unified Invoices Module
    @Column(name = "project_id", length = 50)
    private String projectId;

    @Column(name = "contract_id", length = 50)
    private String contractId;

    @Column(name = "amount_before_tax", precision = 14, scale = 2)
    private BigDecimal amountBeforeTax;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 14, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays;

    @Column(name = "invoice_status", length = 50, nullable = false)
    @Builder.Default
    private String invoiceStatus = "Unpaid";

    @Column(name = "collection_status", length = 50, nullable = false)
    @Builder.Default
    private String collectionStatus = "Pending";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Payments relationship without cascade deletion (aligned with DB ON DELETE RESTRICT)
    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    @Builder.Default
    private List<CollectionPaymentEntity> payments = new ArrayList<>();
}
