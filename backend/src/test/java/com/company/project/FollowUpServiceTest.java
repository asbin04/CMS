package com.company.project;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.dashboard.dto.ActionRequest;
import com.company.project.dashboard.dto.CreateFollowUpItemRequest;
import com.company.project.dashboard.dto.FollowUpItemDto;
import com.company.project.dashboard.dto.FollowUpSummaryDto;
import com.company.project.dashboard.entity.FollowUpItem;
import com.company.project.dashboard.mapper.FollowUpItemMapper;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import com.company.project.dashboard.service.FollowUpServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowUpServiceTest {

    @Mock
    private FollowUpItemRepository repository;

    @Spy
    private FollowUpItemMapper mapper = new FollowUpItemMapper();

    @InjectMocks
    private FollowUpServiceImpl service;

    private FollowUpItem sampleItem;

    @BeforeEach
    void setUp() {
        sampleItem = FollowUpItem.builder()
                .id(1L)
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
                .build();
    }

    @Test
    @DisplayName("getAllItems should return all mapped DTO items when no filters provided")
    void testGetAllItems() {
        when(repository.findAllByOrderByOrderIndexAscIdAsc()).thenReturn(List.of(sampleItem));

        List<FollowUpItemDto> result = service.getAllItems(null, null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Invoices & Payments", result.get(0).getModuleName());
        assertEquals("High", result.get(0).getPriority());
    }

    @Test
    @DisplayName("getAllItems with priority only should query findByPriorityIgnoreCase")
    void testGetAllItemsWithPriorityOnly() {
        when(repository.findByPriorityIgnoreCaseOrderByOrderIndexAscIdAsc("High")).thenReturn(List.of(sampleItem));

        List<FollowUpItemDto> result = service.getAllItems("High", null);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository).findByPriorityIgnoreCaseOrderByOrderIndexAscIdAsc("High");
    }

    @Test
    @DisplayName("getAllItems with search only should query searchByKeyword")
    void testGetAllItemsWithSearchOnly() {
        when(repository.searchByKeyword("invoice")).thenReturn(List.of(sampleItem));

        List<FollowUpItemDto> result = service.getAllItems(null, "invoice");

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository).searchByKeyword("invoice");
    }

    @Test
    @DisplayName("getAllItems with search and priority should query searchByPriorityAndKeyword")
    void testGetAllItemsWithBothFilters() {
        when(repository.searchByPriorityAndKeyword("High", "invoice")).thenReturn(List.of(sampleItem));

        List<FollowUpItemDto> result = service.getAllItems("High", "invoice");

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repository).searchByPriorityAndKeyword("High", "invoice");
    }

    @Test
    @DisplayName("getSummary should calculate counts accurately")
    void testGetSummary() {
        when(repository.sumCountByPriorityAndIsDoneFalse("High")).thenReturn(12L);
        when(repository.sumCountByPriorityAndIsDoneFalse("Medium")).thenReturn(6L);
        when(repository.sumCountByPriorityAndIsDoneFalse("Low")).thenReturn(3L);
        when(repository.countByPriorityAndIsDone("High", false)).thenReturn(1L);
        when(repository.countByPriorityAndIsDone("Medium", false)).thenReturn(1L);
        when(repository.countByPriorityAndIsDone("Low", false)).thenReturn(1L);
        when(repository.countByIsDoneTrue()).thenReturn(0L);

        FollowUpSummaryDto summary = service.getSummary();

        assertNotNull(summary);
        assertEquals(12, summary.getHighPriorityCount());
        assertEquals(6, summary.getMediumPriorityCount());
        assertEquals(3, summary.getLowPriorityCount());
        assertEquals(3, summary.getTotalPendingItems());
        assertEquals(0, summary.getTotalCompletedItems());
    }

    @Test
    @DisplayName("getItemById returns item if found")
    void testGetItemByIdSuccess() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleItem));

        FollowUpItemDto dto = service.getItemById(1L);

        assertNotNull(dto);
        assertEquals(1L, dto.getId());
    }

    @Test
    @DisplayName("getItemById throws ResourceNotFoundException when not found")
    void testGetItemByIdNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getItemById(999L));
    }

    @Test
    @DisplayName("toggleDone should flip isDone state")
    void testToggleDone() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleItem));
        when(repository.save(any(FollowUpItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FollowUpItemDto dto = service.toggleDone(1L);

        assertTrue(dto.getIsDone());
        assertEquals("On Track", dto.getHealth());
    }

    @Test
    @DisplayName("performAction should append notes and update status")
    void testPerformAction() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleItem));
        when(repository.save(any(FollowUpItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ActionRequest action = ActionRequest.builder()
                .action("MARK_DONE")
                .notes("Called client regarding invoice")
                .build();

        FollowUpItemDto dto = service.performAction(1L, action);

        assertTrue(dto.getIsDone());
        assertTrue(dto.getNotes().contains("Called client regarding invoice"));
    }

    @Test
    @DisplayName("createItem should save new item with calculated orderIndex")
    void testCreateItem() {
        CreateFollowUpItemRequest request = CreateFollowUpItemRequest.builder()
                .moduleName("New Module")
                .keyInfoTitle("New Title")
                .count(3)
                .priority("Medium")
                .health("Due Soon")
                .build();

        when(repository.count()).thenReturn(5L);
        when(repository.save(any(FollowUpItem.class))).thenAnswer(invocation -> {
            FollowUpItem item = invocation.getArgument(0);
            item.setId(10L);
            return item;
        });

        FollowUpItemDto created = service.createItem(request);

        assertNotNull(created);
        assertEquals(10L, created.getId());
        assertEquals("New Module", created.getModuleName());
        assertEquals(6, created.getOrderIndex());
    }

    @Test
    @DisplayName("deleteItem should throw exception if not existing")
    void testDeleteItemNotFound() {
        when(repository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.deleteItem(99L));
    }
}
