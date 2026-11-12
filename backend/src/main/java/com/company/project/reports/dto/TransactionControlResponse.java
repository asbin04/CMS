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
public class TransactionControlResponse {
    private boolean verificationAvailable;
    private String checkedAt;
    private String defaultSelectedCheckId;
    private List<TransactionControlCheckDto> checks;
}

