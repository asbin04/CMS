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
        log.info("ProjectDeploymentServiceImpl initialized (auto-seeding disabled).");
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
        List<String> statuses = repository.findDistinctDeploymentStatuses();
        List<String> handovers = repository.findDistinctHandoverStatuses();
        List<String> owners = repository.findDistinctDeploymentOwners();
        List<String> projects = repository.findDistinctProjectIds();

        return DeploymentFilterOptionsResponse.builder()
                .environments(environments)
                .deploymentStatuses(statuses)
                .handoverStatuses(handovers)
                .owners(owners)
                .projects(projects)
                .build();
    }

    @Override
    @Transactional
    public void resetSeedData() {
        repository.deleteAll();
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
