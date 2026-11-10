package com.company.project.projects.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.OffsetDateTime;

@Entity
@Table(name = "project_module_counters", schema = "public")
@IdClass(ProjectModuleCounterEntity.ProjectModuleCounterId.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectModuleCounterEntity {

    @Id
    @Column(name = "entity_type", length = 50, nullable = false)
    private String entityType;

    @Id
    @Column(name = "period_key", length = 10, nullable = false)
    private String periodKey;

    @Column(name = "current_value", nullable = false)
    @Builder.Default
    private Long currentValue = 0L;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectModuleCounterId implements Serializable {
        private String entityType;
        private String periodKey;
    }
}

