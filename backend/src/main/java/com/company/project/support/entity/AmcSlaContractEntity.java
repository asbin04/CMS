package com.company.project.support.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "amc_sla_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmcSlaContractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_code", nullable = false, unique = true, length = 50)
    private String contractCode;

    @Column(name = "client_id", nullable = false, length = 50)
    private String clientId;

    @Column(name = "client_name", length = 150)
    private String clientName;

    @Column(name = "project_id", nullable = false, length = 50)
    private String projectId;

    @Column(name = "project_name", length = 150)
    private String projectName;

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "renewal_date", nullable = false)
    private LocalDate renewalDate;

    @Column(name = "contract_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal contractValue;

    @Column(name = "response_sla", nullable = false, length = 50)
    private String responseSla;

    @Column(name = "resolution_sla", nullable = false, length = 50)
    private String resolutionSla;

    @Column(name = "coverage_hours", nullable = false, length = 100)
    private String coverageHours;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "penalty_clause", length = 100)
    private String penaltyClause;

    @Column(name = "renewal_alert", length = 50)
    private String renewalAlert;

    @Column(name = "assigned_manager", length = 100)
    private String assignedManager;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

