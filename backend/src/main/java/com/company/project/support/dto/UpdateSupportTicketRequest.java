package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSupportTicketRequest {
    private String clientId;
    private String clientName;
    private String projectId;
    private String projectName;
    private String amcSlaId;
    private LocalDate openedDate;
    private String ticketType;
    private String priority;
    private String issueRequest;
    private String description;
    private String assignedTo;
    private String assignedToEmail;
    private String status;
    private String channel;
    private String resolutionTime;
    private LocalDate slaDueDate;
    private String slaStatus;
    private String firstResponseDate;
    private String resolvedDate;
    private String responseHours;
    private String resolutionHours;
    private String responseSlaTarget;
    private String resolutionSlaTarget;
    private String customerConfirmation;
    private String notes;
}

