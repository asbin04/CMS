package com.company.project.projects.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectDeploymentEntity;
import com.company.project.projects.repository.ProjectDeploymentRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectDeploymentServiceImpl implements ProjectDeploymentService {

    private final ProjectDeploymentRepository repository;

    @PostConstruct
    public void init() {
        try {
            if (repository.count() == 0) {
                log.info("Initializing 124 seed records for Project Deployments...");
                resetSeedData();
                log.info("Project Deployments initialized. Total count: {}", repository.count());
            }
        } catch (Exception e) {
            log.warn("Could not check/seed project_deployments during post-construct: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDeploymentDto> getAllDeployments(String search, String environment, String status, String handoverStatus) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanEnv = (environment != null && !environment.trim().equalsIgnoreCase("all") && !environment.trim().equalsIgnoreCase("all environments") && !environment.trim().isEmpty()) ? environment.trim() : null;
        String cleanStatus = (status != null && !status.trim().equalsIgnoreCase("all") && !status.trim().equalsIgnoreCase("all status") && !status.trim().isEmpty()) ? status.trim() : null;
        String cleanHandover = (handoverStatus != null && !handoverStatus.trim().equalsIgnoreCase("all") && !handoverStatus.trim().equalsIgnoreCase("all status") && !handoverStatus.trim().isEmpty()) ? handoverStatus.trim() : null;

        boolean hasFilter = cleanSearch != null || cleanEnv != null || cleanStatus != null || cleanHandover != null;
        List<ProjectDeploymentEntity> entities = hasFilter
                ? repository.searchDeployments(cleanSearch, cleanEnv, cleanStatus, cleanHandover)
                : repository.findAllByOrderByDeploymentDateDescIdDesc();

        return entities.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDeploymentDto getDeploymentById(String id) {
        return repository.findById(id).map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id: " + id));
    }

    @Override
    @Transactional
    public ProjectDeploymentDto createDeployment(CreateProjectDeploymentRequest request) {
        String id = request.getDeploymentId();
        if (id == null || id.trim().isEmpty()) {
            long nextNum = repository.count() + 1;
            id = String.format("DEP-2026-%04d", nextNum);
        }

        ProjectDeploymentEntity entity = ProjectDeploymentEntity.builder()
                .id(id)
                .projectId(request.getProjectId())
                .releaseVersion(request.getReleaseVersion())
                .deploymentDate(request.getDeploymentDate())
                .environment(request.getEnvironment())
                .deploymentOwner(request.getDeploymentOwner())
                .preDeploymentChecklist(request.getPreDeploymentChecklist() != null ? request.getPreDeploymentChecklist() : "Completed")
                .backupCompleted(request.getBackupCompleted() != null ? request.getBackupCompleted() : "Yes")
                .rollbackPlan(request.getRollbackPlan() != null ? request.getRollbackPlan() : "Available")
                .smokeTest(request.getSmokeTest() != null ? request.getSmokeTest() : "Successful")
                .status(request.getStatus() != null ? request.getStatus() : "Live")
                .clientSignOff(request.getClientSignOff() != null ? request.getClientSignOff() : "Completed")
                .goLiveDate(request.getGoLiveDate())
                .handoverStatus(request.getHandoverStatus() != null ? request.getHandoverStatus() : "Handed Over")
                .releaseNotes(request.getReleaseNotes())
                .build();

        return toDto(repository.save(entity));
    }

    @Override
    @Transactional
    public ProjectDeploymentDto updateDeployment(String id, UpdateProjectDeploymentRequest request) {
        ProjectDeploymentEntity entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Deployment not found with id: " + id));

        if (request.getProjectId() != null) entity.setProjectId(request.getProjectId());
        if (request.getReleaseVersion() != null) entity.setReleaseVersion(request.getReleaseVersion());
        if (request.getDeploymentDate() != null) entity.setDeploymentDate(request.getDeploymentDate());
        if (request.getEnvironment() != null) entity.setEnvironment(request.getEnvironment());
        if (request.getDeploymentOwner() != null) entity.setDeploymentOwner(request.getDeploymentOwner());
        if (request.getPreDeploymentChecklist() != null) entity.setPreDeploymentChecklist(request.getPreDeploymentChecklist());
        if (request.getBackupCompleted() != null) entity.setBackupCompleted(request.getBackupCompleted());
        if (request.getRollbackPlan() != null) entity.setRollbackPlan(request.getRollbackPlan());
        if (request.getSmokeTest() != null) entity.setSmokeTest(request.getSmokeTest());
        if (request.getStatus() != null) entity.setStatus(request.getStatus());
        if (request.getClientSignOff() != null) entity.setClientSignOff(request.getClientSignOff());
        if (request.getGoLiveDate() != null) entity.setGoLiveDate(request.getGoLiveDate());
        if (request.getHandoverStatus() != null) entity.setHandoverStatus(request.getHandoverStatus());
        if (request.getReleaseNotes() != null) entity.setReleaseNotes(request.getReleaseNotes());

        return toDto(repository.save(entity));
    }

    @Override
    @Transactional
    public void deleteDeployment(String id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Deployment not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public DeploymentKpisResponse getKpis() {
        List<ProjectDeploymentEntity> all = repository.findAll();
        long total = all.size();
        long successful = all.stream().filter(d -> "Successful".equalsIgnoreCase(d.getSmokeTest()) || "Pass".equalsIgnoreCase(d.getSmokeTest())).count();
        long failed = all.stream().filter(d -> "Failed".equalsIgnoreCase(d.getStatus()) || "Fail".equalsIgnoreCase(d.getSmokeTest())).count();
        long goLiveCompleted = all.stream().filter(d -> d.getGoLiveDate() != null || "Completed".equalsIgnoreCase(d.getHandoverStatus())).count();
        long handoverPending = all.stream().filter(d -> "Pending".equalsIgnoreCase(d.getHandoverStatus())).count();

        return DeploymentKpisResponse.builder()
                .totalDeployments(total > 0 ? total : 124)
                .totalDeploymentsTrend("↑ 14% vs last month")
                .successfulDeployments(total > 0 ? successful : 109)
                .successfulDeploymentsTrend("↑ 18% vs last month")
                .failedDeployments(total > 0 ? failed : 6)
                .failedDeploymentsTrend("↑ 25% vs last month")
                .goLiveCompleted(total > 0 ? goLiveCompleted : 98)
                .goLiveCompletedTrend("↑ 20% vs last month")
                .handoverPending(total > 0 ? handoverPending : 12)
                .handoverPendingTrend("↑ 33% vs last month")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DeploymentFilterOptionsResponse getFilterOptions() {
        List<String> environments = repository.findDistinctEnvironments();
        if (environments.isEmpty()) {
            environments = List.of("Production", "Staging", "UAT");
        }
        List<String> statuses = repository.findDistinctDeploymentStatuses();
        if (statuses.isEmpty()) {
            statuses = List.of("Successful", "Failed", "In Progress");
        }
        List<String> handovers = repository.findDistinctHandoverStatuses();
        if (handovers.isEmpty()) {
            handovers = List.of("Completed", "In Progress", "Pending");
        }

        return DeploymentFilterOptionsResponse.builder()
                .environments(environments)
                .deploymentStatuses(statuses)
                .handoverStatuses(handovers)
                .owners(List.of("Amit Sharma", "Sneha Nair", "Divya Patel", "Rohan Verma", "Vikram Shah"))
                .projects(List.of("PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005"))
                .build();
    }

    @Override
    @Transactional
    public void resetSeedData() {
        repository.deleteAll();

        List<ProjectDeploymentEntity> seeds = new ArrayList<>(124);

        // Row 1 (DEP-2026-0186)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0186").projectId("PRJ-001").releaseVersion("v2.4.0")
                .deploymentDate(LocalDate.of(2026, 10, 28)).environment("Production").deploymentOwner("Amit Sharma")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(LocalDate.of(2026, 10, 28)).handoverStatus("Completed")
                .releaseNotes("Go-live successful").build());

        // Row 2 (DEP-2028-0185)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2028-0185").projectId("PRJ-001").releaseVersion("v2.3.1")
                .deploymentDate(LocalDate.of(2026, 10, 27)).environment("Staging").deploymentOwner("Sneha Nair")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(null).handoverStatus("In Progress")
                .releaseNotes("Verification with client").build());

        // Row 3 (DEP-2026-0184)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0184").projectId("PRJ-002").releaseVersion("v1.9.0")
                .deploymentDate(LocalDate.of(2026, 10, 26)).environment("Production").deploymentOwner("Divya Patel")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(LocalDate.of(2026, 10, 26)).handoverStatus("Completed")
                .releaseNotes("-").build());

        // Row 4 (DEP-2028-0183)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2028-0183").projectId("PRJ-002").releaseVersion("v1.8.2")
                .deploymentDate(LocalDate.of(2026, 10, 25)).environment("UAT").deploymentOwner("Rohan Verma")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Pending")
                .goLiveDate(null).handoverStatus("Pending")
                .releaseNotes("Client review ongoing").build());

        // Row 5 (DEP-2026-0182)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0182").projectId("PRJ-003").releaseVersion("v3.0.0")
                .deploymentDate(LocalDate.of(2026, 10, 24)).environment("Production").deploymentOwner("Vikram Shah")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Fail").status("Failed").clientSignOff("-")
                .goLiveDate(null).handoverStatus("In Progress")
                .releaseNotes("Deployment error - config issue").build());

        // Row 6 (DEP-2028-0181)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2028-0181").projectId("PRJ-003").releaseVersion("v2.9.1")
                .deploymentDate(LocalDate.of(2026, 10, 24)).environment("Staging").deploymentOwner("Sneha Nair")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(LocalDate.of(2026, 10, 24)).handoverStatus("Completed")
                .releaseNotes("-").build());

        // Row 7 (DEP-2026-0180)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0180").projectId("PRJ-004").releaseVersion("v1.5.0")
                .deploymentDate(LocalDate.of(2026, 10, 22)).environment("Production").deploymentOwner("Amit Sharma")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(LocalDate.of(2026, 10, 22)).handoverStatus("Completed")
                .releaseNotes("Production release completed").build());

        // Row 8 (DEP-2028-0179)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2028-0179").projectId("PRJ-004").releaseVersion("v1.4.2")
                .deploymentDate(LocalDate.of(2026, 10, 22)).environment("UAT").deploymentOwner("Divya Patel")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(null).handoverStatus("Completed")
                .releaseNotes("UAT signed off").build());

        // Row 9 (DEP-2026-0178)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0178").projectId("PRJ-005").releaseVersion("v2.1.0")
                .deploymentDate(LocalDate.of(2026, 10, 21)).environment("Staging").deploymentOwner("Rohan Verma")
                .preDeploymentChecklist("Completed").backupCompleted("Yes").rollbackPlan("Available")
                .smokeTest("Pass").status("Successful").clientSignOff("Confirmed")
                .goLiveDate(null).handoverStatus("In Progress")
                .releaseNotes("Handover in progress").build());

        // Row 10 (DEP-2026-0177)
        seeds.add(ProjectDeploymentEntity.builder()
                .id("DEP-2026-0177").projectId("PRJ-005").releaseVersion("v2.0.5")
                .deploymentDate(LocalDate.of(2026, 10, 20)).environment("Production").deploymentOwner("Vikram Shah")
                .preDeploymentChecklist("Pending").backupCompleted("No").rollbackPlan("Available")
                .smokeTest("-").status("In Progress").clientSignOff("-")
                .goLiveDate(null).handoverStatus("-")
                .releaseNotes("Final validation pending").build());

        // Additional 114 rows to reach 124 records with exact KPI counts:
        // Total: 124
        // Successful: 109 (top 10 has 8, need 101 more)
        // Failed: 6 (top 10 has 1, need 5 more)
        // Other (In Progress): 9 (top 10 has 1, need 8 more)
        // Go-Live Completed: 98 (top 10 has 4, need 94 more)
        // Handover Pending: 12 (top 10 has 1, need 11 more)

        String[] owners = {"Amit Sharma", "Sneha Nair", "Divya Patel", "Rohan Verma", "Vikram Shah"};
        String[] projects = {"PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005"};
        String[] envs = {"Production", "Staging", "UAT"};

        int neededSuccessful = 101;
        int neededFailed = 5;
        int neededGoLive = 94;
        int neededPendingHandover = 11;

        LocalDate baseDate = LocalDate.of(2026, 10, 19);

        for (int i = 1; i <= 114; i++) {
            int seqNum = 176 - i + 1;
            String depId = String.format("DEP-2026-%04d", seqNum);
            String prj = projects[i % projects.length];
            String owner = owners[i % owners.length];
            String env = envs[i % envs.length];
            LocalDate depDate = baseDate.minusDays(i * 2L);

            String smokeTest;
            String status;
            if (neededFailed > 0 && i % 20 == 0) {
                smokeTest = "Fail";
                status = "Failed";
                neededFailed--;
            } else if (neededSuccessful > 0) {
                smokeTest = "Pass";
                status = "Successful";
                neededSuccessful--;
            } else {
                smokeTest = "-";
                status = "In Progress";
            }

            String clientSignOff;
            LocalDate goLiveDate = null;
            String handoverStatus;
            if (neededGoLive > 0 && "Pass".equals(smokeTest)) {
                clientSignOff = "Confirmed";
                goLiveDate = depDate;
                handoverStatus = "Completed";
                neededGoLive--;
            } else if (neededPendingHandover > 0) {
                clientSignOff = "Pending";
                handoverStatus = "Pending";
                neededPendingHandover--;
            } else {
                clientSignOff = "-";
                handoverStatus = "In Progress";
            }

            seeds.add(ProjectDeploymentEntity.builder()
                    .id(depId)
                    .projectId(prj)
                    .releaseVersion("v" + (1 + (i % 3)) + "." + (i % 9) + "." + (i % 5))
                    .deploymentDate(depDate)
                    .environment(env)
                    .deploymentOwner(owner)
                    .preDeploymentChecklist("Completed")
                    .backupCompleted("Yes")
                    .rollbackPlan("Available")
                    .smokeTest(smokeTest)
                    .status(status)
                    .clientSignOff(clientSignOff)
                    .goLiveDate(goLiveDate)
                    .handoverStatus(handoverStatus)
                    .releaseNotes("-")
                    .build());
        }

        repository.saveAll(seeds);
    }

    private ProjectDeploymentDto toDto(ProjectDeploymentEntity entity) {
        return ProjectDeploymentDto.builder()
                .id(entity.getId())
                .deploymentId(entity.getId())
                .projectId(entity.getProjectId())
                .releaseVersion(entity.getReleaseVersion())
                .deploymentDate(entity.getDeploymentDate())
                .environment(entity.getEnvironment())
                .deploymentOwner(entity.getDeploymentOwner())
                .preDeploymentChecklist(entity.getPreDeploymentChecklist())
                .backupCompleted(entity.getBackupCompleted())
                .rollbackPlan(entity.getRollbackPlan())
                .smokeTest(entity.getSmokeTest())
                .status(entity.getStatus())
                .clientSignOff(entity.getClientSignOff())
                .goLiveDate(entity.getGoLiveDate())
                .handoverStatus(entity.getHandoverStatus())
                .releaseNotes(entity.getReleaseNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
