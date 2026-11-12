package com.company.project.dashboard.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.ContractDto;
import com.company.project.dashboard.dto.ContractSummaryDto;
import com.company.project.dashboard.dto.CreateContractRequest;
import com.company.project.dashboard.entity.Contract;
import com.company.project.dashboard.repository.ContractRepository;
import com.company.project.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    public ContractServiceImpl(
            ContractRepository contractRepository,
            @Nullable NotificationService notificationService) {
        this.contractRepository = contractRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractDto> getAllContracts(
            String clientId,
            String proposalId,
            String contractType,
            String status,
            String search
    ) {
        List<Contract> contracts = contractRepository.findAllByOrderByOrderIndexAscIdAsc();

        return contracts.stream()
                .filter(c -> clientId == null || clientId.equalsIgnoreCase("All") || clientId.isBlank()
                        || c.getClientId().equalsIgnoreCase(clientId))
                .filter(c -> proposalId == null || proposalId.equalsIgnoreCase("All") || proposalId.isBlank()
                        || (c.getProposalId() != null && c.getProposalId().equalsIgnoreCase(proposalId)))
                .filter(c -> contractType == null || contractType.equalsIgnoreCase("All") || contractType.isBlank()
                        || c.getContractType().equalsIgnoreCase(contractType))
                .filter(c -> status == null || status.equalsIgnoreCase("All") || status.isBlank()
                        || c.getStatus().equalsIgnoreCase(status))
                .filter(c -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return (c.getContractId() != null && c.getContractId().toLowerCase().contains(s))
                            || (c.getClientId() != null && c.getClientId().toLowerCase().contains(s))
                            || (c.getProposalId() != null && c.getProposalId().toLowerCase().contains(s))
                            || (c.getContractType() != null && c.getContractType().toLowerCase().contains(s));
                })
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContractSummaryDto getSummary() {
        long total = contractRepository.count();
        long active = contractRepository.countByStatusIgnoreCase("Active");
        long expiring = contractRepository.countByStatusIgnoreCase("Expiring");
        BigDecimal totalVal = contractRepository.sumTotalContractValue();
        if (totalVal == null) {
            totalVal = BigDecimal.ZERO;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();

        long totalBefore = contractRepository.countBefore(startOfThisMonth);
        long activeBefore = contractRepository.countByStatusBefore("Active", startOfThisMonth);
        long expiringBefore = contractRepository.countByStatusBefore("Expiring", startOfThisMonth);
        BigDecimal totalValBefore = contractRepository.sumTotalContractValueBefore(startOfThisMonth);

        Double totalPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(total, totalBefore);
        Double activePct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(active, activeBefore);
        Double expiringPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(expiring, expiringBefore);
        Double totalValPct = com.company.project.common.util.TrendCalculationUtil.calculateMoMPercentage(totalVal, totalValBefore);

        return ContractSummaryDto.builder()
                .totalContracts(total)
                .totalContractsTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(totalPct))
                .activeContracts(active)
                .activeContractsTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(activePct))
                .expiringContracts(expiring)
                .expiringContractsTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(expiringPct))
                .totalContractValue(totalVal)
                .totalContractValueFormatted(formatIndianCurrency(totalVal))
                .totalContractValueTrend(com.company.project.common.util.TrendCalculationUtil.formatTrendString(totalValPct))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ContractDto getById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));
        return mapToDto(contract);
    }

    @Override
    @Transactional
    public ContractDto createContract(CreateContractRequest req) {
        String contractId = req.getContractId();
        if (contractId == null || contractId.isBlank()) {
            int year = java.time.LocalDate.now().getYear();
            long count = contractRepository.count() + 1;
            String candidate = String.format("C-%04d-%03d", year, count);
            while (contractRepository.existsByContractId(candidate)) {
                count++;
                candidate = String.format("C-%04d-%03d", year, count);
            }
            contractId = candidate;
        }

        Contract contract = Contract.builder()
                .contractId(contractId)
                .clientId(req.getClientId())
                .proposalId(req.getProposalId() != null ? req.getProposalId() : "-")
                .contractType(req.getContractType())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .renewalDate(req.getRenewalDate() != null ? req.getRenewalDate() : "-")
                .contractValue(req.getContractValue())
                .noticePeriod(req.getNoticePeriod() != null ? req.getNoticePeriod() : 30)
                .paymentTerms(req.getPaymentTerms() != null ? req.getPaymentTerms() : "Monthly")
                .status(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus() : "Active")
                .notes(req.getNotes())
                .orderIndex(req.getOrderIndex() != null ? req.getOrderIndex() : 0)
                .build();

        Contract saved = contractRepository.save(contract);
        if (notificationService != null) {
            notificationService.createNotification(
                    "New Contract Created",
                    "Contract " + saved.getContractId() + " (" + saved.getContractType() + ") was created.",
                    "CONTRACT",
                    "/sales/contracts"
            );
        }
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ContractDto updateContract(Long id, CreateContractRequest req) {
        Contract existing = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract not found with id: " + id));

        if (req.getClientId() != null) existing.setClientId(req.getClientId());
        if (req.getProposalId() != null) existing.setProposalId(req.getProposalId());
        if (req.getContractType() != null) existing.setContractType(req.getContractType());
        if (req.getStartDate() != null) existing.setStartDate(req.getStartDate());
        if (req.getEndDate() != null) existing.setEndDate(req.getEndDate());
        if (req.getRenewalDate() != null) existing.setRenewalDate(req.getRenewalDate());
        if (req.getContractValue() != null) existing.setContractValue(req.getContractValue());
        if (req.getNoticePeriod() != null) existing.setNoticePeriod(req.getNoticePeriod());
        if (req.getPaymentTerms() != null) existing.setPaymentTerms(req.getPaymentTerms());
        if (req.getStatus() != null) existing.setStatus(req.getStatus());
        if (req.getNotes() != null) existing.setNotes(req.getNotes());
        if (req.getOrderIndex() != null) existing.setOrderIndex(req.getOrderIndex());

        Contract updated = contractRepository.save(existing);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Contract Updated",
                    "Contract " + updated.getContractId() + " (" + updated.getStatus() + ") was updated.",
                    "CONTRACT",
                    "/sales/contracts"
            );
        }
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteContract(Long id) {
        if (!contractRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contract not found with id: " + id);
        }
        contractRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void resetSeedData() {
        contractRepository.deleteAllInBatch();

        List<Contract> seeds = new ArrayList<>();
        seeds.add(Contract.builder()
                .contractId("C-2025-001").clientId("C-001").proposalId("P-2025-001")
                .contractType("Service Agreement").startDate("15 Mar 2025").endDate("14 Mar 2026").renewalDate("14 Feb 2026")
                .contractValue(new BigDecimal("1200000.00")).noticePeriod(30).paymentTerms("Monthly").status("Active").orderIndex(1).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-002").clientId("C-003").proposalId("P-2025-002")
                .contractType("Project Contract").startDate("10 Mar 2025").endDate("09 Mar 2026").renewalDate("09 Feb 2026")
                .contractValue(new BigDecimal("850000.00")).noticePeriod(30).paymentTerms("Milestone").status("Active").orderIndex(2).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-003").clientId("C-002").proposalId("P-2025-003")
                .contractType("Support & Maintenance").startDate("01 Mar 2025").endDate("28 Feb 2026").renewalDate("28 Jan 2026")
                .contractValue(new BigDecimal("600000.00")).noticePeriod(15).paymentTerms("Quarterly").status("Expiring").orderIndex(3).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-004").clientId("C-005").proposalId("P-2025-004")
                .contractType("Software License").startDate("25 Feb 2025").endDate("24 Feb 2026").renewalDate("24 Jan 2026")
                .contractValue(new BigDecimal("475000.00")).noticePeriod(30).paymentTerms("Annual").status("Active").orderIndex(4).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-005").clientId("C-004").proposalId("P-2025-005")
                .contractType("Consulting Agreement").startDate("20 Feb 2025").endDate("19 Feb 2026").renewalDate("19 Jan 2026")
                .contractValue(new BigDecimal("1500000.00")).noticePeriod(60).paymentTerms("Monthly").status("Active").orderIndex(5).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-006").clientId("C-007").proposalId("P-2025-006")
                .contractType("Implementation Contract").startDate("15 Feb 2025").endDate("14 Feb 2026").renewalDate("14 Jan 2026")
                .contractValue(new BigDecimal("920000.00")).noticePeriod(30).paymentTerms("Milestone").status("Expiring").orderIndex(6).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-007").clientId("C-006").proposalId("P-2025-007")
                .contractType("Annual Maintenance").startDate("10 Feb 2025").endDate("09 Feb 2026").renewalDate("09 Jan 2026")
                .contractValue(new BigDecimal("540000.00")).noticePeriod(30).paymentTerms("Quarterly").status("Pending").orderIndex(7).build());

        seeds.add(Contract.builder()
                .contractId("C-2025-008").clientId("C-008").proposalId("P-2025-008")
                .contractType("Managed Services").startDate("01 Feb 2025").endDate("31 Jan 2026").renewalDate("31 Dec 2025")
                .contractValue(new BigDecimal("1800000.00")).noticePeriod(90).paymentTerms("Monthly").status("Terminated").orderIndex(8).build());

        String[] types = {
                "Service Agreement", "Project Contract", "Support & Maintenance", "Software License",
                "Consulting Agreement", "Implementation Contract", "Annual Maintenance", "Managed Services"
        };
        String[] paymentTermsArr = {"Monthly", "Milestone", "Quarterly", "Annual"};
        int[] noticePeriodsArr = {15, 30, 45, 60, 90};
        BigDecimal[] valuesArr = {
                new BigDecimal("350000.00"), new BigDecimal("420000.00"), new BigDecimal("580000.00"),
                new BigDecimal("650000.00"), new BigDecimal("720000.00"), new BigDecimal("800000.00"),
                new BigDecimal("950000.00"), new BigDecimal("1050000.00"), new BigDecimal("1150000.00"),
                new BigDecimal("1250000.00"), new BigDecimal("1350000.00"), new BigDecimal("1450000.00"),
                new BigDecimal("1600000.00"), new BigDecimal("1750000.00"), new BigDecimal("1900000.00"),
                new BigDecimal("2100000.00"), new BigDecimal("2400000.00"), new BigDecimal("2750000.00"),
                new BigDecimal("3000000.00"), new BigDecimal("3500000.00")
        };
        String[][] datePairs = {
                {"28 Jan 2025", "27 Jan 2026", "27 Dec 2025"},
                {"20 Jan 2025", "19 Jan 2026", "19 Dec 2025"},
                {"15 Jan 2025", "14 Jan 2026", "14 Dec 2025"},
                {"10 Jan 2025", "09 Jan 2026", "09 Dec 2025"},
                {"05 Jan 2025", "04 Jan 2026", "04 Dec 2025"},
                {"28 Dec 2024", "27 Dec 2025", "27 Nov 2025"},
                {"20 Dec 2024", "19 Dec 2025", "19 Nov 2025"},
                {"15 Dec 2024", "14 Dec 2025", "14 Nov 2025"},
                {"10 Dec 2024", "09 Dec 2025", "09 Nov 2025"},
                {"01 Dec 2024", "30 Nov 2025", "30 Oct 2025"},
                {"25 Nov 2024", "24 Nov 2025", "24 Oct 2025"},
                {"15 Nov 2024", "14 Nov 2025", "14 Oct 2025"},
                {"01 Nov 2024", "31 Oct 2025", "30 Sep 2025"},
                {"20 Oct 2024", "19 Oct 2025", "19 Sep 2025"},
                {"10 Oct 2024", "09 Oct 2025", "09 Sep 2025"},
                {"01 Oct 2024", "30 Sep 2025", "31 Aug 2025"}
        };

        for (int i = 9; i <= 72; i++) {
            String cId = String.format("C-2025-%03d", i);
            int clientNum = ((i - 1) % 18) + 1;
            String clId = String.format("C-%03d", clientNum);
            String pId = String.format("P-2025-%03d", i);
            String cType = types[(i - 1) % types.length];
            String st;
            if (i == 12 || i == 22 || i == 33 || i == 44 || i == 55 || i == 66) {
                st = "Expiring";
            } else if (i == 18 || i == 38 || i == 58) {
                st = "Pending";
            } else if (i == 28 || i == 48 || i == 68) {
                st = "Terminated";
            } else {
                st = "Active";
            }
            String[] dp = datePairs[(i - 1) % datePairs.length];
            BigDecimal val = valuesArr[(i - 1) % valuesArr.length];
            int np = noticePeriodsArr[(i - 1) % noticePeriodsArr.length];
            String pt = paymentTermsArr[(i - 1) % paymentTermsArr.length];

            seeds.add(Contract.builder()
                    .contractId(cId)
                    .clientId(clId)
                    .proposalId(pId)
                    .contractType(cType)
                    .startDate(dp[0])
                    .endDate(dp[1])
                    .renewalDate(dp[2])
                    .contractValue(val)
                    .noticePeriod(np)
                    .paymentTerms(pt)
                    .status(st)
                    .notes(cType + " for client " + clId + " with " + pt.toLowerCase() + " billing schedule.")
                    .orderIndex(i)
                    .build());
        }

        contractRepository.saveAll(seeds);
        log.info("Contract seed data initialized with {} contracts.", seeds.size());
    }

    private ContractDto mapToDto(Contract c) {
        return ContractDto.builder()
                .id(c.getId())
                .contractId(c.getContractId())
                .clientId(c.getClientId())
                .proposalId(c.getProposalId())
                .contractType(c.getContractType())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .renewalDate(c.getRenewalDate())
                .contractValue(c.getContractValue())
                .contractValueFormatted(formatIndianCurrency(c.getContractValue()))
                .noticePeriod(c.getNoticePeriod())
                .paymentTerms(c.getPaymentTerms())
                .status(c.getStatus())
                .notes(c.getNotes())
                .orderIndex(c.getOrderIndex())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private String formatIndianCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0";
        try {
            Locale inLocale = new Locale("en", "IN");
            NumberFormat nf = NumberFormat.getNumberInstance(inLocale);
            return "₹ " + nf.format(amount.longValue());
        } catch (Exception e) {
            return "₹ " + amount.toString();
        }
    }
}

