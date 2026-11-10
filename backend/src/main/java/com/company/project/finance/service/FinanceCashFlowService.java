package com.company.project.finance.service;

import com.company.project.common.response.PageResponse;
import com.company.project.finance.dto.*;

public interface FinanceCashFlowService {

    PageResponse<CashFlowResponse> getCashFlows(
            String search,
            String period,
            String status,
            String sort,
            int page,
            int size
    );

    CashFlowResponse getCashFlowById(String idOrCashFlowId);

    CashFlowKpisResponse getKpis();

    CashFlowTrendsResponse getTrends();

    SuggestedOpeningCashResponse getSuggestedOpeningCash(String periodOrPeriodCode);

    NextCashFlowIdResponse getNextId(String year);

    CashFlowResponse createCashFlow(CreateCashFlowRequest request, String username);

    CashFlowResponse updateCashFlow(String idOrCashFlowId, UpdateCashFlowRequest request, String username);

    void deleteCashFlow(String idOrCashFlowId, String username);

    byte[] exportCashFlowsToCsv(String search, String period, String status);
}

