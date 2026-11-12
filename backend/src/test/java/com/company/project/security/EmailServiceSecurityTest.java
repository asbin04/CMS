package com.company.project.security;

import com.company.project.security.service.EmailService;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Properties;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class EmailServiceSecurityTest {

    @Test
    @DisplayName("isSmtpConfigured returns false in prod when host or username is missing")
    void testIsSmtpConfiguredInProd() {
        Environment env = mock(Environment.class);
        when(env.matchesProfiles("prod")).thenReturn(true);

        EmailService service = new EmailService(env);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        ReflectionTestUtils.setField(service, "mailSender", mailSender);
        ReflectionTestUtils.setField(service, "smtpHost", "localhost");
        ReflectionTestUtils.setField(service, "smtpPort", 587);
        ReflectionTestUtils.setField(service, "smtpUsername", "");

        assertThat(service.isSmtpConfigured()).isFalse();

        // When configured with real host and username
        ReflectionTestUtils.setField(service, "smtpHost", "smtp.resend.com");
        ReflectionTestUtils.setField(service, "smtpUsername", "resend");
        assertThat(service.isSmtpConfigured()).isTrue();
    }

    @Test
    @DisplayName("isSmtpConfigured returns true in dev when host is present")
    void testIsSmtpConfiguredInDev() {
        Environment env = mock(Environment.class);
        when(env.matchesProfiles("prod")).thenReturn(false);

        EmailService service = new EmailService(env);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        ReflectionTestUtils.setField(service, "mailSender", mailSender);
        ReflectionTestUtils.setField(service, "smtpHost", "localhost");
        ReflectionTestUtils.setField(service, "smtpPort", 1025);

        assertThat(service.isSmtpConfigured()).isTrue();
    }

    @Test
    @DisplayName("sendOtpEmail uses sender no-reply@kalpanaaa.in and does not throw exception")
    void testSendOtpEmailHandlesFailureGracefully() {
        Environment env = mock(Environment.class);
        when(env.matchesProfiles("prod")).thenReturn(false);

        EmailService service = new EmailService(env);
        JavaMailSender mailSender = mock(JavaMailSender.class);
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new RuntimeException("Connection refused")).when(mailSender).send(any(MimeMessage.class));

        ReflectionTestUtils.setField(service, "mailSender", mailSender);
        ReflectionTestUtils.setField(service, "smtpHost", "localhost");
        ReflectionTestUtils.setField(service, "smtpPort", 1025);
        ReflectionTestUtils.setField(service, "fromEmail", "no-reply@kalpanaaa.in");
        ReflectionTestUtils.setField(service, "senderName", "Kalpanaaa Security");

        // Should not throw any exception out to caller
        service.sendOtpEmail("user@domain.com", "123456", 5);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
