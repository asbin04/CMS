package com.company.project.support.service;

import com.company.project.support.dto.*;

import java.util.List;

public interface SupportTicketService {
    List<SupportTicketDto> getAllTickets(String search, String ticketType, String priority, String status, String slaStatus);
    SupportTicketKpiResponse getKpis();
    SupportTicketTrendsResponse getTrends();
    SupportTicketFilterOptionsResponse getFilterOptions();
    SupportTicketDto getTicketById(Long id);
    SupportTicketDto getTicketByCode(String code);
    SupportTicketDto createTicket(CreateSupportTicketRequest request);
    SupportTicketDto updateTicket(Long id, UpdateSupportTicketRequest request);
    void deleteTicket(Long id);
}

