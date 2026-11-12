package com.company.project.reports.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionControlCheckDto {
    private String id;
    private String control;
    private String description;
    private String classification;
    private long count;
    private String actionLabel;
    private String actionPath;
    private boolean nested;
    private String statusFilterLabel;
    private List<String> statusOptions;
    private List<TransactionControlRecordDto> records;
}

