package com.company.project.projects;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectDeploymentEntity;
import com.company.project.projects.repository.ProjectDeploymentRepository;
import com.company.project.projects.service.ProjectDeploymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
class ProjectDeploymentServiceTest {

    @Mock
    private ProjectDeploymentRepository repository;

    @InjectMocks
    private ProjectDeploymentServiceImpl service;

    private ProjectDeploymentEntity sampleDeployment;

    @BeforeEach
    void setUp() {
        sampleDeployment = ProjectDeploymentEntity.builder()
                .id("DEP-2026-0186")
                .projectId("PRJ-001")
                .releaseVersion("v2.4.0")
                .deploymentDate(LocalDate.of(2026, 10, 28))
                .environment("Production")
                .deploymentOwner("Amit Sharma")
                .preDeploymentChecklist("Completed")
                .backupCompleted("Yes")
                .rollbackPlan("Available")
                .smokeTest("Passed")
                .status("Successful")
                .clientSignOff("Signed-Off")
                .goLiveDate(LocalDate.of(2026, 10, 28))
                .handoverStatus("Handover Completed")
                .releaseNotes("Payment gateway integration with RBI compliance updates.")
                .build();
    }

    @Test
    @DisplayName("getAllDeployments returns mapped DTO list")
    void testGetAllDeployments() {
        when(repository.findAllByOrderByDeploymentDateDescIdDesc()).thenReturn(List.of(sampleDeployment));

        List<ProjectDeploymentDto> result = service.getAllDeployments(null, null, null, null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("DEP-2026-0186");
        assertThat(result.get(0).getReleaseVersion()).isEqualTo("v2.4.0");
        assertThat(result.get(0).getEnvironment()).isEqualTo("Production");
        verify(repository, times(1)).findAllByOrderByDeploymentDateDescIdDesc();
    }

    @Test
    @DisplayName("getKpis computes exact metrics correctly")
    void testGetKpis() {
        when(repository.findAll()).thenReturn(List.of(
                sampleDeployment,
                ProjectDeploymentEntity.builder()
                        .id("DEP-2026-0185")
                        .projectId("PRJ-001")
                        .releaseVersion("v2.3.1")
                        .deploymentDate(LocalDate.of(2026, 10, 27))
                        .environment("Staging")
                        .smokeTest("Failed")
                        .status("Failed")
                        .clientSignOff("Pending")
                        .handoverStatus("Pending")
                        .build()
        ));

        DeploymentKpisResponse kpis = service.getKpis();

        assertThat(kpis.getTotalDeployments()).isEqualTo(2);
        assertThat(kpis.getSuccessfulDeployments()).isEqualTo(0);
        assertThat(kpis.getFailedDeployments()).isEqualTo(1);
        assertThat(kpis.getHandoverPending()).isEqualTo(1);
    }

    @Test
    @DisplayName("createDeployment generates proper next ID and saves entity")
    void testCreateDeployment() {
        when(repository.count()).thenReturn(186L);
        when(repository.save(any(ProjectDeploymentEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateProjectDeploymentRequest request = CreateProjectDeploymentRequest.builder()
                .projectId("PRJ-002")
                .releaseVersion("v1.5.0")
                .deploymentDate(LocalDate.of(2026, 11, 10))
                .environment("Production")
                .deploymentOwner("Amit Sharma")
                .preDeploymentChecklist("Completed")
                .backupCompleted("Yes")
                .rollbackPlan("Available")
                .smokeTest("Passed")
                .status("Successful")
                .clientSignOff("Signed-Off")
                .goLiveDate(LocalDate.of(2026, 11, 10))
                .handoverStatus("Handover Completed")
                .releaseNotes("Initial release")
                .build();

        ProjectDeploymentDto result = service.createDeployment(request);

        assertThat(result.getId()).isEqualTo("DEP-2026-0187");
        assertThat(result.getReleaseVersion()).isEqualTo("v1.5.0");
        verify(repository).save(any(ProjectDeploymentEntity.class));
    }

    @Test
    @DisplayName("updateDeployment updates existing entity fields")
    void testUpdateDeployment() {
        when(repository.findById("DEP-2026-0186")).thenReturn(Optional.of(sampleDeployment));
        when(repository.save(any(ProjectDeploymentEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProjectDeploymentRequest updateReq = UpdateProjectDeploymentRequest.builder()
                .releaseVersion("v2.4.1")
                .status("Successful")
                .build();

        ProjectDeploymentDto updated = service.updateDeployment("DEP-2026-0186", updateReq);

        assertThat(updated).isNotNull();
        assertThat(updated.getReleaseVersion()).isEqualTo("v2.4.1");
        verify(repository).save(sampleDeployment);
    }

    @Test
    @DisplayName("deleteDeployment deletes entity by id")
    void testDeleteDeployment() {
        when(repository.existsById("DEP-2026-0186")).thenReturn(true);
        doNothing().when(repository).deleteById("DEP-2026-0186");

        service.deleteDeployment("DEP-2026-0186");

        verify(repository).deleteById("DEP-2026-0186");
    }
}
