package com.company.project.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancePaymentFilterOptionsResponse {
    private List<String> modes;
    private List<String> statuses;
    private List<ClientFilterOptionDto> clients;
    private List<String> months;
}

