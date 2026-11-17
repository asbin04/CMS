package com.company.project.dashboard;

import com.company.project.dashboard.repository.ContractRepository;
import com.company.project.dashboard.repository.EmployeeApprovalRepository;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import com.company.project.dashboard.repository.OpportunityRepository;
import com.company.project.dashboard.service.ApprovalService;
import com.company.project.dashboard.service.ContractService;
import com.company.project.dashboard.service.FollowUpService;
import com.company.project.dashboard.service.OpportunityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final FollowUpItemRepository followUpRepository;
    private final FollowUpService followUpService;
    private final OpportunityRepository opportunityRepository;
    private final OpportunityService opportunityService;
    private final EmployeeApprovalRepository employeeApprovalRepository;
    private final ApprovalService approvalService;
    private final ContractRepository contractRepository;
    private final ContractService contractService;

    @Override
    public void run(String... args) {
        log.info("DataSeeder: Auto-seeding disabled to keep database clean.");
    }
}
