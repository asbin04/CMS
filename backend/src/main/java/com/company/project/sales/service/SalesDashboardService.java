package com.company.project.sales.service;

import com.company.project.sales.dto.dashboard.*;

public interface SalesDashboardService {

    SalesDashboardResponse getDashboard(String startDate, String endDate, String period);

    SalesDashboardKpisDto getKpis(String startDate, String endDate, String period);

    SalesPerformanceDto getPerformance(String startDate, String endDate, String period);

    SalesConversionFunnelDto getFunnel(String startDate, String endDate, String period);

    byte[] exportCsv(String startDate, String endDate, String period);
}

