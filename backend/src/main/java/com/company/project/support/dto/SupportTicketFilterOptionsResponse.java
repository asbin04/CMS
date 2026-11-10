package com.company.project.support.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketFilterOptionsResponse {
    private List<String> ticketTypes;
    private List<String> priorities;
    private List<String> statuses;
    private List<String> slaStatuses;
}

