package com.company.project.dashboard;

import com.company.project.security.JwtTokenProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApprovalContractIntegrationTest {

    static {
        File[] envFiles = new File[]{ new File(".env"), new File("backend/.env"), new File("../.env") };
        for (File envFile : envFiles) {
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception ignored) {}
                break;
            }
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() {
        adminToken = "Bearer " + jwtTokenProvider.generateToken("admin", "ROLE_ADMIN");
    }

    @Test
    @DisplayName("Contract: POST exact frontend employee approval JSON persists all fields")
    void testCreateEmployeeApprovalFrontendPayload() throws Exception {
        // Exact payload sent by AddEmployeeApprovalModal / addEmployeeRequest
        String frontendPayload = """
            {
              "employee_name": "Contract Test Employee",
              "employee_code": "EMP-9001",
              "request_type": "Sick Leave",
              "from_date": "03 Nov 2026",
              "to_date": "04 Nov 2026",
              "duration": "2 days",
              "reason": "Viral fever recovery",
              "status": "Pending"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/approvals/employee")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(frontendPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.employee_name").value("Contract Test Employee"))
                .andExpect(jsonPath("$.data.employee_code").value("EMP-9001"))
                .andExpect(jsonPath("$.data.request_type").value("Sick Leave"))
                .andExpect(jsonPath("$.data.status").value("Pending"))
                .andExpect(jsonPath("$.data.applied_date").exists())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        long createdId = root.path("data").path("id").asLong();
        assertThat(createdId).isGreaterThan(0);
    }

    @Test
    @DisplayName("Contract: POST exact frontend client approval JSON persists all fields")
    void testCreateClientApprovalFrontendPayload() throws Exception {
        // Exact payload sent by AddClientApprovalModal / addClientRequest
        String frontendPayload = """
            {
              "client_name": "Apex Global Systems",
              "request_type": "Credit Limit Increase",
              "reference_id": "CR-2026-999",
              "requester": "Sunita Rao",
              "due_date": "10 Nov 2026",
              "amount": "₹ 25,00,000",
              "status": "Pending"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/approvals/client")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(frontendPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.client_name").value("Apex Global Systems"))
                .andExpect(jsonPath("$.data.amount").value("₹ 25,00,000"))
                .andExpect(jsonPath("$.data.status").value("Pending"))
                .andExpect(jsonPath("$.data.approval_id").exists())
                .andExpect(jsonPath("$.data.request_date").exists())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        long createdId = root.path("data").path("id").asLong();
        assertThat(createdId).isGreaterThan(0);
    }

    @Test
    @DisplayName("Validation: POST approval with missing required field returns 400 Bad Request with field errors")
    void testMissingFieldReturns400() throws Exception {
        String invalidPayload = """
            {
              "request_type": "Sick Leave",
              "duration": "1 day"
            }
            """;

        mockMvc.perform(post("/api/v1/approvals/employee")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.fieldErrors.employeeName").exists())
                .andExpect(jsonPath("$.fieldErrors.employeeCode").exists());
    }
}
