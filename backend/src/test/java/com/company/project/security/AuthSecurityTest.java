package com.company.project.security;

import com.company.project.dashboard.dto.CeoDashboardUpdateRequest;
import com.company.project.dashboard.entity.DashboardSettings;
import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthSecurityTest {

    static {
        File[] envFiles = new File[] { new File(".env"), new File("backend/.env"), new File("../.env") };
        for (File envFile : envFiles) {
            if (envFile.exists()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#"))
                            continue;
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
                } catch (Exception ignored) {
                }
                break;
            }
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private LoginRateLimiter rateLimiter;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AppUserRepository userRepository;

    @Value("${app.auth.admin.username:${ADMIN_USERNAME:asbin.t.s@kalpanaaa.in}}")
    private String adminUsername;

    @Value("${app.auth.admin.password:${ADMIN_PASSWORD:Admin123}}")
    private String adminPassword;

    @Value("${app.auth.jwt.secret:${JWT_SECRET:}}")
    private String jwtSecret;

    private String validNonAdminToken;
    private String validAdminToken;

    @BeforeEach
    void setUp() {
        rateLimiter.clearAll();

        AppUser nonAdmin = userRepository.findByEmailIgnoreCase("valid.user@kalpanaaa.in")
                .orElseGet(() -> AppUser.builder()
                        .username("valid.user")
                        .email("valid.user@kalpanaaa.in")
                        .passwordHash(passwordEncoder.encode("UserPass@123"))
                        .displayName("Regular User")
                        .role("CEO")
                        .status("ACTIVE")
                        .passwordChangedAt(Instant.now())
                        .build());
        nonAdmin.setPasswordHash(passwordEncoder.encode("UserPass@123"));
        nonAdmin.setRole("CEO");
        nonAdmin.setStatus("ACTIVE");
        userRepository.save(nonAdmin);

        validNonAdminToken = "Bearer " + jwtTokenProvider.generateToken("valid.user@kalpanaaa.in", "CEO");
        validAdminToken = "Bearer " + jwtTokenProvider.generateToken(adminUsername, "ADMIN");
    }

    @Test
    @DisplayName("Admin 1: asbin.t.s@kalpanaaa.in logs in with Admin123 and receives ADMIN role")
    void testAsbinAdminLoginSuccess() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest("asbin.t.s@kalpanaaa.in", "Admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.email").value("asbin.t.s@kalpanaaa.in"));
    }

    @Test
    @DisplayName("Admin 2: founder@kalpanaaasoftwaresolutions.in logs in with Admin123 and receives ADMIN role")
    void testFounderAdminLoginSuccess() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest("founder@kalpanaaasoftwaresolutions.in",
                "Admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.name").value("Gaurav Kumar Tripathi"))
                .andExpect(jsonPath("$.data.email").value("founder@kalpanaaasoftwaresolutions.in"));
    }

    @Test
    @DisplayName("Admin 3: akshit.ujjain@kalpanaaasoftwaresolutions.in logs in with Admin123 and receives ADMIN role")
    void testAkshitAdminLoginSuccess() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest(
                "akshit.ujjain@kalpanaaasoftwaresolutions.in", "Admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.email").value("akshit.ujjain@kalpanaaasoftwaresolutions.in"));
    }

    @Test
    @DisplayName("All three authorized admins can access protected ADMIN operations")
    void testAllThreeAdminsCanAccessAdminEndpoints() throws Exception {
        String[] adminEmails = {
                "asbin.t.s@kalpanaaa.in",
                "founder@kalpanaaasoftwaresolutions.in",
                "akshit.ujjain@kalpanaaasoftwaresolutions.in"
        };

        for (String email : adminEmails) {
            String token = "Bearer " + jwtTokenProvider.generateToken(email, "ADMIN");
            mockMvc.perform(post("/api/v1/contracts/reset")
                    .header("Authorization", token))
                    .andExpect(status().isOk());
        }
    }

    @Test
    @DisplayName("Unauthorized email is rejected with 401 Unauthorized")
    void testUnauthorizedUserLoginRejected() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest("unauthorized.person@external.com",
                "Admin123");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Unauthenticated request to protected /api/v1/dashboard/ceo returns 401 Unauthorized")
    void testUnauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/ceo"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Public actuator health check returns 200 without authentication")
    void testActuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Authentication endpoint /api/v1/auth/login is public and returns valid JWT for configured admin")
    void testLoginEndpointIsPublicAndReturnsToken() throws Exception {
        AuthController.LoginRequest request = new AuthController.LoginRequest(adminUsername, adminPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Old default admin credentials return 401 Unauthorized")
    void testOldDefaultCredentialsReturn401() throws Exception {
        AuthController.LoginRequest oldReq = new AuthController.LoginRequest("admin", "Admin#SecurePass123!");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(oldReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("Login with blank username always returns 400 Bad Request in every profile")
    void testBlankUsernameReturns400() throws Exception {
        AuthController.LoginRequest blankUser = new AuthController.LoginRequest("", adminPassword);

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankUser)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Login with blank password always returns 400 Bad Request in every profile")
    void testBlankPasswordReturns400() throws Exception {
        AuthController.LoginRequest blankPass = new AuthController.LoginRequest(adminUsername, "");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(blankPass)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("Login rate limiting: max 5 failed attempts per username+IP returns 429 Too Many Requests")
    void testLoginRateLimitingMax5FailedAttempts() throws Exception {
        AuthController.LoginRequest invalidReq = new AuthController.LoginRequest(adminUsername, "WrongPassword123!");

        // 1st to 4th failed attempts return 401
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidReq)))
                    .andExpect(status().isUnauthorized());
        }

        // 5th failed attempt reaches the threshold -> returns 429
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));

        // 6th attempt is blocked immediately -> returns 429
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    @DisplayName("Valid non-admin account cannot log in (403 Forbidden) and wrong password returns 401")
    void testValidNonAdminLoginReturns403AndWrongPasswordReturns401() throws Exception {
        AuthController.LoginRequest validNonAdmin = new AuthController.LoginRequest("valid.user@kalpanaaa.in", "UserPass@123");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validNonAdmin)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Access restricted to administrators"));

        AuthController.LoginRequest wrongPassNonAdmin = new AuthController.LoginRequest("valid.user@kalpanaaa.in", "WrongPassword123!");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPassNonAdmin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("Unknown email and wrong password both fail with the same generic 401 response")
    void testUnknownEmailAndWrongPasswordSameGenericResponse() throws Exception {
        AuthController.LoginRequest unknownReq = new AuthController.LoginRequest("unknown.person@external.com", "Admin123");
        AuthController.LoginRequest wrongPassReq = new AuthController.LoginRequest(adminUsername, "WrongPassword123!");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(unknownReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongPassReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("No public registration or signup endpoint exists")
    void testNoRegistrationEndpointExists() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@example.com\",\"password\":\"Password@123\"}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@example.com\",\"password\":\"Password@123\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT secret shorter than 32 bytes fails fast on startup")
    void testShortJwtSecretFailsFast() {
        assertThatThrownBy(() -> new JwtTokenProvider("too-short-secret", 14400000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    @DisplayName("Protected endpoints and /reset require ROLE_ADMIN (non-admin gets 403, admin gets 200)")
    void testDeleteAndResetRequireAdminRole() throws Exception {
        // Non-admin role attempting to reset contracts -> 403 Forbidden
        mockMvc.perform(post("/api/v1/contracts/reset")
                .header("Authorization", validNonAdminToken))
                .andExpect(status().isForbidden());

        // Non-admin role attempting to DELETE contract -> 403 Forbidden
        mockMvc.perform(delete("/api/v1/contracts/999999")
                .header("Authorization", validNonAdminToken))
                .andExpect(status().isForbidden());

        // Non-admin role attempting to access /api/v1/auth/me -> 403 Forbidden
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", validNonAdminToken))
                .andExpect(status().isForbidden());

        // ADMIN role attempting reset -> succeeds (200 OK)
        mockMvc.perform(post("/api/v1/contracts/reset")
                .header("Authorization", validAdminToken))
                .andExpect(status().isOk());

        // ADMIN role attempting /api/v1/auth/me -> succeeds (200 OK)
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Authenticated admin accesses /api/v1/dashboard/sidebar/counts")
    void testAuthenticatedSidebarCounts() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/sidebar/counts")
                .header("Authorization", validAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pendingApprovals").isNumber())
                .andExpect(jsonPath("$.data.overdueFollowUps").isNumber());
    }

    @Test
    @DisplayName("PUT /api/v1/dashboard/ceo with valid admin token updates settings")
    void testUpdateDashboardSettings() throws Exception {
        DashboardSettings updateSettings = new DashboardSettings();
        updateSettings.setCompanyName("KALPANAAA SOFTWARE SOLUTIONS");
        updateSettings.setDashboardTitle("CEO Dashboard");

        CeoDashboardUpdateRequest request = new CeoDashboardUpdateRequest();
        request.setSettings(updateSettings);

        mockMvc.perform(put("/api/v1/dashboard/ceo")
                .header("Authorization", validAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.settings.company_name").value("KALPANAAA SOFTWARE SOLUTIONS"));
    }

    @Test
    @DisplayName("POST /api/v1/collections/invoices/INV-2024-001/reminders logs reminder for admin")
    void testSendReminderEndpoint() throws Exception {
        Map<String, Object> reminderRequest = Map.of(
                "channels", Map.of("email", true, "whatsapp", true),
                "template", "Standard Overdue Notice",
                "recipient", "finance@example.com");

        mockMvc.perform(post("/api/v1/collections/invoices/INV-2024-001/reminders")
                .header("Authorization", validAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reminderRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/v1/collections/invoices/INV-2024-001/communications logs communication history for admin")
    void testLogCommunicationEndpoint() throws Exception {
        Map<String, Object> commRequest = Map.of(
                "communicationType", "EMAIL",
                "recipient", "finance@acme.com",
                "subject", "Payment Reminder for INV-2024-001",
                "message", "Please settle the outstanding balance.");

        mockMvc.perform(post("/api/v1/collections/invoices/INV-2024-001/communications")
                .header("Authorization", validAdminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Tampered and expired JWT tokens are rejected with 401 Unauthorized")
    void testInvalidAndExpiredTokensReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/ceo")
                .header("Authorization", "Bearer invalid.fake.token"))
                .andExpect(status().isUnauthorized());

        String expiredJwt = Jwts.builder()
                .setSubject(adminUsername)
                .claim("role", "ADMIN")
                .setIssuedAt(Date.from(Instant.now().minusSeconds(7200)))
                .setExpiration(Date.from(Instant.now().minusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        mockMvc.perform(get("/api/v1/dashboard/ceo")
                .header("Authorization", "Bearer " + expiredJwt))
                .andExpect(status().isUnauthorized());
    }
}
