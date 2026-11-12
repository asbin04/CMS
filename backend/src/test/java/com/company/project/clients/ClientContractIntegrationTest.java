package com.company.project.clients;

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
class ClientContractIntegrationTest {

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
    @DisplayName("Contract: POST exact frontend AddClientModal JSON creates client and persists all fields")
    void testCreateClientFrontendPayload() throws Exception {
        // Exact payload shape AddClientModal sends
        String frontendCreateJson = """
            {
              "clientName": "Test Contract Innovations",
              "companyName": "Contract Innovations Pvt Ltd",
              "industry": "Information Technology",
              "contactPerson": "Rohan Gupta",
              "email": "rohan.contract@example.com",
              "phone": "+91 98765 43210",
              "country": "India",
              "city": "Bengaluru",
              "clientType": "Enterprise",
              "accountOwner": "Akshit Ujjain",
              "status": "Active",
              "creditLimit": 1500000.00,
              "onboardingDate": "2026-11-02",
              "notes": "Contract test notes"
            }
            """;

        MvcResult result = mockMvc.perform(post("/api/v1/clients")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(frontendCreateJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.clientName").value("Test Contract Innovations"))
                .andExpect(jsonPath("$.data.companyName").value("Contract Innovations Pvt Ltd"))
                .andExpect(jsonPath("$.data.contactPerson").value("Rohan Gupta"))
                .andExpect(jsonPath("$.data.email").value("rohan.contract@example.com"))
                .andExpect(jsonPath("$.data.creditLimit").value(1500000.00))
                .andExpect(jsonPath("$.data.status").value("Active"))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String createdId = root.path("data").path("id").asText();
        assertThat(createdId).isNotEmpty();

        // Verify GET returns the identical persisted fields
        mockMvc.perform(get("/api/v1/clients/" + createdId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(createdId))
                .andExpect(jsonPath("$.data.clientName").value("Test Contract Innovations"))
                .andExpect(jsonPath("$.data.creditLimit").value(1500000.00));

        // Cleanup
        mockMvc.perform(delete("/api/v1/clients/" + createdId)
                .header("Authorization", adminToken));
    }

    @Test
    @DisplayName("Contract: PUT exact frontend update JSON updates client and PUT full object from GET works")
    void testUpdateClientAndRoundTrip() throws Exception {
        // Create first
        String initialJson = """
            {
              "clientName": "Roundtrip Corp",
              "companyName": "Roundtrip Corp Ltd",
              "industry": "Finance",
              "contactPerson": "Pooja Mehta",
              "email": "pooja.roundtrip@example.com",
              "phone": "+91 98765 11111",
              "country": "India",
              "city": "Mumbai",
              "clientType": "Corporate",
              "accountOwner": "Akshit Ujjain",
              "status": "Active",
              "creditLimit": 500000.00,
              "notes": "Initial"
            }
            """;

        MvcResult createRes = mockMvc.perform(post("/api/v1/clients")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(initialJson))
                .andExpect(status().isCreated())
                .andReturn();

        String createdId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 1. Partial update (UpdateClientRequest: null means leave unchanged)
        String updateJson = """
            {
              "clientName": "Roundtrip Corp Updated",
              "creditLimit": 750000.00,
              "notes": "Updated note"
            }
            """;

        mockMvc.perform(put("/api/v1/clients/" + createdId)
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.clientName").value("Roundtrip Corp Updated"))
                .andExpect(jsonPath("$.data.creditLimit").value(750000.00))
                .andExpect(jsonPath("$.data.companyName").value("Roundtrip Corp Ltd")) // Preserved!
                .andExpect(jsonPath("$.data.contactPerson").value("Pooja Mehta")); // Preserved!

        // 2. Fetch full object from GET and PUT it back as a full object update
        MvcResult getRes = mockMvc.perform(get("/api/v1/clients/" + createdId)
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode fullClient = objectMapper.readTree(getRes.getResponse().getContentAsString()).path("data");
        mockMvc.perform(put("/api/v1/clients/" + createdId)
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(fullClient.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(createdId))
                .andExpect(jsonPath("$.data.clientName").value("Roundtrip Corp Updated"));

        // Cleanup
        mockMvc.perform(delete("/api/v1/clients/" + createdId)
                .header("Authorization", adminToken));
    }

    @Test
    @DisplayName("Validation: Malformed string for creditLimit returns 400 Bad Request")
    void testMalformedStringCreditLimitReturns400() throws Exception {
        String invalidJson = """
            {
              "clientName": "Bad Credit Client",
              "companyName": "Bad Credit Ltd",
              "industry": "IT",
              "contactPerson": "Alice",
              "email": "alice@example.com",
              "phone": "+91 98765 43210",
              "country": "India",
              "city": "Delhi",
              "clientType": "Standard",
              "accountOwner": "Akshit",
              "status": "Active",
              "creditLimit": "not-a-number-amount"
            }
            """;

        mockMvc.perform(post("/api/v1/clients")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Validation: 13-digit amount for creditLimit returns 400 Bad Request with field errors")
    void test13DigitCreditLimitReturns400() throws Exception {
        // 13 integer digits: 1000000000000.00 exceeds @Digits(integer = 12, fraction = 2)
        String invalidJson = """
            {
              "clientName": "Huge Credit Client",
              "companyName": "Huge Credit Ltd",
              "industry": "IT",
              "contactPerson": "Bob",
              "email": "bob@example.com",
              "phone": "+91 98765 43210",
              "country": "India",
              "city": "Delhi",
              "clientType": "Standard",
              "accountOwner": "Akshit",
              "status": "Active",
              "creditLimit": 1000000000000.00
            }
            """;

        mockMvc.perform(post("/api/v1/clients")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.fieldErrors.creditLimit").exists());
    }

    @Test
    @DisplayName("Validation: Negative creditLimit returns 400 Bad Request")
    void testNegativeCreditLimitReturns400() throws Exception {
        String invalidJson = """
            {
              "clientName": "Negative Credit Client",
              "companyName": "Negative Credit Ltd",
              "industry": "IT",
              "contactPerson": "Charlie",
              "email": "charlie@example.com",
              "phone": "+91 98765 43210",
              "country": "India",
              "city": "Delhi",
              "clientType": "Standard",
              "accountOwner": "Akshit",
              "status": "Active",
              "creditLimit": -100.00
            }
            """;

        mockMvc.perform(post("/api/v1/clients")
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.fieldErrors.creditLimit").exists());
    }
}
