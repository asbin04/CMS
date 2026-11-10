package com.company.project.collections.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "collections_reversal_counters", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CollectionReversalCounterEntity.CounterId.class)
public class CollectionReversalCounterEntity {

    @Id
    @Column(name = "prefix", length = 10, nullable = false)
    private String prefix;

    @Id
    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "current_val", nullable = false)
    private Long currentVal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CounterId implements Serializable {
        private String prefix;
        private Integer year;
    }
}

