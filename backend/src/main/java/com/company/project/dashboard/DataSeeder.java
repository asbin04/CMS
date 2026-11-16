package com.company.project.dashboard;

import com.company.project.dashboard.repository.ContractRepository;
import com.company.project.dashboard.repository.EmployeeApprovalRepository;
import com.company.project.dashboard.repository.FollowUpItemRepository;
import com.company.project.dashboard.repository.OpportunityRepository;
import com.company.project.dashboard.service.ApprovalService;
import com.company.project.dashboard.service.ContractService;
import com.company.project.dashboard.service.FollowUpService;
import com.company.project.dashboard.service.OpportunityService;
import com.company.project.proposals.repository.ProposalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

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
    private final ProposalRepository proposalRepository;
    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        long followUpCount = followUpRepository.count();
        if (followUpCount == 0) {
            log.info("Initializing Follow-Up Queue seed data in database...");
            followUpService.resetSeedData();
            log.info("Follow-Up Queue seed data initialized with {} items.", followUpRepository.count());
        } else {
            log.info("Follow-Up Queue already contains {} items. Skipping seeding.", followUpCount);
        }

        long oppCount = opportunityRepository.count();
        if (oppCount == 0) {
            log.info("Initializing Opportunities seed data in database...");
            opportunityService.resetSeedData();
            log.info("Opportunities seed data initialized with {} items.", opportunityRepository.count());
        } else {
            log.info("Opportunities already contains {} items. Skipping seeding.", oppCount);
        }

        long approvalCount = employeeApprovalRepository.count();
        if (approvalCount == 0) {
            log.info("Initializing Approvals seed data in database...");
            approvalService.resetSeedData();
            log.info("Approvals seed data initialized with {} employee items.", employeeApprovalRepository.count());
        } else {
            log.info("Approvals already contains {} employee items. Skipping seeding.", approvalCount);
        }

        long contractCount = contractRepository.count();
        if (contractCount == 0) {
            log.info("Initializing Contracts seed data in database...");
            contractService.resetSeedData();
            log.info("Contracts seed data initialized with {} items.", contractRepository.count());
        } else {
            log.info("Contracts already contains {} items. Skipping seeding.", contractCount);
        }

        long proposalCount = proposalRepository.count();
        if (proposalCount == 0) {
            log.info("Initializing Proposals seed data in database...");
            try {
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                        new ClassPathResource("db/dev-migration/V5__seed_proposals_data.sql")
                );
                populator.execute(dataSource);
                log.info("Proposals seed data initialized with {} items.", proposalRepository.count());
            } catch (Exception e) {
                log.error("Failed to seed proposals: {}", e.getMessage(), e);
            }
        } else {
            log.info("Proposals already contains {} items. Skipping seeding.", proposalCount);
        }
    }
}
