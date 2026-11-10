package com.company.project.projects.service;

import com.company.project.common.exception.ResourceNotFoundException;
import com.company.project.projects.dto.ProjectDto;
import com.company.project.projects.dto.ProjectTaskDto;
import com.company.project.projects.entity.ProjectEntity;
import com.company.project.projects.entity.ProjectTaskEntity;
import com.company.project.projects.repository.ProjectRepository;
import com.company.project.projects.repository.ProjectTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectMasterService {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;

    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAllByOrderByProjectIdAsc().stream()
                .map(this::mapProject)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(String projectId) {
        ProjectEntity entity = projectRepository.findByProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));
        return mapProject(entity);
    }

    @Transactional(readOnly = true)
    public List<ProjectTaskDto> getTasksByProjectId(String projectId) {
        return projectTaskRepository.findByProjectIdOrderByTaskIdAsc(projectId).stream()
                .map(this::mapTask)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectTaskDto getTaskById(String taskId) {
        ProjectTaskEntity entity = projectTaskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));
        return mapTask(entity);
    }

    private ProjectDto mapProject(ProjectEntity entity) {
        return ProjectDto.builder()
                .projectId(entity.getProjectId())
                .id(entity.getProjectId())
                .projectName(entity.getProjectName())
                .name(entity.getProjectName())
                .clientId(entity.getClientId())
                .status(entity.getStatus())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private ProjectTaskDto mapTask(ProjectTaskEntity entity) {
        return ProjectTaskDto.builder()
                .taskId(entity.getTaskId())
                .id(entity.getTaskId())
                .projectId(entity.getProjectId())
                .taskName(entity.getTaskName())
                .name(entity.getTaskName())
                .billableDefault(entity.getBillableDefault())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}

