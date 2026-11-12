package com.company.project.projects.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.projects.dto.*;
import com.company.project.projects.service.ProjectDeploymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ProjectDeploymentControllerTest {

        private MockMvc mockMvc;
        private ProjectDeploymentService service;

        private ProjectDeploymentDto sampleDeployment;

        @BeforeEach
        void setUp() {
                service = mock(ProjectDeploymentService.class);
                ProjectDeploymentController controller = new ProjectDeploymentController(service);
                mockMvc = MockMvcBuilders.standaloneSetup(controller)
                                .setControllerAdvice(new GlobalExceptionHandler())
                                .build();

                sampleDeployment = ProjectDeploymentDto.builder()
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
                                .releaseNotes("Payment gateway integration")
                                .build();
        }

        @Test
        @DisplayName("GET /api/v1/projects/deployments returns list of deployments")
        void testGetAllDeployments() throws Exception {
                when(service.getAllDeployments(null, null, null, null)).thenReturn(List.of(sampleDeployment));

                mockMvc.perform(get("/api/v1/projects/deployments"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data[0].id").value("DEP-2026-0186"))
                                .andExpect(jsonPath("$.data[0].releaseVersion").value("v2.4.0"))
                                .andExpect(jsonPath("$.data[0].environment").value("Production"));
        }

        @Test
        @DisplayName("GET /api/v1/projects/deployments/kpis returns KPI response")
        void testGetKpis() throws Exception {
                DeploymentKpisResponse kpis = DeploymentKpisResponse.builder()
                                .totalDeployments(124)
                                .successfulDeployments(108)
                                .failedDeployments(6)
                                .goLiveCompleted(98)
                                .handoverPending(12)
                                .build();

                when(service.getKpis()).thenReturn(kpis);

                mockMvc.perform(get("/api/v1/projects/deployments/kpis"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.totalDeployments").value(124))
                                .andExpect(jsonPath("$.data.successfulDeployments").value(108))
                                .andExpect(jsonPath("$.data.failedDeployments").value(6));
        }

        @Test
        @DisplayName("GET /api/v1/projects/deployments/filters returns filter options")
        void testGetFilterOptions() throws Exception {
                DeploymentFilterOptionsResponse filters = DeploymentFilterOptionsResponse.builder()
                                .environments(List.of("Production", "Staging", "UAT"))
                                .deploymentStatuses(List.of("Successful", "Failed", "In-Progress"))
                                .handoverStatuses(List.of("Handover Completed", "Pending Handover"))
                                .build();

                when(service.getFilterOptions()).thenReturn(filters);

                mockMvc.perform(get("/api/v1/projects/deployments/filters"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.environments[0]").value("Production"));
        }

        @Test
        @DisplayName("GET /api/v1/projects/deployments/{id} returns deployment if found")
        void testGetDeploymentById() throws Exception {
                when(service.getDeploymentById("DEP-2026-0186")).thenReturn(sampleDeployment);

                mockMvc.perform(get("/api/v1/projects/deployments/DEP-2026-0186"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").value("DEP-2026-0186"));
        }

        @Test
        @DisplayName("DELETE /api/v1/projects/deployments/{id} returns success")
        void testDeleteDeployment() throws Exception {
                doNothing().when(service).deleteDeployment("DEP-2026-0186");

                mockMvc.perform(delete("/api/v1/projects/deployments/DEP-2026-0186"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }
}
