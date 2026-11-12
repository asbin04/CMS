package com.company.project.settings.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppearanceRequest {

    @NotBlank(message = "Theme is required")
    @Pattern(regexp = "light|dark|system", message = "Theme must be light, dark, or system")
    private String theme;
}

