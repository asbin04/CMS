package com.company.project.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupportTicketRequest {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    private String clientName;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    private String projectName;

    private String amcSlaId;

    @NotNull(message = "Opened date is required")
    private LocalDate openedDate;

    @NotBlank(message = "Ticket type is required")
    private String ticketType;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Issue / Request summary is required")
    private String issueRequest;

    private String description;

    @NotBlank(message = "Assigned person is required")
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

