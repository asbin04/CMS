package com.company.project.projects.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RejectTimesheetRequest {

    @NotBlank(message = "Rejection reason is required")
    @JsonAlias({"reason", "notes", "comment", "comments"})
    private String rejectionReason;

    @JsonProperty("reason")
    public void setReason(String reason) {
        if (reason != null && !reason.isBlank()) {
            this.rejectionReason = reason;
        }
    }
}

