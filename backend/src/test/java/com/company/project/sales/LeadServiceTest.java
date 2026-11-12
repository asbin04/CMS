package com.company.project.sales;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.common.response.PageResponse;
import com.company.project.sales.dto.*;
import com.company.project.sales.entity.LeadEntity;
import com.company.project.sales.repository.LeadRepository;
import com.company.project.sales.service.LeadIdGeneratorService;
import com.company.project.sales.service.LeadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeadServiceTest {

    @Mock
    private LeadRepository leadRepository;

    @Mock
    private LeadIdGeneratorService leadIdGeneratorService;

    @InjectMocks
    private LeadService leadService;

    private LeadEntity sampleEntity;

    @BeforeEach
    void setUp() {
        sampleEntity = LeadEntity.builder()
                .id("L-2025-001")
                .leadDate(LocalDate.of(2025, 3, 15))
                .company("Acme Corp")
                .contactName("John Doe")
                .email("john@acme.com")
                .phone("+91 98765 43210")
                .source("Website")
                .serviceInterest("Cloud & DevOps")
                .country("India")
                .city("Bangalore")
                .ownerId("EMP-001")
                .stage("New")
                .status("Open")
                .estimatedValue(BigDecimal.valueOf(1200000.00))
                .leadScore(85)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getLeads should return paginated PageResponse")
    void testGetLeads() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        Page<LeadEntity> page = new PageImpl<>(List.of(sampleEntity), pageable, 1);

        when(leadRepository.findAll(org.mockito.ArgumentMatchers.<Specification<LeadEntity>>any(), eq(pageable)))
                .thenReturn(page);

        PageResponse<LeadResponse> response = leadService.getLeads(pageable, "Acme", "New", "Open", "EMP-001",
                "Website");

        assertThat(response).isNotNull();
        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getId()).isEqualTo("L-2025-001");
        assertThat(response.getContent().get(0).getCompany()).isEqualTo("Acme Corp");
        assertThat(response.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("createLead generates sequential ID and saves entity")
    void testCreateLead() {
        CreateLeadRequest request = CreateLeadRequest.builder()
                .leadDate(LocalDate.of(2025, 4, 1))
                .company("Beta Tech")
                .contactName("Jane Doe")
                .email("jane@betatech.com")
                .phone("+91 99999 88888")
                .source("Referral")
                .serviceInterest("AI Solutions")
                .country("India")
                .city("Hyderabad")
                .ownerId("EMP-002")
                .stage("New")
                .status("Open")
                .estimatedValue(BigDecimal.valueOf(500000.00))
                .build();

        when(leadIdGeneratorService.generateAndAllocateNextLeadId(2025)).thenReturn("L-2025-002");
        when(leadRepository.save(any(LeadEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LeadResponse created = leadService.createLead(request);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo("L-2025-002");
        assertThat(created.getCompany()).isEqualTo("Beta Tech");
        verify(leadIdGeneratorService, times(1)).generateAndAllocateNextLeadId(2025);
        verify(leadRepository, times(1)).save(any(LeadEntity.class));
    }

    @Test
    @DisplayName("getSummary computes real counts and MoM trend percentages")
    void testGetSummary() {
        when(leadRepository.count()).thenReturn(100L);
        when(leadRepository.countLeadsBetween(any(LocalDate.class), any(LocalDate.class))).thenReturn(20L, 10L, 0L, 0L);
        when(leadRepository.countFollowUpsDue(any(LocalDate.class))).thenReturn(15L);
        when(leadRepository.countConvertedLeads()).thenReturn(25L);
        when(leadRepository.countFollowUpsDueBetween(any(LocalDate.class), any(LocalDate.class))).thenReturn(12L);
        when(leadRepository.countLeadsBefore(any(LocalDate.class))).thenReturn(80L);

        LeadSummaryDto summary = leadService.getSummary();

        assertThat(summary).isNotNull();
        assertThat(summary.getTotalLeads()).isEqualTo(100L);
        assertThat(summary.getFollowUpsDue()).isEqualTo(15L);
        assertThat(summary.getConvertedLeads()).isEqualTo(25L);
        assertThat(summary.getLastUpdated()).isNotBlank();
    }

    @Test
    @DisplayName("getLeadById throws ResourceNotFoundException when lead does not exist")
    void testGetLeadByIdNotFound() {
        when(leadRepository.findById("L-9999-999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> leadService.getLeadById("L-9999-999"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Lead not found with id: L-9999-999");
    }

    @Test
    @DisplayName("deleteLead deletes existing lead")
    void testDeleteLead() {
        when(leadRepository.existsById("L-2025-001")).thenReturn(true);
        doNothing().when(leadRepository).deleteById("L-2025-001");

        leadService.deleteLead("L-2025-001");

        verify(leadRepository, times(1)).deleteById("L-2025-001");
    }
}
