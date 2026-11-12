package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectDeploymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectDeploymentRepository extends JpaRepository<ProjectDeploymentEntity, String>, JpaSpecificationExecutor<ProjectDeploymentEntity> {

    List<ProjectDeploymentEntity> findAllByOrderByDeploymentDateDescIdDesc();

    @Query("""
        SELECT d FROM ProjectDeploymentEntity d
        WHERE (CAST(:search AS string) IS NULL OR
               LOWER(d.id) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(d.projectId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(d.releaseVersion) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(d.deploymentOwner) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR
               LOWER(d.releaseNotes) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
          AND (CAST(:env AS string) IS NULL OR LOWER(d.environment) = LOWER(CAST(:env AS string)))
          AND (CAST(:deployStatus AS string) IS NULL OR LOWER(d.smokeTest) = LOWER(CAST(:deployStatus AS string)) OR LOWER(d.status) = LOWER(CAST(:deployStatus AS string)))
          AND (CAST(:handoverStatus AS string) IS NULL OR LOWER(d.handoverStatus) = LOWER(CAST(:handoverStatus AS string)))
        ORDER BY d.deploymentDate DESC, d.id DESC
    """)
    List<ProjectDeploymentEntity> searchDeployments(
            @Param("search") String search,
            @Param("env") String env,
            @Param("deployStatus") String deployStatus,
            @Param("handoverStatus") String handoverStatus
    );

    @Query("SELECT DISTINCT d.environment FROM ProjectDeploymentEntity d WHERE d.environment IS NOT NULL ORDER BY d.environment")
    List<String> findDistinctEnvironments();

    @Query("SELECT DISTINCT d.smokeTest FROM ProjectDeploymentEntity d WHERE d.smokeTest IS NOT NULL ORDER BY d.smokeTest")
    List<String> findDistinctDeploymentStatuses();

    @Query("SELECT DISTINCT d.handoverStatus FROM ProjectDeploymentEntity d WHERE d.handoverStatus IS NOT NULL ORDER BY d.handoverStatus")
    List<String> findDistinctHandoverStatuses();
}
