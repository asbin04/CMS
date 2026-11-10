package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectDevelopmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface ProjectDevelopmentRepository extends JpaRepository<ProjectDevelopmentEntity, String>, JpaSpecificationExecutor<ProjectDevelopmentEntity> {

    Optional<ProjectDevelopmentEntity> findByDevelopmentId(String developmentId);

    boolean existsByDevelopmentId(String developmentId);

    long countByStatusIgnoreCase(String status);

    long countByCodeReviewStatusIgnoreCase(String codeReviewStatus);

    @Query("SELECT COUNT(d) FROM ProjectDevelopmentEntity d WHERE LOWER(d.status) = LOWER(:status) AND d.createdAt < :cutoff")
    long countByStatusIgnoreCaseAndCreatedAtBefore(@Param("status") String status, @Param("cutoff") OffsetDateTime cutoff);

    @Query("SELECT COUNT(d) FROM ProjectDevelopmentEntity d WHERE LOWER(d.codeReviewStatus) = LOWER(:codeReviewStatus) AND d.createdAt < :cutoff")
    long countByCodeReviewStatusIgnoreCaseAndCreatedAtBefore(@Param("codeReviewStatus") String codeReviewStatus, @Param("cutoff") OffsetDateTime cutoff);

    @Query("SELECT COUNT(d) FROM ProjectDevelopmentEntity d WHERE d.createdAt < :cutoff")
    long countByCreatedAtBefore(@Param("cutoff") OffsetDateTime cutoff);
}

