package com.company.project.support.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "support_tickets", schema = "public")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", length = 50, unique = true, nullable = false)
    private String ticketCode;

    @Column(name = "client_id", length = 50, nullable = false)
    private String clientId;

    @Column(name = "client_name", length = 150)
    private String clientName;

    @Column(name = "project_id", length = 50, nullable = false)
    private String projectId;

    @Column(name = "project_name", length = 150)
    private String projectName;

    @Column(name = "amc_sla_id", length = 50)
    private String amcSlaId;

    @Column(name = "opened_date", nullable = false)
    private LocalDate openedDate;

    @Column(name = "ticket_type", length = 50, nullable = false)
    private String ticketType;

    @Column(name = "priority", length = 50, nullable = false)
    private String priority;

    @Column(name = "issue_request", length = 255, nullable = false)
    private String issueRequest;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "assigned_to", length = 100, nullable = false)
    private String assignedTo;

    @Column(name = "assigned_to_email", length = 100)
    private String assignedToEmail;

    @Column(name = "status", length = 50, nullable = false)
    private String status;

    @Column(name = "channel", length = 50)
    @Builder.Default
    private String channel = "Portal";

    @Column(name = "resolution_time", length = 50)
    @Builder.Default
    private String resolutionTime = "-";

    @Column(name = "sla_due_date")
    private LocalDate slaDueDate;

    @Column(name = "sla_status", length = 50, nullable = false)
    @Builder.Default
    private String slaStatus = "Within SLA";

    @Column(name = "first_response_date", length = 50)
    private String firstResponseDate;

    @Column(name = "resolved_date", length = 50)
    private String resolvedDate;

    @Column(name = "response_hours", length = 20)
    @Builder.Default
    private String responseHours = "-";

    @Column(name = "resolution_hours", length = 20)
    @Builder.Default
    private String resolutionHours = "-";

    @Column(name = "response_sla_target", length = 20)
    @Builder.Default
    private String responseSlaTarget = "4.0";

    @Column(name = "resolution_sla_target", length = 20)
    @Builder.Default
    private String resolutionSlaTarget = "24.0";

    @Column(name = "customer_confirmation", length = 20)
    @Builder.Default
    private String customerConfirmation = "-";

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}

