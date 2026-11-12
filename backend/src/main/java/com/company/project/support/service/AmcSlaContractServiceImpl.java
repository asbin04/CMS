package com.company.project.support.service;

import com.company.project.support.dto.*;
import com.company.project.support.entity.AmcSlaContractEntity;
import com.company.project.support.repository.AmcSlaContractRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AmcSlaContractServiceImpl implements AmcSlaContractService {

    private final AmcSlaContractRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AmcSlaContractDto> getAllContracts(String search, String serviceType, String status, String renewalAlert) {
        return getAllContracts(search, serviceType, status, renewalAlert, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AmcSlaContractDto> getAllContracts(String search, String serviceType, String status, String renewalAlert, String owner, String renewalWindow) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanServiceType = (serviceType != null && !serviceType.trim().equalsIgnoreCase("all") && !serviceType.trim().isEmpty()) ? serviceType.trim() : null;
        String cleanStatus = (status != null && !status.trim().equalsIgnoreCase("all") && !status.trim().isEmpty()) ? status.trim() : null;
        String cleanRenewalAlert = (renewalAlert != null && !renewalAlert.trim().equalsIgnoreCase("all") && !renewalAlert.trim().isEmpty()) ? renewalAlert.trim() : null;
        String cleanOwner = (owner != null && !owner.trim().equalsIgnoreCase("all") && !owner.trim().isEmpty()) ? owner.trim() : null;
        String cleanWindow = (renewalWindow != null && !renewalWindow.trim().equalsIgnoreCase("all") && !renewalWindow.trim().isEmpty()) ? renewalWindow.trim() : null;

        List<AmcSlaContractDto> dtos = repository.searchContracts(cleanSearch, cleanServiceType, cleanStatus, cleanRenewalAlert, cleanOwner)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        if (cleanWindow != null) {
            String target = cleanWindow.replace("<=", "≤");
            dtos = dtos.stream()
                    .filter(d -> d.getRenewalWindow() != null && d.getRenewalWindow().replace("<=", "≤").equalsIgnoreCase(target))
                    .collect(Collectors.toList());
        }

        return dtos;
    }

    @Override
    @Transactional(readOnly = true)
    public AmcSlaKpiResponse getKpis() {
        List<AmcSlaContractEntity> all = repository.findAll();
        long total = all.size();
        long active = all.stream().filter(e -> "Active".equalsIgnoreCase(e.getStatus()) || "Expiring".equalsIgnoreCase(e.getStatus())).count();

        List<AmcSlaContractDto> allDtos = all.stream().map(this::mapToDto).collect(Collectors.toList());

        long overdue = allDtos.stream().filter(d -> "Overdue".equalsIgnoreCase(d.getRenewalWindow())).count();
        long dueSoon30 = allDtos.stream().filter(d -> "≤ 30 Days".equalsIgnoreCase(d.getRenewalWindow())).count();
        long upcoming31to90 = allDtos.stream().filter(d -> "31 – 90 Days".equalsIgnoreCase(d.getRenewalWindow())).count();
        long greater90 = allDtos.stream().filter(d -> "> 90 Days".equalsIgnoreCase(d.getRenewalWindow())).count();

        BigDecimal totalValue = repository.sumActiveContractValue();
        if (totalValue == null) {
            totalValue = BigDecimal.ZERO;
        }

        String formatted = formatIndianCurrency(totalValue);

        return AmcSlaKpiResponse.builder()
                .totalContracts(total)
                .activeContracts(active)
                .expiringContracts(dueSoon30)
                .renewalOverdueContracts(overdue)
                .renewalDue30Days(dueSoon30)
                .upcoming31to90Days(upcoming31to90)
                .overdueRenewals(overdue)
                .greater90Days(greater90)
                .totalContractValue(totalValue)
                .formattedContractValue(formatted)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AmcSlaFilterOptionsResponse getFilterOptions() {
        return AmcSlaFilterOptionsResponse.builder()
                .serviceTypes(repository.findDistinctServiceTypes())
                .statuses(repository.findDistinctStatuses())
                .renewalAlerts(repository.findDistinctRenewalAlerts())
                .owners(repository.findDistinctAssignedManagers())
                .renewalWindows(List.of("Overdue", "≤ 30 Days", "31 – 90 Days", "> 90 Days"))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AmcSlaContractDto getContractById(Long id) {
        return repository.findById(id).map(this::mapToDto).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public AmcSlaContractDto getContractByCode(String code) {
        return repository.findByContractCode(code).map(this::mapToDto).orElse(null);
    }

    @Override
    @Transactional
    public AmcSlaContractDto createContract(CreateAmcSlaContractRequest request) {
        String code = request.getContractCode();
        if (code == null || code.trim().isEmpty()) {
            long nextId = repository.count() + 1;
            String prefix = (request.getServiceType() != null && request.getServiceType().toUpperCase().contains("SLA")) ? "SLA-" : "AMC-";
            code = String.format("%s%04d", prefix, nextId);
        }

        AmcSlaContractEntity entity = AmcSlaContractEntity.builder()
                .contractCode(code)
                .clientId(request.getClientId())
                .clientName(request.getClientName() != null ? request.getClientName() : request.getClientId())
                .projectId(request.getProjectId())
                .projectName(request.getProjectName() != null ? request.getProjectName() : request.getProjectId())
                .serviceType(request.getServiceType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .renewalDate(request.getRenewalDate())
                .contractValue(request.getContractValue() != null ? request.getContractValue() : BigDecimal.ZERO)
                .responseSla(request.getResponseSla() != null ? request.getResponseSla() : "2 hrs")
                .resolutionSla(request.getResolutionSla() != null ? request.getResolutionSla() : "24 hrs")
                .coverageHours(request.getCoverageHours() != null ? request.getCoverageHours() : "24/7 Support")
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .penaltyClause(request.getPenaltyClause() != null ? request.getPenaltyClause() : "Standard SLA Penalty")
                .renewalAlert(request.getRenewalAlert() != null ? request.getRenewalAlert() : "Normal")
                .assignedManager(request.getAssignedManager() != null ? request.getAssignedManager() : "Unassigned")
                .notes(request.getNotes())
                .build();

        return mapToDto(repository.save(entity));
    }

    @Override
    @Transactional
    public AmcSlaContractDto updateContract(Long id, UpdateAmcSlaContractRequest request) {
        AmcSlaContractEntity entity = repository.findById(id).orElse(null);
        if (entity == null) {
            return null;
        }

        if (request.getClientId() != null) entity.setClientId(request.getClientId());
        if (request.getClientName() != null) entity.setClientName(request.getClientName());
        if (request.getProjectId() != null) entity.setProjectId(request.getProjectId());
        if (request.getProjectName() != null) entity.setProjectName(request.getProjectName());
        if (request.getServiceType() != null) entity.setServiceType(request.getServiceType());
        if (request.getStartDate() != null) entity.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) entity.setEndDate(request.getEndDate());
        if (request.getRenewalDate() != null) entity.setRenewalDate(request.getRenewalDate());
        if (request.getContractValue() != null) entity.setContractValue(request.getContractValue());
        if (request.getResponseSla() != null) entity.setResponseSla(request.getResponseSla());
        if (request.getResolutionSla() != null) entity.setResolutionSla(request.getResolutionSla());
        if (request.getCoverageHours() != null) entity.setCoverageHours(request.getCoverageHours());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getPenaltyClause() != null) entity.setPenaltyClause(request.getPenaltyClause());
        if (request.getRenewalAlert() != null) entity.setRenewalAlert(request.getRenewalAlert());
        if (request.getAssignedManager() != null) entity.setAssignedManager(request.getAssignedManager());
        if (request.getNotes() != null) entity.setNotes(request.getNotes());

        return mapToDto(repository.save(entity));
    }

    @Override
    @Transactional
    public void deleteContract(Long id) {
        repository.deleteById(id);
    }

    public static String formatIndianCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0";
        long val = amount.longValue();
        if (val < 1000) {
            return "₹ " + val;
        }
        String s = String.valueOf(val);
        String lastThree = s.substring(s.length() - 3);
        String rest = s.substring(0, s.length() - 3);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < rest.length(); i++) {
            if (i > 0 && (rest.length() - i) % 2 == 0) {
                sb.append(",");
            }
            sb.append(rest.charAt(i));
        }
        sb.append(",").append(lastThree);
        return "₹ " + sb.toString();
    }

    private AmcSlaContractDto mapToDto(AmcSlaContractEntity e) {
        String owner = e.getAssignedManager() != null ? e.getAssignedManager() : "Unassigned";

        Integer daysToRenewal = null;
        String renewalWindow;
        String normStatus = e.getStatus() != null ? e.getStatus().trim() : "";
        String normAlert = e.getRenewalAlert() != null ? e.getRenewalAlert().trim() : "";

        if (normAlert.equalsIgnoreCase("Renewal Overdue") || normAlert.equalsIgnoreCase("Overdue")
                || (normStatus.equalsIgnoreCase("Inactive") && e.getRenewalDate() != null && e.getRenewalDate().isBefore(java.time.LocalDate.now()))) {
            renewalWindow = "Overdue";
        } else if (normStatus.equalsIgnoreCase("Expired") || normStatus.equalsIgnoreCase("Terminated")) {
            renewalWindow = "Expired";
        } else if (e.getRenewalDate() != null) {
            long diff = java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDate.now(), e.getRenewalDate());
            if (diff <= 0) {
                renewalWindow = "Overdue";
            } else {
                daysToRenewal = (int) diff;
                if (diff <= 30) {
                    renewalWindow = "≤ 30 Days";
                } else if (diff <= 90) {
                    renewalWindow = "31 – 90 Days";
                } else {
                    renewalWindow = "> 90 Days";
                }
            }
        } else {
            renewalWindow = "Other";
        }

        return AmcSlaContractDto.builder()
                .id(e.getId())
                .contractCode(e.getContractCode())
                .clientId(e.getClientId())
                .clientName(e.getClientName())
                .projectId(e.getProjectId())
                .projectName(e.getProjectName())
                .serviceType(e.getServiceType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .renewalDate(e.getRenewalDate())
                .contractValue(e.getContractValue())
                .responseSla(e.getResponseSla())
                .resolutionSla(e.getResolutionSla())
                .coverageHours(e.getCoverageHours())
                .status(e.getStatus())
                .penaltyClause(e.getPenaltyClause())
                .renewalAlert(e.getRenewalAlert())
                .assignedManager(e.getAssignedManager())
                .notes(e.getNotes())
                .daysToRenewal(daysToRenewal)
                .renewalWindow(renewalWindow)
                .owner(owner)
                .build();
    }
}
