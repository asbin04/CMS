package com.company.project.projects.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCodeReviewStatusRequest {

    @NotBlank(message = "Code review status is required")
    @Size(max = 50, message = "Code review status cannot exceed 50 characters")
    private String codeReviewStatus;
}

