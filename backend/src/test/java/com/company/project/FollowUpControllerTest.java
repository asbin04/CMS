package com.company.project;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.controller.FollowUpController;
import com.company.project.dashboard.dto.CreateFollowUpItemRequest;
import com.company.project.dashboard.dto.FollowUpItemDto;
import com.company.project.dashboard.dto.FollowUpSummaryDto;
import com.company.project.dashboard.service.FollowUpService;
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

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = FollowUpController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class FollowUpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private FollowUpService service;

    @Test
    @DisplayName("GET /api/v1/follow-up-queue returns 200 with list")
    void testGetAllItems() throws Exception {
        FollowUpItemDto item = FollowUpItemDto.builder()
                .id(1L)
                .moduleName("Invoices & Payments")
                .priority("High")
                .build();

        when(service.getAllItems(null, null)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/v1/follow-up-queue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].moduleName").value("Invoices & Payments"));
    }

    @Test
    @DisplayName("GET /api/v1/follow-up-queue/summary returns 200 with summary counts")
    void testGetSummary() throws Exception {
        FollowUpSummaryDto summary = FollowUpSummaryDto.builder()
                .highPriorityCount(25L)
                .mediumPriorityCount(17L)
                .lowPriorityCount(5L)
                .totalPendingItems(8L)
                .build();

        when(service.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/follow-up-queue/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.highPriorityCount").value(25));
    }

    @Test
    @DisplayName("GET /api/v1/follow-up-queue/{id} returns 404 when item not found")
    void testGetItemByIdNotFound() throws Exception {
        when(service.getItemById(999L)).thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/v1/follow-up-queue/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Not found"));
    }

    @Test
    @DisplayName("POST /api/v1/follow-up-queue with invalid body returns 400 validation error")
    void testCreateItemValidationError() throws Exception {
        CreateFollowUpItemRequest invalidReq = CreateFollowUpItemRequest.builder().build();

        mockMvc.perform(post("/api/v1/follow-up-queue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    @DisplayName("PUT /api/v1/follow-up-queue/{id}/toggle-done returns 200")
    void testToggleDone() throws Exception {
        FollowUpItemDto updated = FollowUpItemDto.builder()
                .id(1L)
                .isDone(true)
                .build();

        when(service.toggleDone(1L)).thenReturn(updated);

        mockMvc.perform(put("/api/v1/follow-up-queue/1/toggle-done"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("DELETE /api/v1/follow-up-queue/{id} returns 200")
    void testDeleteItem() throws Exception {
        doNothing().when(service).deleteItem(1L);

        mockMvc.perform(delete("/api/v1/follow-up-queue/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

