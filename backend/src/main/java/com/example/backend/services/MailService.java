package com.example.backend.services;

import org.springframework.web.client.RestClient;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.example.backend.dto.request.OTPMailRequest;
import com.example.backend.dto.request.SubscriptionReminderMailRequest;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final String EMAIL_VERIFICATION_SUBJECT =
            "[BentoX] Verification Email Guide";

    private static final String SUBSCRIPTION_REMINDER_SUBJECT =
            "[BentoX] Subscription Renewal Reminder";

    private final RestClient restClient;
    private final OTPService otpService;
    private final TemplateEngine templateEngine;

    @Value("${brevo.sender_email}")
    private String senderEmail;

    @Value("${brevo.sender_name}")
    private String senderName;

    public MailService(
            @Value("${brevo.mail_base_url}") String baseUrl,
            @Value("${brevo.api_key}") String apiKey,
            OTPService otpService,
            TemplateEngine templateEngine) {

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("accept", "application/json")
                .defaultHeader("api-key", apiKey)
                .build();

        this.otpService = otpService;
        this.templateEngine = templateEngine;
    }

    // ===================== OTP MAIL =====================

    public void sendOTPMail(OTPMailRequest otpMailRequest) {

        String otp = otpService.generateOTPCode(otpMailRequest.getMail());
        String htmlContent = generateHtmlContentOTPMail(
                otpMailRequest.getName(), otp);

        sendMail(
                otpMailRequest.getMail(),
                otpMailRequest.getName(),
                EMAIL_VERIFICATION_SUBJECT,
                htmlContent
        );
    }

    // ===================== SUBSCRIPTION REMINDER =====================

    public void sendSubscriptionReminderMail(
            SubscriptionReminderMailRequest request) {

        Context context = new Context();
        context.setVariable("name", request.getName());
        context.setVariable("packageName", request.getPackageName());
        context.setVariable("endDate", request.getEndDate());
        context.setVariable("renewLink", request.getRenewLink());
        context.setVariable("year", java.time.Year.now().getValue());

        String htmlContent =
                templateEngine.process("subscriptionReminder", context);

        sendMail(
                request.getMail(),
                request.getName(),
                SUBSCRIPTION_REMINDER_SUBJECT,
                htmlContent
        );
    }

    // ===================== COMMON SEND METHOD =====================

    private void sendMail(
            String toEmail,
            String toName,
            String subject,
            String htmlContent) {

        Map<String, Object> requestBody = Map.of(
                "sender", Map.of(
                        "email", senderEmail,
                        "name", senderName),
                "to", List.of(Map.of(
                        "email", toEmail,
                        "name", toName)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        ResponseEntity<String> response = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toEntity(String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException(
                    "Brevo send mail failed: " + response.getBody());
        }
    }

    private String generateHtmlContentOTPMail(String name, String otp) {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("otp", otp);
        return templateEngine.process("otpMail", context);
    }
}
