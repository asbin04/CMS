package com.company.project.dashboard.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.ApprovalsResponse;
import com.company.project.dashboard.dto.ApprovalsSummaryDto;
import com.company.project.dashboard.entity.ClientApproval;
import com.company.project.dashboard.entity.EmployeeApproval;
import com.company.project.dashboard.entity.TicketAssetApproval;
import com.company.project.dashboard.repository.ClientApprovalRepository;
import com.company.project.dashboard.repository.EmployeeApprovalRepository;
import com.company.project.dashboard.repository.TicketAssetApprovalRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.project.notification.service.NotificationService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Slf4j
public class ApprovalServiceImpl implements ApprovalService {

    private final EmployeeApprovalRepository employeeRepo;
    private final ClientApprovalRepository clientRepo;
    private final TicketAssetApprovalRepository ticketAssetRepo;
    private final NotificationService notificationService;

    public ApprovalServiceImpl(
            EmployeeApprovalRepository employeeRepo,
            ClientApprovalRepository clientRepo,
            TicketAssetApprovalRepository ticketAssetRepo,
            @Nullable NotificationService notificationService) {
        this.employeeRepo = employeeRepo;
        this.clientRepo = clientRepo;
        this.ticketAssetRepo = ticketAssetRepo;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public ApprovalsResponse getAllApprovals() {
        List<EmployeeApproval> employees = employeeRepo.findAllByOrderBySortOrderAscIdAsc();
        List<ClientApproval> clients = clientRepo.findAllByOrderBySortOrderAscIdAsc();
        List<TicketAssetApproval> ticketsAssets = ticketAssetRepo.findAllByOrderBySortOrderAscIdAsc();

        long pending = employeeRepo.countByStatusIgnoreCase("Pending")
                + clientRepo.countByStatusIgnoreCase("Pending")
                + ticketAssetRepo.countByStatusIgnoreCase("Pending");

        long approved = employeeRepo.countByStatusIgnoreCase("Approved")
                + clientRepo.countByStatusIgnoreCase("Approved")
                + ticketAssetRepo.countByStatusIgnoreCase("Approved");

        long rejected = employeeRepo.countByStatusIgnoreCase("Rejected")
                + clientRepo.countByStatusIgnoreCase("Rejected")
                + ticketAssetRepo.countByStatusIgnoreCase("Rejected");

        long total = pending + approved + rejected;

        return ApprovalsResponse.builder()
                .employees(employees)
                .clients(clients)
                .ticketsAssets(ticketsAssets)
                .summary(ApprovalsSummaryDto.builder()
                        .total(total)
                        .pending(pending)
                        .approved(approved)
                        .rejected(rejected)
                        .build())
                .build();
    }

    @Override
    @Transactional
    public EmployeeApproval updateEmployeeStatus(Long id, String status) {
        EmployeeApproval item = employeeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee approval not found with ID: " + id));
        item.setStatus(status);
        item.setApprovedBy("Akshit Ujjain (Admin)");
        item.setDecidedAt(LocalDateTime.now());
        EmployeeApproval saved = employeeRepo.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Employee Request " + status,
                    saved.getEmployeeName() + " (" + (saved.getRequestType() != null ? saved.getRequestType() : "Request") + ") updated to " + status + ".",
                    "APPROVAL",
                    "/management/approval-inbox"
            );
        }
        return saved;
    }

    @Override
    @Transactional
    public EmployeeApproval createEmployeeApproval(EmployeeApproval request) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("Pending");
        }
        if (request.getAppliedDate() == null || request.getAppliedDate().isBlank()) {
            request.setAppliedDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }
        if (request.getSortOrder() == null) {
            request.setSortOrder((int) employeeRepo.count() + 1);
        }
        return employeeRepo.save(request);
    }

    @Override
    @Transactional
    public EmployeeApproval createEmployeeApproval(com.company.project.dashboard.dto.CreateEmployeeApprovalRequest request) {
        EmployeeApproval entity = EmployeeApproval.builder()
                .employeeName(request.getEmployeeName())
                .employeeCode(request.getEmployeeCode())
                .requestType(request.getRequestType())
                .appliedDate(request.getAppliedDate())
                .fromDate(request.getFromDate())
                .toDate(request.getToDate())
                .duration(request.getDuration())
                .reason(request.getReason())
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "Pending")
                .sortOrder(request.getSortOrder())
                .build();
        return createEmployeeApproval(entity);
    }

    @Override
    @Transactional
    public ClientApproval updateClientStatus(Long id, String status) {
        ClientApproval item = clientRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client approval not found with ID: " + id));
        item.setStatus(status);
        item.setApprovedBy("Akshit Ujjain (Admin)");
        item.setDecidedAt(LocalDateTime.now());
        ClientApproval saved = clientRepo.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Client Request " + status,
                    saved.getClientName() + " (" + (saved.getRequestType() != null ? saved.getRequestType() : "Request") + ") updated to " + status + ".",
                    "APPROVAL",
                    "/management/approval-inbox"
            );
        }
        return saved;
    }

    @Override
    @Transactional
    public ClientApproval createClientApproval(ClientApproval request) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("Pending");
        }
        if (request.getApprovalId() == null || request.getApprovalId().isBlank()) {
            long count = clientRepo.count() + 1;
            request.setApprovalId(String.format("APP-%d-%03d", LocalDate.now().getYear(), count));
        }
        if (request.getRequestDate() == null || request.getRequestDate().isBlank()) {
            request.setRequestDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }
        if (request.getSortOrder() == null) {
            request.setSortOrder((int) clientRepo.count() + 1);
        }
        return clientRepo.save(request);
    }

    @Override
    @Transactional
    public ClientApproval createClientApproval(com.company.project.dashboard.dto.CreateClientApprovalRequest request) {
        ClientApproval entity = ClientApproval.builder()
                .approvalId(request.getApprovalId())
                .clientName(request.getClientName())
                .requestType(request.getRequestType())
                .referenceId(request.getReferenceId())
                .requester(request.getRequester())
                .requestDate(request.getRequestDate())
                .dueDate(request.getDueDate())
                .amount(request.getAmount())
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "Pending")
                .sortOrder(request.getSortOrder())
                .build();
        return createClientApproval(entity);
    }

    @Override
    @Transactional
    public TicketAssetApproval updateTicketAssetStatus(Long id, String status) {
        TicketAssetApproval item = ticketAssetRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket/Asset approval not found with ID: " + id));
        item.setStatus(status);
        item.setApprovedBy("Akshit Ujjain (Admin)");
        item.setDecidedAt(LocalDateTime.now());
        TicketAssetApproval saved = ticketAssetRepo.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Ticket/Asset " + status,
                    saved.getClientRequester() + " (" + (saved.getTitle() != null ? saved.getTitle() : "Asset") + ") updated to " + status + ".",
                    "APPROVAL",
                    "/management/approval-inbox"
            );
        }
        return saved;
    }

    @Override
    @Transactional
    public TicketAssetApproval createTicketAssetApproval(TicketAssetApproval request) {
        if (request.getStatus() == null || request.getStatus().isBlank()) {
            request.setStatus("Pending");
        }
        if (request.getApprovalId() == null || request.getApprovalId().isBlank()) {
            long count = ticketAssetRepo.count() + 1;
            request.setApprovalId(String.format("APP-%d-%03d", LocalDate.now().getYear(), count));
        }
        if (request.getRequestDate() == null || request.getRequestDate().isBlank()) {
            request.setRequestDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
        }
        if (request.getSortOrder() == null) {
            request.setSortOrder((int) ticketAssetRepo.count() + 1);
        }
        return ticketAssetRepo.save(request);
    }

    @Override
    @Transactional
    public TicketAssetApproval createTicketAssetApproval(com.company.project.dashboard.dto.CreateTicketAssetApprovalRequest request) {
        TicketAssetApproval entity = TicketAssetApproval.builder()
                .approvalId(request.getApprovalId())
                .recordType(request.getRecordType())
                .recordCode(request.getRecordCode())
                .title(request.getTitle())
                .clientRequester(request.getClientRequester())
                .approvalType(request.getApprovalType())
                .priority(request.getPriority())
                .requestDate(request.getRequestDate())
                .assignedApprover(request.getAssignedApprover())
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : "Pending")
                .sortOrder(request.getSortOrder())
                .build();
        return createTicketAssetApproval(entity);
    }

    @Override
    @Transactional
    public void resetSeedData() {
        employeeRepo.deleteAllInBatch();
        clientRepo.deleteAllInBatch();
        ticketAssetRepo.deleteAllInBatch();
        log.info("Cleared all approval data.");
    }
}

