package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<ProjectEntity, String>, JpaSpecificationExecutor<ProjectEntity> {

    @Query("SELECT p FROM ProjectEntity p WHERE p.id = :identifier OR p.projectCode = :identifier")
    Optional<ProjectEntity> findByProjectId(@Param("identifier") String identifier);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM ProjectEntity p WHERE p.id = :identifier OR p.projectCode = :identifier")
    boolean existsByProjectId(@Param("identifier") String identifier);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM ProjectEntity p WHERE (p.id = :identifier OR p.projectCode = :identifier) AND p.clientId = :clientId")
    boolean existsByProjectIdAndClientId(@Param("identifier") String identifier, @Param("clientId") String clientId);

    List<ProjectEntity> findAllByOrderByProjectCodeAsc();

    default List<ProjectEntity> findAllByOrderByProjectIdAsc() {
        return findAllByOrderByProjectCodeAsc();
    }
}
