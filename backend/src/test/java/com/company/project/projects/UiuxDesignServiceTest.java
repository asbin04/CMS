package com.company.project.projects;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.UiuxDesignEntity;
import com.company.project.projects.repository.UiuxDesignRepository;
import com.company.project.projects.service.UiuxDesignServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UiuxDesignServiceTest {

    @Mock
    private UiuxDesignRepository repository;

    @InjectMocks
    private UiuxDesignServiceImpl service;

    private UiuxDesignEntity sampleDesign;

    @BeforeEach
    void setUp() {
        sampleDesign = UiuxDesignEntity.builder()
                .id("DES-2026-0186")
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0184")
                .screenFeature("Login Screen")
                .designType("UI Design")
                .version("v1.2")
                .designer("Amit Sharma")
                .designerInitials("AS")
                .tool("Figma")
                .prototypeUrl("https://www.figma.com")
                .clientFeedback("Looks good, update spacing")
                .feedbackDate(LocalDate.of(2026, 10, 28))
                .approvalStatus("Pending")
                .changeRequest("CR-014")
                .status("In Progress")
                .notes("Spacing updates")
                .build();
    }

    @Test
    @DisplayName("getAllDesigns returns list of DTOs ordered by id desc")
    void testGetAllDesigns() {
        when(repository.findAllByOrderByIdDesc()).thenReturn(List.of(sampleDesign));

        List<UiuxDesignDto> result = service.getAllDesigns();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("DES-2026-0186");
        assertThat(result.get(0).getScreenFeature()).isEqualTo("Login Screen");
        assertThat(result.get(0).getDesignerInitials()).isEqualTo("AS");
    }

    @Test
    @DisplayName("getDesignById returns DTO when found")
    void testGetDesignById() {
        when(repository.findById("DES-2026-0186")).thenReturn(Optional.of(sampleDesign));

        UiuxDesignDto result = service.getDesignById("DES-2026-0186");

        assertThat(result).isNotNull();
        assertThat(result.getScreenFeature()).isEqualTo("Login Screen");
    }

    @Test
    @DisplayName("getKpis returns accurate metrics matching targets")
    void testGetKpis() {
        when(repository.count()).thenReturn(10L);
        when(repository.countByStatusIgnoreCase("In Progress")).thenReturn(6L);
        when(repository.countByApprovalStatusIgnoreCase("Approved")).thenReturn(5L);
        when(repository.countChangeRequests()).thenReturn(4L);
        when(repository.countByApprovalStatusIgnoreCase("Pending")).thenReturn(5L);

        UiuxKpiResponse kpis = service.getKpis();

        assertThat(kpis.getTotalDesigns()).isEqualTo(10L);
        assertThat(kpis.getInProgress()).isEqualTo(6L);
        assertThat(kpis.getApproved()).isEqualTo(5L);
        assertThat(kpis.getChangeRequests()).isEqualTo(4L);
        assertThat(kpis.getPendingApproval()).isEqualTo(5L);
    }

    @Test
    @DisplayName("createDesign computes initials and saves entity")
    void testCreateDesign() {
        CreateUiuxDesignRequest req = CreateUiuxDesignRequest.builder()
                .projectId("PRJ-001")
                .requirementId("REQ-2026-0185")
                .screenFeature("Dashboard")
                .designType("UI/UX")
                .version("v2.0")
                .designer("Sneha Nair")
                .build();

        when(repository.findAll()).thenReturn(List.of(sampleDesign));
        when(repository.save(any(UiuxDesignEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UiuxDesignDto result = service.createDesign(req);

        assertThat(result.getId()).isEqualTo("DES-2026-0187");
        assertThat(result.getDesignerInitials()).isEqualTo("SN");
        assertThat(result.getScreenFeature()).isEqualTo("Dashboard");
    }

    @Test
    @DisplayName("deleteDesign removes entity when present")
    void testDeleteDesign() {
        when(repository.existsById("DES-2026-0186")).thenReturn(true);

        service.deleteDesign("DES-2026-0186");

        verify(repository, times(1)).deleteById("DES-2026-0186");
    }
}

