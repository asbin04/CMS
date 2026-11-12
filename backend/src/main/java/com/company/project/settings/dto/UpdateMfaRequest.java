package com.company.project.settings.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMfaRequest {

    @NotNull(message = "enabled flag is required")
    private Boolean enabled;

    @Size(max = 50, message = "MFA method cannot exceed 50 characters")
    private String method;
}

