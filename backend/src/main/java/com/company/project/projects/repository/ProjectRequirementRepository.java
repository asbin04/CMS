package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectRequirementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRequirementRepository extends JpaRepository<ProjectRequirementEntity, String>, JpaSpecificationExecutor<ProjectRequirementEntity> {

    Optional<ProjectRequirementEntity> findByRequirementId(String requirementId);

    boolean existsByRequirementId(String requirementId);

    @Query("SELECT CASE WHEN COUNT(pr) > 0 THEN true ELSE false END FROM ProjectRequirementEntity pr WHERE pr.requirementId = :requirementId AND (pr.projectId = :projectId OR pr.projectId IN (SELECT p.projectCode FROM ProjectEntity p WHERE p.id = :projectId))")
    boolean existsByProjectIdAndRequirementId(@Param("projectId") String projectId, @Param("requirementId") String requirementId);

    long countByStatusIgnoreCase(String status);

    long countByScopeFreezeTrue();
}

