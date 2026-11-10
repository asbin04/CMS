package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectModuleCounterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectModuleCounterRepository extends JpaRepository<ProjectModuleCounterEntity, ProjectModuleCounterEntity.ProjectModuleCounterId> {

    Optional<ProjectModuleCounterEntity> findByEntityTypeAndPeriodKey(String entityType, String periodKey);
}

