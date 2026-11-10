package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveTimesheetRequest {
    private String assignedApprover;
    private String approvedBy;
    private String notes;
    private String comments;

    public String getComments() {
        return comments != null ? comments : notes;
    }
}
