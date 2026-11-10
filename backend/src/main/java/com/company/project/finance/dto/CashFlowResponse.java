package com.company.project.finance.dto;

import com.company.project.finance.entity.FinanceCashFlowEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashFlowResponse {

    private Long id;
    private String cashFlowId;
    private String period;
    private String periodCode;

    private BigDecimal openingCash;
    private BigDecimal collections;
    private BigDecimal otherInflows;
    private BigDecimal totalInflows;

    private BigDecimal vendorPayments;
    private BigDecimal payrollPayments;
    private BigDecimal operatingExpenses;
    private BigDecimal otherOutflows;
    private BigDecimal totalOutflows;

    private BigDecimal netCashFlow;
    private BigDecimal closingCash;

    private String status;
    private String notes;

    private String createdBy;
    private String updatedBy;
    private Instant createdAt;
    private Instant updatedAt;

    public static CashFlowResponse fromEntity(FinanceCashFlowEntity entity) {
        if (entity == null) return null;
        return CashFlowResponse.builder()
                .id(entity.getId())
                .cashFlowId(entity.getCashFlowId())
                .period(entity.getPeriod())
                .periodCode(entity.getPeriodCode())
                .openingCash(entity.getOpeningCash())
                .collections(entity.getCollections())
                .otherInflows(entity.getOtherInflows())
                .totalInflows(entity.getTotalInflows())
                .vendorPayments(entity.getVendorPayments())
                .payrollPayments(entity.getPayrollPayments())
                .operatingExpenses(entity.getOperatingExpenses())
                .otherOutflows(entity.getOtherOutflows())
                .totalOutflows(entity.getTotalOutflows())
                .netCashFlow(entity.getNetCashFlow())
                .closingCash(entity.getClosingCash())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

