package com.company.project.leave.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.leave.dto.CreateLeaveRequest;
import com.company.project.leave.dto.LeaveMetricsResponse;
import com.company.project.leave.dto.UpdateLeaveRequest;
import com.company.project.leave.entity.LeaveEntity;
import com.company.project.leave.repository.LeaveRepository;
import com.company.project.security.SecurityUtils;
import com.company.project.security.entity.AppUser;
import com.company.project.security.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public List<LeaveEntity> getAllLeaves() {
        return leaveRepository.findAllByOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public LeaveEntity getLeaveById(String id) {
        return leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public LeaveMetricsResponse getMetrics() {
        long total = leaveRepository.count();
        long approved = leaveRepository.countByApprovalStatusIgnoreCase("Approved");
        long pending = leaveRepository.countByApprovalStatusIgnoreCase("Pending");
        long rejected = leaveRepository.countByApprovalStatusIgnoreCase("Rejected");

        return LeaveMetricsResponse.builder()
                .totalRequests(total)
                .totalRequestsTrend("↑ 12% vs last month")
                .approvedRequests(approved)
                .approvedRequestsTrend("↑ 8% vs last month")
                .pendingRequests(pending)
                .pendingRequestsTrend("↓ 8% vs last month")
                .rejectedRequests(rejected)
                .rejectedRequestsTrend("↓ 17% vs last month")
                .build();
    }

    @Transactional
    public synchronized LeaveEntity createLeave(CreateLeaveRequest request) {
        String nextId = generateNextId();

        String status = request.getApprovalStatus() != null && !request.getApprovalStatus().isBlank()
                ? request.getApprovalStatus()
                : "Pending";

        String appliedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH));
        String approvedBy = request.getApprovedBy();
        if ("Approved".equalsIgnoreCase(status) && (approvedBy == null || approvedBy.isBlank())) {
            approvedBy = resolveCurrentApproverName();
        }

        LeaveEntity entity = LeaveEntity.builder()
                .id(nextId)
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName())
                .leaveType(request.getLeaveType())
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .days(request.getDays())
                .reason(request.getReason())
                .approvalStatus(status)
                .approvedBy(approvedBy)
                .calculatedDays(request.getDays())
                .leaveStatus(status)
                .appliedDate(appliedDate)
                .build();

        return leaveRepository.save(entity);
    }

    @Transactional
    public LeaveEntity updateLeave(String id, UpdateLeaveRequest request) {
        LeaveEntity existing = getLeaveById(id);

        if (request.getEmployeeId() != null) existing.setEmployeeId(request.getEmployeeId());
        if (request.getEmployeeName() != null) existing.setEmployeeName(request.getEmployeeName());
        if (request.getLeaveType() != null) existing.setLeaveType(request.getLeaveType());
        if (request.getFromDate() != null) existing.setFromDate(request.getFromDate());
        if (request.getToDate() != null) existing.setToDate(request.getToDate());
        if (request.getDays() != null) {
            existing.setDays(request.getDays());
            if (request.getCalculatedDays() == null) {
                existing.setCalculatedDays(request.getDays());
            }
        }
        if (request.getCalculatedDays() != null) existing.setCalculatedDays(request.getCalculatedDays());
        if (request.getReason() != null) existing.setReason(request.getReason());
        if (request.getApprovalStatus() != null) {
            existing.setApprovalStatus(request.getApprovalStatus());
            if (request.getLeaveStatus() == null) {
                existing.setLeaveStatus(request.getApprovalStatus());
            }
        }
        if (request.getApprovedBy() != null) {
            existing.setApprovedBy(request.getApprovedBy().trim().isEmpty() ? null : request.getApprovedBy().trim());
        } else if ("Approved".equalsIgnoreCase(existing.getApprovalStatus()) && (existing.getApprovedBy() == null || existing.getApprovedBy().isBlank())) {
            existing.setApprovedBy(resolveCurrentApproverName());
        } else if ("Pending".equalsIgnoreCase(existing.getApprovalStatus())) {
            existing.setApprovedBy(null);
        }
        if (request.getLeaveStatus() != null) existing.setLeaveStatus(request.getLeaveStatus());

        return leaveRepository.save(existing);
    }

    public String resolveCurrentApproverName() {
        String currentPrincipal = SecurityUtils.getCurrentUsername();
        if (currentPrincipal == null || currentPrincipal.isBlank() || "system".equalsIgnoreCase(currentPrincipal)
                || "anonymousUser".equalsIgnoreCase(currentPrincipal)) {
            return "Akshit Ujjain";
        }
        if (appUserRepository != null) {
            Optional<AppUser> userOpt =
                    appUserRepository.findByUsernameIgnoreCaseOrEmailIgnoreCase(currentPrincipal.trim(), currentPrincipal.trim());
            if (userOpt.isPresent() && userOpt.get().getDisplayName() != null && !userOpt.get().getDisplayName().isBlank()) {
                return userOpt.get().getDisplayName();
            }
        }
        String lower = currentPrincipal.toLowerCase(Locale.ROOT);
        if (lower.contains("founder") || lower.contains("gaurav")) {
            return "Gaurav Tripathy";
        }
        if (lower.contains("asbin") || lower.contains("aasbin")) {
            return "Asbin T S";
        }
        if (lower.contains("akshit") || lower.contains("ujjain")) {
            return "Akshit Ujjain";
        }
        return currentPrincipal;
    }

    @Transactional
    public void deleteLeave(String id) {
        LeaveEntity existing = getLeaveById(id);
        leaveRepository.delete(existing);
    }

    private String generateNextId() {
        String latestId = leaveRepository.findLatestId();
        int nextNum = 1;
        if (latestId != null && latestId.startsWith("LV-")) {
            try {
                String numStr = latestId.substring(3).trim();
                nextNum = Integer.parseInt(numStr) + 1;
            } catch (NumberFormatException ignored) {
                nextNum = (int) leaveRepository.count() + 1;
            }
        } else {
            nextNum = (int) leaveRepository.count() + 1;
        }
        return String.format("LV-%05d", nextNum);
    }
}

