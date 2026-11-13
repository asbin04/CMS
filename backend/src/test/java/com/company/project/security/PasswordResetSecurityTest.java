package com.company.project.security;

import com.company.project.security.dto.ForgotPasswordRequest;
import com.company.project.security.dto.ResetPasswordRequest;
import com.company.project.security.dto.VerifyOtpRequest;
import com.company.project.security.entity.AppUser;
import com.company.project.security.entity.PasswordResetOtp;
import com.company.project.security.repository.AppUserRepository;
import com.company.project.security.repository.PasswordResetOtpRepository;
import com.company.project.security.service.OtpCryptoService;
import com.company.project.security.service.PasswordResetRateLimiter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "app.auth.admin.allowed-emails=asbin.t.s@kalpanaaa.in,founder@kalpanaaasoftwaresolutions.in,akshit.ujjain@kalpanaaasoftwaresolutions.in,testreset@kalpanaaa.in")
class PasswordResetSecurityTest {

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
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpCryptoService cryptoService;

    @Autowired
    private PasswordResetRateLimiter rateLimiter;

    private static final String TEST_EMAIL = "testreset@kalpanaaa.in";
    private static final String INITIAL_PASSWORD = "OldPassword@123";

    @BeforeEach
    void setUp() {
        rateLimiter.reset(TEST_EMAIL, "127.0.0.1");

        Optional<AppUser> existing = userRepository.findByEmailIgnoreCase(TEST_EMAIL);
        AppUser user;
        if (existing.isPresent()) {
            user = existing.get();
            user.setPasswordHash(passwordEncoder.encode(INITIAL_PASSWORD));
            user.setStatus("ACTIVE");
            user = userRepository.save(user);
        } else {
            user = AppUser.builder()
                    .username("testreset")
                    .email(TEST_EMAIL)
                    .passwordHash(passwordEncoder.encode(INITIAL_PASSWORD))
                    .displayName("Test Reset User")
                    .role("ADMIN")
                    .status("ACTIVE")
                    .passwordChangedAt(Instant.now())
                    .build();
            user = userRepository.save(user);
        }

        otpRepository.invalidateAllActiveForUser(user, Instant.now());
    }

    @Test
    @DisplayName("1. Forgot password returns uniform 200 without leaking non-existent emails")
    void testForgotPasswordNonExistentEmailReturnsUniformMessage() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("nonexistent@domain.com");

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("If an account with that email exists, an OTP has been sent."));
    }

    @Test
    @DisplayName("2. Rate limiting prevents rapid repeated OTP requests")
    void testForgotPasswordRateLimiting() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest(TEST_EMAIL);

        // First request succeeds
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Immediate second request is rate-limited
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Please wait")));
    }

    @Test
    @DisplayName("3. Full Reset Flow: Request OTP -> Verify OTP -> Reset Password -> Login with New Password")
    void testCompletePasswordResetFlow() throws Exception {
        AppUser user = userRepository.findByEmailIgnoreCase(TEST_EMAIL).orElseThrow();

        // 1. Manually insert known OTP for test verification
        String testOtp = "849201";
        String otpHmac = cryptoService.computeHmacHex(testOtp);
        PasswordResetOtp otpEntity = PasswordResetOtp.builder()
                .user(user)
                .otpHash(otpHmac)
                .attempts(0)
                .maxAttempts(5)
                .expiresAt(Instant.now().plusSeconds(300))
                .clientIp("127.0.0.1")
                .build();
        otpRepository.save(otpEntity);

        // 2. Test wrong OTP
        VerifyOtpRequest wrongOtpReq = new VerifyOtpRequest(TEST_EMAIL, "000000");
        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wrongOtpReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Invalid OTP")));

        // 3. Test correct OTP
        VerifyOtpRequest correctOtpReq = new VerifyOtpRequest(TEST_EMAIL, testOtp);
        MvcResult verifyResult = mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(correctOtpReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.resetToken").isNotEmpty())
                .andReturn();

        JsonNode verifyNode = objectMapper.readTree(verifyResult.getResponse().getContentAsString());
        String resetToken = verifyNode.get("data").get("resetToken").asText();
        assertThat(resetToken).isNotEmpty();

        // 4. Test password matching old password
        ResetPasswordRequest sameAsOldReq = new ResetPasswordRequest(resetToken, INITIAL_PASSWORD, INITIAL_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sameAsOldReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("New password cannot be the same as your old password."));

        // 5. Test short password (< 12 chars)
        ResetPasswordRequest shortPwdReq = new ResetPasswordRequest(resetToken, "Short@1", "Short@1");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shortPwdReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.newPassword").value("Password must be between 12 and 72 characters"));

        // 6. Test password with no numbers/special
        ResetPasswordRequest noDigitReq = new ResetPasswordRequest(resetToken, "AllLettersPasswordHere", "AllLettersPasswordHere");
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noDigitReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password must contain both letters and numbers or symbols."));

        // 7. Successful reset with strong new password
        String newPassword = "NewStrongPassword@2026";
        ResetPasswordRequest validResetReq = new ResetPasswordRequest(resetToken, newPassword, newPassword);
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validResetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.message").value("Your password has been successfully reset. Please log in with your new password."));

        // 8. Re-using the same reset token must fail (token invalidated)
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validResetReq)))
                .andExpect(status().isBadRequest());

        // 9. Login with OLD password must FAIL (401)
        AuthController.LoginRequest oldLoginReq = new AuthController.LoginRequest(TEST_EMAIL, INITIAL_PASSWORD);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLoginReq)))
                .andExpect(status().isUnauthorized());

        // 10. Login with NEW password must SUCCEED (200)
        AuthController.LoginRequest newLoginReq = new AuthController.LoginRequest(TEST_EMAIL, newPassword);
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLoginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.email").value(TEST_EMAIL));
    }

    @Test
    @DisplayName("4. Non-admin or unallowlisted account cannot request OTP or verify OTP (generic response)")
    void testNonAdminCannotResetPassword() throws Exception {
        String nonAdminEmail = "nonadmin.reset@kalpanaaa.in";
        AppUser nonAdmin = userRepository.findByEmailIgnoreCase(nonAdminEmail)
                .orElseGet(() -> AppUser.builder()
                        .username("nonadmin.reset")
                        .email(nonAdminEmail)
                        .passwordHash(passwordEncoder.encode(INITIAL_PASSWORD))
                        .displayName("Non Admin")
                        .role("CEO")
                        .status("ACTIVE")
                        .passwordChangedAt(Instant.now())
                        .build());
        nonAdmin.setRole("CEO");
        nonAdmin.setStatus("ACTIVE");
        nonAdmin = userRepository.save(nonAdmin);
        rateLimiter.reset(nonAdminEmail, "127.0.0.1");

        long countBefore = otpRepository.count();

        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest(nonAdminEmail))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.message").value("If an account with that email exists, an OTP has been sent."));

        assertThat(otpRepository.count()).isEqualTo(countBefore);

        mockMvc.perform(post("/api/v1/auth/verify-otp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyOtpRequest(nonAdminEmail, "123456"))))
                .andExpect(status().isBadRequest());
    }
}
