package com.company.project.projects.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScopeFreezeRequest {
    @NotNull(message = "scopeFreeze flag is required")
    private Boolean scopeFreeze;
    private String reason;
}

