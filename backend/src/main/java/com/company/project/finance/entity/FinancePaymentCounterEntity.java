package com.company.project.finance.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "finance_payment_counter", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancePaymentCounterEntity {

    @Id
    @Column(name = "year_month", length = 10, nullable = false)
    private String yearMonth;

    @Column(name = "last_number", nullable = false)
    private Integer lastNumber;
}

