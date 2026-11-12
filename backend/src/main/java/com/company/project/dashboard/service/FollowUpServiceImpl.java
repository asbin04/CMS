package com.company.project.dashboard.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.ActionRequest;
import com.company.project.dashboard.dto.CreateFollowUpItemRequest;
import com.company.project.dashboard.dto.FollowUpItemDto;
import com.company.project.dashboard.dto.FollowUpSummaryDto;
import com.company.project.dashboard.entity.FollowUpItem;
import com.company.project.dashboard.mapper.FollowUpItemMapper;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.project.notification.service.NotificationService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowUpServiceImpl implements FollowUpService {

    private final FollowUpItemRepository repository;
    private final FollowUpItemMapper mapper;
    private final NotificationService notificationService;

    public FollowUpServiceImpl(
            FollowUpItemRepository repository,
            FollowUpItemMapper mapper,
            @Nullable NotificationService notificationService) {
        this.repository = repository;
        this.mapper = mapper;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FollowUpItemDto> getAllItems(String priority, String search) {
        String cleanPriority = (priority != null && !priority.trim().isEmpty() && !"all".equalsIgnoreCase(priority.trim()))
                ? priority.trim()
                : null;
        String cleanSearch = (search != null && !search.trim().isEmpty())
                ? search.trim()
                : null;

        List<FollowUpItem> items;
        if (cleanPriority != null && cleanSearch != null) {
            items = repository.searchByPriorityAndKeyword(cleanPriority, cleanSearch);
        } else if (cleanPriority != null) {
            items = repository.findByPriorityIgnoreCaseOrderByOrderIndexAscIdAsc(cleanPriority);
        } else if (cleanSearch != null) {
            items = repository.searchByKeyword(cleanSearch);
        } else {
            items = repository.findAllByOrderByOrderIndexAscIdAsc();
        }

        return items.stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FollowUpSummaryDto getSummary() {
        long highPending = repository.countByPriorityAndIsDone("High", false);
        long medPending = repository.countByPriorityAndIsDone("Medium", false);
        long lowPending = repository.countByPriorityAndIsDone("Low", false);
        long totalCompleted = repository.countByIsDoneTrue();

        long highPendingSum = repository.sumCountByPriorityAndIsDoneFalse("High");
        long medPendingSum = repository.sumCountByPriorityAndIsDoneFalse("Medium");
        long lowPendingSum = repository.sumCountByPriorityAndIsDoneFalse("Low");

        return FollowUpSummaryDto.builder()
                .highPriorityCount(highPendingSum)
                .mediumPriorityCount(medPendingSum)
                .lowPriorityCount(lowPendingSum)
                .totalPendingItems(highPending + medPending + lowPending)
                .totalCompletedItems(totalCompleted)
                .lastRefreshed(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FollowUpItemDto getItemById(Long id) {
        FollowUpItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up queue item not found with id: " + id));
        return mapper.toDto(item);
    }

    @Override
    @Transactional
    public FollowUpItemDto createItem(CreateFollowUpItemRequest request) {
        FollowUpItem item = mapper.toEntity(request);
        long count = repository.count();
        item.setOrderIndex((int) count + 1);
        FollowUpItem saved = repository.save(item);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public FollowUpItemDto updateItem(Long id, CreateFollowUpItemRequest request) {
        FollowUpItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up queue item not found with id: " + id));

        item.setModuleName(request.getModuleName());
        if (request.getModuleSub() != null) item.setModuleSub(request.getModuleSub());
        if (request.getIconBg() != null) item.setIconBg(request.getIconBg());
        if (request.getIconColor() != null) item.setIconColor(request.getIconColor());
        item.setCount(request.getCount());
        if (request.getCountVariant() != null) item.setCountVariant(request.getCountVariant());
        item.setKeyInfoTitle(request.getKeyInfoTitle());
        if (request.getKeyInfoSub() != null) item.setKeyInfoSub(request.getKeyInfoSub());
        item.setPriority(request.getPriority());
        item.setHealth(request.getHealth());
        if (request.getDaysSinceLastFollowUp() != null) item.setDaysSinceLastFollowUp(request.getDaysSinceLastFollowUp());
        if (request.getDaysColorRed() != null) item.setDaysColorRed(request.getDaysColorRed());
        if (request.getPrimaryActionLabel() != null) item.setPrimaryActionLabel(request.getPrimaryActionLabel());
        if (request.getSecondaryActionLabel() != null) item.setSecondaryActionLabel(request.getSecondaryActionLabel());
        if (request.getNotes() != null) item.setNotes(request.getNotes());

        FollowUpItem updated = repository.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Follow-up Updated",
                    "Task for " + item.getKeyInfoTitle() + " (" + item.getModuleName() + ") details updated.",
                    "FOLLOW_UP",
                    "/management/follow-up-queue"
            );
        }
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public FollowUpItemDto toggleDone(Long id) {
        FollowUpItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up queue item not found with id: " + id));

        boolean newDone = !Boolean.TRUE.equals(item.getIsDone());
        item.setIsDone(newDone);
        if (newDone) {
            item.setHealth("On Track");
        } else {
            if ("High".equalsIgnoreCase(item.getPriority())) {
                item.setHealth("Overdue");
            } else if ("Medium".equalsIgnoreCase(item.getPriority())) {
                item.setHealth("Due Soon");
            } else {
                item.setHealth("On Track");
            }
        }
        FollowUpItem updated = repository.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Follow-up " + (newDone ? "Completed" : "Reopened"),
                    "Task for " + item.getKeyInfoTitle() + " (" + item.getModuleName() + ") marked as " + (newDone ? "completed" : "pending") + ".",
                    "FOLLOW_UP",
                    "/management/follow-up-queue"
            );
        }
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public FollowUpItemDto performAction(Long id, ActionRequest actionRequest) {
        FollowUpItem item = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up queue item not found with id: " + id));

        if (actionRequest != null && actionRequest.getNotes() != null) {
            String existing = item.getNotes() != null ? item.getNotes() + "\n" : "";
            item.setNotes(existing + "[" + LocalDateTime.now() + "] " + actionRequest.getNotes());
        }

        if (actionRequest != null && "MARK_DONE".equalsIgnoreCase(actionRequest.getAction())) {
            item.setIsDone(true);
            item.setHealth("On Track");
        } else if (actionRequest != null && "REOPEN".equalsIgnoreCase(actionRequest.getAction())) {
            item.setIsDone(false);
            if ("High".equalsIgnoreCase(item.getPriority())) {
                item.setHealth("Overdue");
            } else if ("Medium".equalsIgnoreCase(item.getPriority())) {
                item.setHealth("Due Soon");
            } else {
                item.setHealth("On Track");
            }
        }

        FollowUpItem updated = repository.save(item);
        if (notificationService != null) {
            notificationService.createNotification(
                    "Follow-up Action Logged",
                    "Action logged for " + item.getKeyInfoTitle() + " (" + item.getModuleName() + ").",
                    "FOLLOW_UP",
                    "/management/follow-up-queue"
            );
        }
        return mapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteItem(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Follow-up queue item not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional
    public void resetSeedData() {
        repository.deleteAllInBatch();

        List<FollowUpItem> initialList = new ArrayList<>();

        initialList.add(FollowUpItem.builder()
                .moduleCode("INVOICES")
                .moduleName("Invoices & Payments")
                .moduleSub("Overdue invoices")
                .iconBg("bg-[#FEF2F2]")
                .iconColor("#EF4444")
                .count(12)
                .countVariant("red")
                .keyInfoTitle("₹ 4,28,000 outstanding")
                .keyInfoSub("Oldest overdue: 45 days")
                .priority("High")
                .health("Overdue")
                .daysSinceLastFollowUp("10 days")
                .daysColorRed(true)
                .primaryActionLabel("Mark Follow-up Done")
                .secondaryActionLabel("Open in Invoices")
                .isDone(false)
                .orderIndex(1)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("COMPLIANCE")
                .moduleName("Compliance")
                .moduleSub("Overdue compliance items")
                .iconBg("bg-[#ECFDF5]")
                .iconColor("#10B981")
                .count(5)
                .countVariant("red")
                .keyInfoTitle("Annual License Renewal")
                .keyInfoSub("32 days overdue")
                .priority("High")
                .health("Overdue")
                .daysSinceLastFollowUp("18 days")
                .daysColorRed(true)
                .primaryActionLabel("Open Item")
                .secondaryActionLabel("Open in Compliance")
                .isDone(false)
                .orderIndex(2)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("APPROVALS")
                .moduleName("Approvals")
                .moduleSub("Pending approvals")
                .iconBg("bg-[#EEF2FF]")
                .iconColor("#6366F1")
                .count(8)
                .countVariant("red")
                .keyInfoTitle("PO Approval - ACME Pvt Ltd")
                .keyInfoSub("SLA overdue by 5 days")
                .priority("High")
                .health("Overdue")
                .daysSinceLastFollowUp("6 days")
                .daysColorRed(true)
                .primaryActionLabel("Approve / Reject")
                .secondaryActionLabel("Open in Approvals")
                .isDone(false)
                .orderIndex(3)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("DOCUMENTS")
                .moduleName("Documents")
                .moduleSub("Expiring / expired documents")
                .iconBg("bg-[#EFF6FF]")
                .iconColor("#3B82F6")
                .count(6)
                .countVariant("amber")
                .keyInfoTitle("Insurance Certificate")
                .keyInfoSub("Expires in 12 days")
                .priority("Medium")
                .health("Due Soon")
                .daysSinceLastFollowUp("3 days")
                .daysColorRed(true)
                .primaryActionLabel("Open Document")
                .secondaryActionLabel("Open in Documents")
                .isDone(false)
                .orderIndex(4)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("ASSETS")
                .moduleName("Assets")
                .moduleSub("Expired warranties")
                .iconBg("bg-[#F0FDFA]")
                .iconColor("#0D9488")
                .count(4)
                .countVariant("amber")
                .keyInfoTitle("Laptop - LAP-2023-017")
                .keyInfoSub("Warranty ended on 10 Mar 2025")
                .priority("Medium")
                .health("Due Soon")
                .daysSinceLastFollowUp("21 days")
                .daysColorRed(true)
                .primaryActionLabel("Open Asset")
                .secondaryActionLabel("Open in Assets")
                .isDone(false)
                .orderIndex(5)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("OPPORTUNITIES")
                .moduleName("Opportunities")
                .moduleSub("Follow-up due / missing")
                .iconBg("bg-[#EFF6FF]")
                .iconColor("#2563EB")
                .count(7)
                .countVariant("amber")
                .keyInfoTitle("Global Tech Solutions")
                .keyInfoSub("Next follow-up: 18 Mar 2025")
                .priority("Medium")
                .health("Due Soon")
                .daysSinceLastFollowUp("14 days")
                .daysColorRed(true)
                .primaryActionLabel("Log Follow-up")
                .secondaryActionLabel("Open in Opportunities")
                .isDone(false)
                .orderIndex(6)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("PROJECT_CONTROL")
                .moduleName("Project Control")
                .moduleSub("At-risk / overdue projects")
                .iconBg("bg-[#EFF6FF]")
                .iconColor("#3B82F6")
                .count(3)
                .countVariant("green")
                .keyInfoTitle("Website Redesign")
                .keyInfoSub("Due in 5 days • Health: Red")
                .priority("Low")
                .health("On Track")
                .daysSinceLastFollowUp("2 days")
                .daysColorRed(true)
                .primaryActionLabel("Open Project")
                .secondaryActionLabel("Open in Project Control")
                .isDone(false)
                .orderIndex(7)
                .build());

        initialList.add(FollowUpItem.builder()
                .moduleCode("CANDIDATES")
                .moduleName("Candidates")
                .moduleSub("Open candidates ageing")
                .iconBg("bg-[#FAF5FF]")
                .iconColor("#9333EA")
                .count(2)
                .countVariant("green")
                .keyInfoTitle("Frontend Developer")
                .keyInfoSub("In pipeline for 28 days • Stage: Screening")
                .priority("Low")
                .health("On Track")
                .daysSinceLastFollowUp("7 days")
                .daysColorRed(false)
                .primaryActionLabel("Open Candidate")
                .secondaryActionLabel("Open in Candidates")
                .isDone(false)
                .orderIndex(8)
                .build());

        repository.saveAll(initialList);
    }
}
