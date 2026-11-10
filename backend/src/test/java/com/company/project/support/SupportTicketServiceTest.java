package com.company.project.support;

import com.company.project.support.dto.*;
import com.company.project.support.entity.SupportTicketEntity;
import com.company.project.support.repository.SupportTicketRepository;
import com.company.project.support.service.SupportTicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupportTicketServiceTest {

    @Mock
    private SupportTicketRepository repository;

    @InjectMocks
    private SupportTicketServiceImpl service;

    private SupportTicketEntity sampleEntity;

    @BeforeEach
    void setUp() {
        sampleEntity = SupportTicketEntity.builder()
                .id(1L)
                .ticketCode("ST-2026-0186")
                .clientId("CL-001")
                .clientName("Acme Corp")
                .projectId("PRJ-001")
                .projectName("Cloud ERP Migration")
                .amcSlaId("AMC-001")
                .openedDate(LocalDate.of(2026, 10, 28))
                .ticketType("Issue")
                .priority("High")
                .issueRequest("Application login failure")
                .description("Users unable to authenticate via SSO portal")
                .assignedTo("Rohan Verma")
                .assignedToEmail("rohan.v@company.com")
                .status("In Progress")
                .channel("Portal")
                .resolutionTime("-")
                .slaDueDate(LocalDate.of(2026, 10, 29))
                .slaStatus("Within SLA")
                .build();
    }

    @Test
    void testGetAllTicketsWithFilters() {
        when(repository.searchTickets("login", "Issue", "High", "In Progress", "Within SLA"))
                .thenReturn(List.of(sampleEntity));

        List<SupportTicketDto> result = service.getAllTickets("login", "Issue", "High", "In Progress", "Within SLA");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTicketCode()).isEqualTo("ST-2026-0186");
        assertThat(result.get(0).getIssueRequest()).isEqualTo("Application login failure");
        verify(repository, times(1)).searchTickets("login", "Issue", "High", "In Progress", "Within SLA");
    }

    @Test
    void testGetKpisCalculatesCorrectly() {
        when(repository.count()).thenReturn(186L);
        when(repository.countByStatusIgnoreCaseIn(List.of("In Progress", "Pending", "Open"))).thenReturn(34L);
        when(repository.countByStatusIgnoreCase("Resolved")).thenReturn(124L);
        when(repository.countBySlaStatusIgnoreCase("Breached")).thenReturn(6L);

        SupportTicketKpiResponse kpis = service.getKpis();

        assertThat(kpis.getTotalTickets()).isEqualTo(186L);
        assertThat(kpis.getOpenTickets()).isEqualTo(34L);
        assertThat(kpis.getResolvedTickets()).isEqualTo(124L);
        assertThat(kpis.getSlaBreaches()).isEqualTo(6L);
        assertThat(kpis.getSlaComplianceFormatted()).isEqualTo("96.8%");
    }

    @Test
    void testGetTrendsCalculatesCorrectly() {
        SupportTicketEntity t1 = SupportTicketEntity.builder()
                .id(1L).ticketCode("ST-2026-0001").status("Resolved").slaStatus("Within SLA")
                .ticketType("Issue").priority("High").openedDate(LocalDate.of(2026, 10, 1))
                .responseHours("1.2").resolutionHours("18.6").build();
        SupportTicketEntity t2 = SupportTicketEntity.builder()
                .id(2L).ticketCode("ST-2026-0002").status("In Progress").slaStatus("Within SLA")
                .ticketType("Request").priority("Medium").openedDate(LocalDate.of(2026, 10, 2))
                .responseHours("1.5").resolutionHours("12.0").build();
        SupportTicketEntity t3 = SupportTicketEntity.builder()
                .id(3L).ticketCode("ST-2026-0003").status("Pending").slaStatus("Breached")
                .ticketType("Issue").priority("Low").openedDate(LocalDate.of(2026, 9, 15))
                .responseHours("2.0").resolutionHours("24.0").build();

        when(repository.findAll()).thenReturn(List.of(t1, t2, t3));

        SupportTicketTrendsResponse trends = service.getTrends();

        assertThat(trends.getTotalTickets()).isEqualTo(3L);
        assertThat(trends.getResolutionRate()).isEqualTo(33.3);
        assertThat(trends.getSlaCompliance()).isEqualTo(66.7);
        assertThat(trends.getSlaPerformance().getWithinSlaCount()).isEqualTo(2);
        assertThat(trends.getSlaPerformance().getSlaBreachCount()).isEqualTo(1);
        assertThat(trends.getVolumeTrends()).isNotEmpty();
        assertThat(trends.getTypeBreakdown()).isNotEmpty();
        assertThat(trends.getPriorityDistribution()).isNotEmpty();
        assertThat(trends.getKeyInsights()).hasSize(4);
    }

    @Test
    void testGetFilterOptions() {
        when(repository.findDistinctTicketTypes()).thenReturn(List.of("Bug", "Incident", "Issue", "Request", "Task"));
        when(repository.findDistinctPriorities()).thenReturn(List.of("High", "Low", "Medium", "Urgent"));
        when(repository.findDistinctStatuses()).thenReturn(List.of("Closed", "In Progress", "Pending", "Resolved"));
        when(repository.findDistinctSlaStatuses()).thenReturn(List.of("At Risk", "Breached", "Within SLA"));

        SupportTicketFilterOptionsResponse filterOptions = service.getFilterOptions();

        assertThat(filterOptions.getTicketTypes()).contains("Issue", "Request");
        assertThat(filterOptions.getPriorities()).contains("High", "Medium");
        assertThat(filterOptions.getStatuses()).contains("In Progress", "Resolved");
        assertThat(filterOptions.getSlaStatuses()).contains("Within SLA", "Breached");
    }

    @Test
    void testCreateTicket() {
        when(repository.findMaxTicketCode()).thenReturn(Optional.of("ST-2026-0186"));
        when(repository.save(any(SupportTicketEntity.class))).thenAnswer(invocation -> {
            SupportTicketEntity entity = invocation.getArgument(0);
            entity.setId(2L);
            return entity;
        });

        CreateSupportTicketRequest req = CreateSupportTicketRequest.builder()
                .clientId("CL-003")
                .clientName("Apex Financial")
                .projectId("PRJ-002")
                .projectName("Mobile Banking App")
                .amcSlaId("SLA-002")
                .openedDate(LocalDate.of(2026, 10, 27))
                .ticketType("Request")
                .priority("Medium")
                .issueRequest("Access for new user")
                .assignedTo("Sneha Nair")
                .status("Pending")
                .build();

        SupportTicketDto created = service.createTicket(req);

        assertThat(created).isNotNull();
        assertThat(created.getTicketCode()).isEqualTo("ST-2026-0187");
        assertThat(created.getClientId()).isEqualTo("CL-003");
        verify(repository, times(1)).save(any(SupportTicketEntity.class));
    }

    @Test
    void testUpdateTicket() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleEntity));
        when(repository.save(any(SupportTicketEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateSupportTicketRequest req = UpdateSupportTicketRequest.builder()
                .status("Resolved")
                .notes("Issue resolved and validated")
                .build();

        SupportTicketDto updated = service.updateTicket(1L, req);

        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo("Resolved");
        assertThat(updated.getNotes()).isEqualTo("Issue resolved and validated");
        verify(repository, times(1)).save(sampleEntity);
    }

    @Test
    void testDeleteTicket() {
        doNothing().when(repository).deleteById(1L);

        service.deleteTicket(1L);

        verify(repository, times(1)).deleteById(1L);
    }
}

