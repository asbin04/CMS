package com.company.project.projects.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UatFilterOptionsResponse {
    private List<String> projects;
    private List<String> statuses;
    private List<String> clientApprovals;
    private List<String> testers;
}

