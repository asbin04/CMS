package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectModuleCounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectModuleCounterRepository extends JpaRepository<ProjectModuleCounterEntity, ProjectModuleCounterEntity.ProjectModuleCounterId> {

    Optional<ProjectModuleCounterEntity> findByEntityTypeAndPeriodKey(String entityType, String periodKey);
}

