package com.company.project.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "finance_cash_flow_counters", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinanceCashFlowCounterEntity {

    @Id
    @Column(name = "period_year", length = 10, nullable = false)
    private String periodYear;

    @Column(name = "last_number", nullable = false)
    private Integer lastNumber;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

