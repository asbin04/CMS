package com.company.project.attendance;

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
class AttendanceContractIntegrationTest {

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
    @DisplayName("Contract: POST exact frontend AddAttendanceModal JSON persists all fields and includes isLate/hasOvertime")
    void testCreateAttendanceFrontendPayload() throws Exception {
        // Exact payload shape AddAttendanceModal sends
        String frontendPayload = """
            {
              "employeeId": "EMP-9999",
              "employeeName": "Pooja Verma",
              "avatarInitials": "PV",
              "avatarColor": "amber",
              "attendanceDate": "31 Oct 2026",
              "status": "Present",
              "checkIn": "09:30 AM",
              "checkOut": "06:30 PM",
              "workHours": "8h 0m",
              "overtimeHours": "1h 0m",
              "workMinutes": 480,
              "overtimeMinutes": 60,
              "dayType": "Regular",
              "isLate": true,
              "hasOvertime": true,
              "notes": "Late by 30 mins due to commute"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(frontendPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.employeeName").value("Pooja Verma"))
                .andExpect(jsonPath("$.data.isLate").value(true))
                .andExpect(jsonPath("$.data.hasOvertime").value(true))
                .andExpect(jsonPath("$.data.workMinutes").value(480))
                .andExpect(jsonPath("$.data.overtimeMinutes").value(60))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String createdId = root.path("data").path("id").asText();
        assertThat(createdId).isNotEmpty();

        // Verify GET returns matching properties
        mockMvc.perform(get("/api/v1/attendance/" + createdId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(createdId))
                .andExpect(jsonPath("$.data.isLate").value(true))
                .andExpect(jsonPath("$.data.hasOvertime").value(true));

        // Cleanup
        mockMvc.perform(delete("/api/v1/attendance/" + createdId)
                .header("Authorization", adminToken));
    }

    @Test
    @DisplayName("Contract: PUT partial update and round-trip full object update from GET")
    void testUpdateAttendanceAndRoundTrip() throws Exception {
        String initialPayload = """
            {
              "employeeId": "EMP-8888",
              "employeeName": "Suresh Patel",
              "avatarInitials": "SP",
              "avatarColor": "blue",
              "attendanceDate": "31 Oct 2026",
              "status": "Present",
              "checkIn": "09:00 AM",
              "checkOut": "05:00 PM",
              "workHours": "8h 0m",
              "overtimeHours": "0h 0m",
              "dayType": "Regular",
              "isLate": false,
              "hasOvertime": false
            }
            """;

        MvcResult createRes = mockMvc.perform(post("/api/v1/attendance")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(initialPayload))
                .andExpect(status().isCreated())
                .andReturn();

        String createdId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 1. Partial update (UpdateAttendanceRequest: null fields leave unchanged)
        String partialUpdate = """
            {
              "status": "Overtime",
              "overtimeHours": "2h 0m",
              "hasOvertime": true
            }
            """;

        mockMvc.perform(put("/api/v1/attendance/" + createdId)
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(partialUpdate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Overtime"))
                .andExpect(jsonPath("$.data.hasOvertime").value(true))
                .andExpect(jsonPath("$.data.employeeName").value("Suresh Patel")); // Preserved!

        // 2. Full object update round-trip from GET
        MvcResult getRes = mockMvc.perform(get("/api/v1/attendance/" + createdId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode fullRecord = objectMapper.readTree(getRes.getResponse().getContentAsString()).path("data");
        mockMvc.perform(put("/api/v1/attendance/" + createdId)
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fullRecord.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(createdId));

        // Cleanup
        mockMvc.perform(delete("/api/v1/attendance/" + createdId)
                .header("Authorization", adminToken));
    }
}
