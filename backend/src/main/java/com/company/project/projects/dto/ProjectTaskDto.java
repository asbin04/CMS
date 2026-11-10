package com.company.project.projects.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectTaskDto {
    private String taskId;
    private String id;
    private String projectId;
    private String taskName;
    private String name;
    private Boolean billableDefault;
    private String status;
    private OffsetDateTime createdAt;

    public String getId() {
        return id != null ? id : taskId;
    }

    public String getName() {
        return name != null ? name : taskName;
    }
}
