package com.company.project.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionControlRecordDto {
    private String id;
    private String primaryLabel;
    private String secondaryLabel;
    private LocalDate date;
    private String invoiceId;
    private String clientId;
    private String clientName;
    private BigDecimal amount;
    private String metricDisplay;
    private String modeOrReference;
    private String referenceSub;
    private String status;
    private String checkDetail;
    private String actionLabel;
    private String actionPath;
}

