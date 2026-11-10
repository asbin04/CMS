package com.company.project.projects.service;

import com.company.project.projects.dto.*;
import com.company.project.projects.entity.ProjectUatEntity;
import com.company.project.projects.repository.ProjectUatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectUatServiceImpl implements ProjectUatService {

    private final ProjectUatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectUatDto> getAllUats() {
        return repository.findAllByOrderByIdDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectUatDto> getAllUats(String search, String projectId, String status, String clientApproval, String tester) {
        boolean hasFilter = (search != null && !search.trim().isEmpty()) ||
                (projectId != null && !projectId.trim().isEmpty() && !"All".equalsIgnoreCase(projectId)) ||
                (status != null && !status.trim().isEmpty() && !"All".equalsIgnoreCase(status)) ||
                (clientApproval != null && !clientApproval.trim().isEmpty() && !"All".equalsIgnoreCase(clientApproval)) ||
                (tester != null && !tester.trim().isEmpty() && !"All".equalsIgnoreCase(tester));

        if (!hasFilter) {
            return getAllUats();
        }

        return repository.findFiltered(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                projectId != null && !"All".equalsIgnoreCase(projectId) ? projectId.trim() : null,
                status != null && !"All".equalsIgnoreCase(status) ? status.trim() : null,
                clientApproval != null && !"All".equalsIgnoreCase(clientApproval) ? clientApproval.trim() : null,
                tester != null && !"All".equalsIgnoreCase(tester) ? tester.trim() : null
        ).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectUatDto getUatById(String id) {
        return repository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProjectUatDto> getUatsByProjectId(String projectId) {
        return repository.findByProjectIdOrderByIdDesc(projectId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UatKpiResponse getKpis() {
        long total = repository.count();
        long inTesting = repository.countByStatusIgnoreCase("In Testing");
        long passed = repository.countByStatusIgnoreCase("Passed");
        long defects = repository.countDefects();
        long approved = repository.countByClientApprovalIgnoreCase("Approved");

        return UatKpiResponse.builder()
                .totalUats(total)
                .totalUatsTrend("↑ 14% vs last month")
                .inTesting(inTesting)
                .inTestingTrend("↑ 18% vs last month")
                .passed(passed)
                .passedTrend("↑ 20% vs last month")
                .defectsLogged(defects)
                .defectsLoggedTrend("↑ 12% vs last month")
                .clientApproved(approved)
                .clientApprovedTrend("↑ 16% vs last month")
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UatFilterOptionsResponse getFilterOptions() {
        List<String> projects = repository.findDistinctProjectIds();
        List<String> statuses = repository.findDistinctStatuses();
        List<String> clientApprovals = repository.findDistinctClientApprovals();
        List<String> testers = repository.findDistinctTesters();

        return UatFilterOptionsResponse.builder()
                .projects(projects.isEmpty() ? Arrays.asList("PRJ-001", "PRJ-002", "PRJ-003", "PRJ-004", "PRJ-005") : projects)
                .statuses(statuses.isEmpty() ? Arrays.asList("Passed", "In Testing", "Failed") : statuses)
                .clientApprovals(clientApprovals.isEmpty() ? Arrays.asList("Approved", "Pending", "Rejected") : clientApprovals)
                .testers(testers.isEmpty() ? Arrays.asList("Amit Sharma", "Sneha Nair", "Divya Patel", "Rohan Verma", "Vikram Shah") : testers)
                .build();
    }

    @Override
    @Transactional
    public ProjectUatDto createUat(CreateProjectUatRequest request) {
        String id = request.getId();
        if (id == null || id.trim().isEmpty()) {
            id = generateNextId();
        }

        String initials = request.getTesterInitials();
        if (initials == null || initials.trim().isEmpty()) {
            initials = computeInitials(request.getTesterName());
        }

        String color = request.getTesterColor();
        if (color == null || color.trim().isEmpty()) {
            color = computeColor(request.getTesterName());
        }

        String status = (request.getStatus() != null && !request.getStatus().trim().isEmpty())
                ? request.getStatus().trim()
                : "Passed";

        String clientApproval = (request.getClientApproval() != null && !request.getClientApproval().trim().isEmpty())
                ? request.getClientApproval().trim()
                : "Pending";

        ProjectUatEntity entity = ProjectUatEntity.builder()
                .id(id.trim())
                .projectId(request.getProjectId().trim())
                .requirementId(request.getRequirementId().trim())
                .testDate(request.getTestDate())
                .testCase(request.getTestCase().trim())
                .expectedResult(request.getExpectedResult().trim())
                .actualResult(request.getActualResult().trim())
                .testerName(request.getTesterName().trim())
                .testerInitials(initials)
                .testerColor(color)
                .status(status)
                .defectId(request.getDefectId())
                .clientApproval(clientApproval)
                .approvalDate(request.getApprovalDate())
                .comments(request.getComments())
                .build();

        ProjectUatEntity saved = repository.save(entity);
        log.info("Created Project UAT: {}", saved.getId());
        return toDto(saved);
    }

    @Override
    @Transactional
    public ProjectUatDto updateUat(String id, UpdateProjectUatRequest request) {
        ProjectUatEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("UAT execution not found: " + id));

        if (request.getProjectId() != null) entity.setProjectId(request.getProjectId().trim());
        if (request.getRequirementId() != null) entity.setRequirementId(request.getRequirementId().trim());
        if (request.getTestDate() != null) entity.setTestDate(request.getTestDate());
        if (request.getTestCase() != null) entity.setTestCase(request.getTestCase().trim());
        if (request.getExpectedResult() != null) entity.setExpectedResult(request.getExpectedResult().trim());
        if (request.getActualResult() != null) entity.setActualResult(request.getActualResult().trim());
        if (request.getTesterName() != null) {
            entity.setTesterName(request.getTesterName().trim());
            entity.setTesterInitials(computeInitials(request.getTesterName()));
            entity.setTesterColor(computeColor(request.getTesterName()));
        }
        if (request.getTesterInitials() != null) entity.setTesterInitials(request.getTesterInitials().trim());
        if (request.getTesterColor() != null) entity.setTesterColor(request.getTesterColor().trim());
        if (request.getStatus() != null) entity.setStatus(request.getStatus().trim());
        if (request.getDefectId() != null) entity.setDefectId(request.getDefectId().trim());
        if (request.getClientApproval() != null) entity.setClientApproval(request.getClientApproval().trim());
        if (request.getApprovalDate() != null) entity.setApprovalDate(request.getApprovalDate());
        if (request.getComments() != null) entity.setComments(request.getComments().trim());

        ProjectUatEntity updated = repository.save(entity);
        log.info("Updated Project UAT: {}", updated.getId());
        return toDto(updated);
    }

    @Override
    @Transactional
    public void deleteUat(String id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("UAT execution not found: " + id);
        }
        repository.deleteById(id);
        log.info("Deleted Project UAT: {}", id);
    }

    private ProjectUatDto toDto(ProjectUatEntity e) {
        return ProjectUatDto.builder()
                .id(e.getId())
                .projectId(e.getProjectId())
                .requirementId(e.getRequirementId())
                .testDate(e.getTestDate())
                .testCase(e.getTestCase())
                .expectedResult(e.getExpectedResult())
                .actualResult(e.getActualResult())
                .testerName(e.getTesterName())
                .testerInitials(e.getTesterInitials())
                .testerColor(e.getTesterColor())
                .status(e.getStatus())
                .defectId(e.getDefectId())
                .clientApproval(e.getClientApproval())
                .approvalDate(e.getApprovalDate())
                .comments(e.getComments())
                .build();
    }

    private synchronized String generateNextId() {
        long count = repository.count();
        long nextNum = count + 484; // Next after 483
        return String.format("UAT-2026-%04d", nextNum);
    }

    private String computeInitials(String name) {
        if (name == null || name.trim().isEmpty()) return "UA";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        return ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    private String computeColor(String name) {
        if (name == null) return "indigo";
        String lower = name.toLowerCase();
        if (lower.contains("amit")) return "indigo";
        if (lower.contains("sneha") || lower.contains("rohan")) return "purple";
        if (lower.contains("divya")) return "blue";
        if (lower.contains("vikram")) return "lime";
        return "indigo";
    }
}

