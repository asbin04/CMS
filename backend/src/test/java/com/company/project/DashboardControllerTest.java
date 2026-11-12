package com.company.project;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.dashboard.controller.DashboardController;
import com.company.project.dashboard.dto.CeoDashboardResponse;
import com.company.project.dashboard.entity.DashboardKpiCard;
import com.company.project.dashboard.entity.DashboardSettings;
import com.company.project.dashboard.entity.ManagementAlert;
import com.company.project.dashboard.service.DashboardService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/v1/dashboard/ceo returns 200 with CEO dashboard data")
    void testGetCeoDashboard() throws Exception {
        DashboardSettings settings = new DashboardSettings();
        settings.setDashboardTitle("CEO Dashboard");

        DashboardKpiCard kpi = new DashboardKpiCard();
        kpi.setTitle("Revenue");
        kpi.setFormattedValue("₹ 1,24,50,000");

        CeoDashboardResponse response = CeoDashboardResponse.builder()
                .settings(settings)
                .kpis(List.of(kpi))
                .build();

        when(dashboardService.getCeoDashboard()).thenReturn(response);

        mockMvc.perform(get("/api/v1/dashboard/ceo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.settings.dashboard_title").value("CEO Dashboard"))
                .andExpect(jsonPath("$.data.kpis[0].title").value("Revenue"));
    }

    @Test
    @DisplayName("PUT /api/v1/dashboard/ceo/kpis/{id} updates KPI card")
    void testUpdateKpi() throws Exception {
        DashboardKpiCard req = new DashboardKpiCard();
        req.setRawValue(new BigDecimal("5000000"));
        req.setFormattedValue("₹ 50,00,000");

        when(dashboardService.updateKpi(eq(1L), any(com.company.project.dashboard.dto.UpdateDashboardKpiCardRequest.class))).thenReturn(req);

        mockMvc.perform(put("/api/v1/dashboard/ceo/kpis/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.formatted_value").value("₹ 50,00,000"));
    }

    @Test
    @DisplayName("PUT /api/v1/dashboard/ceo/alerts/{id} increments alert count")
    void testUpdateAlert() throws Exception {
        ManagementAlert alert = new ManagementAlert();
        alert.setId(1L);
        alert.setAlertCount(5);

        when(dashboardService.updateAlert(eq(1L), eq(2))).thenReturn(alert);

        mockMvc.perform(put("/api/v1/dashboard/ceo/alerts/1?delta=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.alert_count").value(5));
    }
}

