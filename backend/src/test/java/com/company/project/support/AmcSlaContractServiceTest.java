package com.company.project.support;

import com.company.project.support.dto.*;
import com.company.project.support.entity.AmcSlaContractEntity;
import com.company.project.support.repository.AmcSlaContractRepository;
import com.company.project.support.service.AmcSlaContractServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AmcSlaContractServiceTest {

    @Mock
    private AmcSlaContractRepository repository;

    @InjectMocks
    private AmcSlaContractServiceImpl service;

    private AmcSlaContractEntity sampleContract;

    @BeforeEach
    void setUp() {
        sampleContract = AmcSlaContractEntity.builder()
                .id(1L)
                .contractCode("AMC-0012")
                .clientId("CL-001")
                .clientName("Acme Corp")
                .projectId("PRJ-001")
                .projectName("Cloud ERP Migration")
                .serviceType("Application Support")
                .startDate(LocalDate.of(2026, 4, 1))
                .endDate(LocalDate.of(2027, 3, 31))
                .renewalDate(LocalDate.of(2027, 3, 15))
                .contractValue(new BigDecimal("2400000.00"))
                .responseSla("2 hrs")
                .resolutionSla("12 hrs")
                .coverageHours("24/7 Support")
                .status("Active")
                .penaltyClause("Applicable (5%)")
                .renewalAlert("Normal")
                .assignedManager("Rahul Sharma")
                .notes("Full stack enterprise ERP support and maintenance.")
                .build();
    }

    @Test
    @DisplayName("getAllContracts returns filtered list of DTOs")
    void testGetAllContracts() {
        when(repository.searchContracts(isNull(), isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.of(sampleContract));

        List<AmcSlaContractDto> list = service.getAllContracts(null, null, null, null, null, null);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getContractCode()).isEqualTo("AMC-0012");
        assertThat(list.get(0).getClientName()).isEqualTo("Acme Corp");
        assertThat(list.get(0).getOwner()).isEqualTo("Rahul Sharma");
        assertThat(list.get(0).getRenewalWindow()).isNotNull();
    }

    @Test
    @DisplayName("getKpis computes correct metrics")
    void testGetKpis() {
        when(repository.findAll()).thenReturn(List.of(sampleContract));
        when(repository.sumActiveContractValue()).thenReturn(new BigDecimal("248500.00"));

        AmcSlaKpiResponse kpis = service.getKpis();

        assertThat(kpis.getTotalContracts()).isEqualTo(1L);
        assertThat(kpis.getActiveContracts()).isEqualTo(1L);
        assertThat(kpis.getTotalContractValue()).isEqualByComparingTo(new BigDecimal("248500.00"));
        assertThat(kpis.getFormattedContractValue()).contains("2,48,500");
    }

    @Test
    @DisplayName("createContract saves and generates code if not supplied")
    void testCreateContract() {
        CreateAmcSlaContractRequest request = CreateAmcSlaContractRequest.builder()
                .clientId("CL-001")
                .projectId("PRJ-001")
                .serviceType("Application Support")
                .startDate(LocalDate.of(2026, 4, 1))
                .endDate(LocalDate.of(2027, 3, 31))
                .renewalDate(LocalDate.of(2027, 3, 15))
                .contractValue(new BigDecimal("2400000.00"))
                .build();

        when(repository.count()).thenReturn(11L);
        when(repository.save(any(AmcSlaContractEntity.class))).thenAnswer(invocation -> {
            AmcSlaContractEntity e = invocation.getArgument(0);
            e.setId(12L);
            return e;
        });

        AmcSlaContractDto created = service.createContract(request);

        assertThat(created.getId()).isEqualTo(12L);
        assertThat(created.getContractCode()).isEqualTo("AMC-0012");
        assertThat(created.getClientId()).isEqualTo("CL-001");
    }

    @Test
    @DisplayName("updateContract updates existing fields correctly")
    void testUpdateContract() {
        UpdateAmcSlaContractRequest request = UpdateAmcSlaContractRequest.builder()
                .status("Expiring")
                .renewalAlert("Expiring (≤ 30 Days)")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(sampleContract));
        when(repository.save(any(AmcSlaContractEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AmcSlaContractDto updated = service.updateContract(1L, request);

        assertThat(updated).isNotNull();
        assertThat(updated.getStatus()).isEqualTo("Expiring");
        assertThat(updated.getRenewalAlert()).isEqualTo("Expiring (≤ 30 Days)");
    }

    @Test
    @DisplayName("deleteContract delegates to repository")
    void testDeleteContract() {
        service.deleteContract(1L);
        verify(repository, times(1)).deleteById(1L);
    }
}

