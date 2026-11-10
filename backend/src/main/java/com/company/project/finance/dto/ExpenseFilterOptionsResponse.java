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
public class ExpenseFilterOptionsResponse {
    private List<String> categories;
    private List<String> statuses;
    private List<String> projects;
    private List<String> months;
}

