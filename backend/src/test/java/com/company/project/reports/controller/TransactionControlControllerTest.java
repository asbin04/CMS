package com.company.project.reports.controller;

import com.company.project.common.exception.GlobalExceptionHandler;
import com.company.project.reports.dto.TransactionControlCheckDto;
import com.company.project.reports.dto.TransactionControlResponse;
import com.company.project.reports.service.TransactionControlService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TransactionControlController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class TransactionControlControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionControlService transactionControlService;

    @Test
    @DisplayName("GET /api/v1/reports/transaction-control returns evaluated checks")
    void getTransactionControlChecksSuccess() throws Exception {
        TransactionControlResponse response = TransactionControlResponse.builder()
                .verificationAvailable(true)
                .checkedAt("2026-11-11T18:00:00Z")
                .defaultSelectedCheckId("invalid-payment-invoices")
                .checks(List.of(
                        TransactionControlCheckDto.builder()
                                .id("invalid-payment-invoices")
                                .control("Invalid payment invoices")
                                .description("Nonblank Invoice ID does not match the invoice register.")
                                .classification("CRITICAL")
                                .count(0)
                                .actionLabel("Link payment to valid invoice")
                                .actionPath("/finance/payments")
                                .nested(true)
                                .statusFilterLabel("Payment status")
                                .statusOptions(List.of())
                                .records(List.of())
                                .build()
                ))
                .build();

        when(transactionControlService.evaluateControls()).thenReturn(response);

        mockMvc.perform(get("/api/v1/reports/transaction-control"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationAvailable").value(true))
                .andExpect(jsonPath("$.data.defaultSelectedCheckId").value("invalid-payment-invoices"))
                .andExpect(jsonPath("$.data.checks[0].id").value("invalid-payment-invoices"))
                .andExpect(jsonPath("$.data.checks[0].classification").value("CRITICAL"));

        mockMvc.perform(post("/api/v1/reports/transaction-control/recheck"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.verificationAvailable").value(true));
    }
}

