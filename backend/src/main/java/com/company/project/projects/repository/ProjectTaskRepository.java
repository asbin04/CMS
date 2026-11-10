package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTaskEntity, String>, JpaSpecificationExecutor<ProjectTaskEntity> {

    Optional<ProjectTaskEntity> findById(String id);

    default Optional<ProjectTaskEntity> findByTaskId(String taskId) {
        return findById(taskId);
    }

    List<ProjectTaskEntity> findByProjectIdOrderByIdAsc(String projectId);

    default List<ProjectTaskEntity> findByProjectIdOrderByTaskIdAsc(String projectId) {
        return findByProjectIdOrderByIdAsc(projectId);
    }

    boolean existsById(String id);

    default boolean existsByTaskId(String taskId) {
        return existsById(taskId);
    }

    @Query("SELECT CASE WHEN COUNT(pt) > 0 THEN true ELSE false END FROM ProjectTaskEntity pt WHERE pt.id = :taskId AND (pt.projectId = :projectId OR pt.projectId IN (SELECT p.projectCode FROM ProjectEntity p WHERE p.id = :projectId))")
    boolean existsByProjectIdAndTaskId(@Param("projectId") String projectId, @Param("taskId") String taskId);
}
