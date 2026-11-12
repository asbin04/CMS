package com.company.project.security.service;

import jakarta.mail.internet.MimeMessage;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.lang.Nullable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

  private final JavaMailSender mailSender;
  private final Environment environment;

  @Getter
  @Value("${spring.mail.host:${SMTP_HOST:localhost}}")
  private String smtpHost;

  @Getter
  @Value("${spring.mail.port:${SMTP_PORT:1025}}")
  private int smtpPort;

  @Getter
  @Value("${spring.mail.username:${SMTP_USERNAME:}}")
  private String smtpUsername;

  @Getter
  @Value("${app.mail.from-email:${SMTP_FROM_EMAIL:no-reply@kalpanaaa.in}}")
  private String fromEmail;

  @Getter
  @Value("${app.mail.from-name:${SMTP_FROM_NAME:Kalpanaaa Security}}")
  private String senderName;

  @Autowired
  public EmailService(Environment environment, @Nullable JavaMailSender mailSender) {
    this.environment = environment;
    this.mailSender = mailSender;
  }

  public EmailService(Environment environment) {
    this(environment, null);
  }

  /**
   * Checks if the transactional SMTP provider is configured.
   * In production, requires non-empty host (other than localhost) and
   * credentials.
   * In dev/test, localhost with Mailpit is accepted.
   */
  public boolean isSmtpConfigured() {
    if (mailSender == null) {
      return false;
    }
    if (environment.matchesProfiles("prod")) {
      return smtpHost != null && !smtpHost.isBlank() && !"localhost".equalsIgnoreCase(smtpHost)
          && smtpUsername != null && !smtpUsername.isBlank();
    }
    return smtpHost != null && !smtpHost.isBlank();
  }

  /**
   * Emits a prominent startup warning if SMTP is not configured in production.
   */
  @EventListener(ApplicationReadyEvent.class)
  public void validateSmtpConfigurationOnStartup() {
    boolean isProd = environment.matchesProfiles("prod");
    if (isProd && !isSmtpConfigured()) {
      log.warn("================================================================================");
      log.warn("CRITICAL STARTUP WARNING: Transactional SMTP provider is NOT configured!");
      log.warn("Host: '{}', Port: '{}', Username: '{}'", smtpHost, smtpPort,
          (smtpUsername != null && !smtpUsername.isBlank() ? "configured" : "MISSING"));
      log.warn("Transactional emails (password resets, OTPs) will NOT reach users in production.");
      log.warn("Please configure SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD in production environment.");
      log.warn("================================================================================");
    } else {
      log.info("Transactional email service initialized with host='{}', port={}, sender='{}'",
          smtpHost, smtpPort, fromEmail);
    }
  }

  /**
   * Sends the OTP verification email asynchronously to the recipient.
   * Security Rule: Plaintext OTP is NEVER logged to disk or console under any
   * circumstances.
   */
  @Async
  public void sendOtpEmail(String recipientEmail, String otpCode, int expiryMinutes) {
    if (mailSender == null || (!isSmtpConfigured() && environment.matchesProfiles("prod"))) {
      log.warn("SMTP provider is not configured. Email dispatch to {} skipped.", recipientEmail);
      return;
    }

    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      String sender = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail : "no-reply@kalpanaaa.in";
      helper.setFrom(sender, senderName);
      helper.setTo(recipientEmail);
      helper.setSubject("Your Kalpanaaa CMS Password Reset OTP: " + otpCode);

      String htmlBody = buildOtpEmailHtml(otpCode, expiryMinutes);
      helper.setText(htmlBody, true);

      mailSender.send(message);
      log.info("Password reset OTP email dispatched successfully to recipient.");
    } catch (Exception ex) {
      log.error("Failed to send OTP email to recipient. Reason: {}", ex.getMessage());
      // Security Requirement: Never log the OTP code.
    }
  }

  private String buildOtpEmailHtml(String otpCode, int expiryMinutes) {
    return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset Request</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B; }
            .card { max-width: 480px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 8px 0; }
            .desc { font-size: 14px; color: #64748B; margin: 0; line-height: 1.5; }
            .otp-box { background: #EEF2FF; border: 1px dashed #6366F1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
            .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338CA; font-family: monospace; }
            .expiry-note { font-size: 13px; color: #64748B; text-align: center; margin-top: 8px; }
            .security-note { font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; padding-top: 16px; margin-top: 24px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1 class="title">Password Reset Verification</h1>
              <p class="desc">You recently requested to reset your password for your Kalpanaaa CMS account. Use the one-time code below to proceed.</p>
            </div>
            <div class="otp-box">
              <div class="otp-code">"""
        + otpCode + """
            </div>
                              <div class="expiry-note">This code expires in """ + expiryMinutes
        + """
            minutes.</div>
                           </div>
                           <div class="security-note">
                             If you did not request this password reset, please ignore this email or notify your system administrator immediately. This OTP can only be used once.
                           </div>
                         </div>
                       </body>
                       </html>
                       """;
  }
}
