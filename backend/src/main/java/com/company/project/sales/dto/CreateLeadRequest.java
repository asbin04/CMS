package com.company.project.sales.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class CreateLeadRequest {

    private LocalDate leadDate;

    @NotBlank(message = "Company name is required")
    @Size(max = 255)
    private String company;

    @NotBlank(message = "Contact name is required")
    @Size(max = 255)
    @Pattern(
        regexp = "^(?=[^0-9]*$)(?=[\\s.'-]*\\p{L})[\\p{L}\\s.'-]+$",
        message = "Name must contain letters only. Numbers and special characters are not allowed."
    )
    private String contactName;

    @NotBlank(message = "Email is required")
    @Pattern(
        regexp = "^(?!.*\\.\\.)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\\.[a-zA-Z]{2,}$",
        message = "Enter a valid email address."
    )
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^[6-9]\\d{9}$",
        message = "Enter a valid 10-digit Indian mobile number."
    )
    private String phone;

    @NotBlank(message = "Lead source is required")
    private String source;

    @NotBlank(message = "Service interest is required")
    private String serviceInterest;

    @NotBlank(message = "Country is required")
    private String country;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Owner is required")
    private String ownerId;

    @NotBlank(message = "Stage is required")
    private String stage;

    @NotBlank(message = "Status is required")
    private String status;

    private LocalDate nextFollowUp;

    @DecimalMin(value = "0.0", inclusive = true, message = "Estimated value must be non-negative")
    private BigDecimal estimatedValue;

    @Min(value = 0, message = "Lead score must be at least 0")
    @Max(value = 100, message = "Lead score must be at most 100")
    private Integer leadScore;

    private BigDecimal expectedValue;
    private LocalDate expectedCloseDate;
    private String lostReason;
    private String notes;
}
