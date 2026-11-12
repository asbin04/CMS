package com.company.project.reports.service;

import com.company.project.clients.entity.ClientEntity;
import com.company.project.clients.repository.ClientRepository;
import com.company.project.collections.entity.CollectionInvoiceEntity;
import com.company.project.collections.repository.CollectionInvoiceRepository;
import com.company.project.finance.entity.FinancePaymentEntity;
import com.company.project.finance.repository.FinancePaymentRepository;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import com.company.project.reports.dto.TransactionControlCheckDto;
import com.company.project.reports.dto.TransactionControlResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionControlServiceTest {

    @Mock
    private FinancePaymentRepository financePaymentRepository;
    @Mock
    private CollectionInvoiceRepository collectionInvoiceRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectTaskRepository projectTaskRepository;

    @InjectMocks
    private TransactionControlService transactionControlService;

    @Test
    @DisplayName("Evaluates all six controls from live entities cleanly")
    void evaluatesAllSixControls() {
        ClientEntity validClient = ClientEntity.builder()
                .id("CL-001")
                .clientCode("CL-001")
                .clientName("Acme Corp")
                .email("billing@acme.com")
                .phone("9999999999")
                .contactPerson("Riya")
                .status("Active")
                .build();

        ClientEntity incompleteClient = ClientEntity.builder()
                .id("CL-002")
                .clientCode("CL-002")
                .clientName("Incomplete Co")
                .email("")
                .phone("8888888888")
                .contactPerson("Jay")
                .status("Active")
                .build();

        ProjectEntity validProject = ProjectEntity.builder()
                .id("PRJ-001")
                .projectCode("PRJ-001")
                .projectName("ERP Portal")
                .clientId("CL-001")
                .projectManager("Amit")
                .startDate(LocalDate.now().minusMonths(2))
                .plannedEndDate(LocalDate.now().plusMonths(2))
                .status("In Progress")
                .contractValue(BigDecimal.valueOf(500000))
                .build();

        CollectionInvoiceEntity overdueAndFlaggedInvoice = CollectionInvoiceEntity.builder()
                .id("INV-001")
                .clientId("CL-001")
                .clientName("Acme Corp")
                .projectId("PRJ-001")
                .invoiceDate(LocalDate.now().minusDays(45))
                .dueDate(LocalDate.now().minusDays(15))
                .invoiceAmount(BigDecimal.valueOf(100000))
                .amountPaid(BigDecimal.valueOf(20000))
                .outstanding(BigDecimal.valueOf(70000))
                .daysOverdue(15)
                .status("Overdue")
                .ageingBucket("1 - 30 Days")
                .build();

        FinancePaymentEntity unmatchedPayment = FinancePaymentEntity.builder()
                .id("PAY-001")
                .paymentDate(LocalDate.now().minusDays(3))
                .invoiceId("INV-MISSING")
                .clientId("CL-001")
                .clientName("Acme Corp")
                .amount(BigDecimal.valueOf(25000))
                .invoiceAmount(BigDecimal.valueOf(25000))
                .mode("NEFT")
                .referenceNo("UTR-12345")
                .status("Unmatched")
                .varianceAmount(BigDecimal.ZERO)
                .build();

        ProjectTaskEntity overdueTask = ProjectTaskEntity.builder()
                .id("TSK-001")
                .projectId("PRJ-001")
                .taskName("Reconcile ledger")
                .assignedTo("Neha")
                .priority("High")
                .dueDate(LocalDate.now().minusDays(5))
                .estimatedHours(BigDecimal.valueOf(8))
                .actualHours(BigDecimal.valueOf(4))
                .status("In Progress")
                .build();

        when(clientRepository.findAll()).thenReturn(List.of(validClient, incompleteClient));
        when(projectRepository.findAll()).thenReturn(List.of(validProject));
        when(projectTaskRepository.findAll()).thenReturn(List.of(overdueTask));
        when(collectionInvoiceRepository.findAll()).thenReturn(List.of(overdueAndFlaggedInvoice));
        when(financePaymentRepository.findAll()).thenReturn(List.of(unmatchedPayment));

        TransactionControlResponse response = transactionControlService.evaluateControls();

        assertThat(response.isVerificationAvailable()).isTrue();
        assertThat(response.getDefaultSelectedCheckId()).isEqualTo("invalid-payment-invoices");
        assertThat(response.getChecks()).hasSize(6);

        Map<String, TransactionControlCheckDto> byId = response.getChecks().stream()
                .collect(Collectors.toMap(TransactionControlCheckDto::getId, Function.identity()));

        assertThat(byId.get("invalid-relationships").getCount()).isEqualTo(1);
        assertThat(byId.get("invalid-payment-invoices").getCount()).isEqualTo(1);
        assertThat(byId.get("invalid-payment-invoices").getRecords().get(0).getInvoiceId()).isEqualTo("INV-MISSING");
        assertThat(byId.get("invoice-review-flags").getCount()).isEqualTo(1);
        assertThat(byId.get("overdue-collections").getCount()).isEqualTo(1);
        assertThat(byId.get("overdue-tasks").getCount()).isEqualTo(1);
        assertThat(byId.get("data-quality-issues").getCount()).isEqualTo(1);
    }
}

