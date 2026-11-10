package com.company.project.projects.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UiuxFilterOptionsResponse {
    private List<String> projects;
    private List<String> designTypes;
    private List<String> approvalStatuses;
    private List<String> statuses;
    private List<String> designers;
}

