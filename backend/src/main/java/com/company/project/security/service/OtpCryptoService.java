package com.company.project.security.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class OtpCryptoService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] secretKeyBytes;

    public OtpCryptoService(@Value("${app.auth.otp.hmac-secret:c3VwZXItc2VjcmV0LW90cC1obWFjLWtleS1mb3ItY21zLXBvcnRhbC0yMDI2}") String secret) {
        this.secretKeyBytes = secret.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Generates a cryptographically secure 6-digit numeric OTP.
     */
    public String generateNumericOtp() {
        int code = secureRandom.nextInt(1_000_000);
        return String.format("%06d", code);
    }

    /**
     * Generates a cryptographically secure 32-byte (64 hex characters) reset token.
     */
    public String generateResetToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return HexFormat.of().formatHex(tokenBytes);
    }

    /**
     * Computes HMAC-SHA256 of the input data using the server secret key.
     */
    public String computeHmacHex(String data) {
        if (data == null) {
            return null;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secretKeyBytes, HMAC_SHA256));
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmacBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to calculate HMAC-SHA256", e);
        }
    }

    /**
     * Performs a constant-time comparison to prevent timing attacks.
     */
    public boolean verifyHmac(String rawInput, String expectedHmacHex) {
        if (rawInput == null || expectedHmacHex == null) {
            return false;
        }
        String computed = computeHmacHex(rawInput);
        return MessageDigest.isEqual(
                computed.getBytes(StandardCharsets.UTF_8),
                expectedHmacHex.getBytes(StandardCharsets.UTF_8)
        );
    }
}

