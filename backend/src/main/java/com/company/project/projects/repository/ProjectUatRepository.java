package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectUatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectUatRepository extends JpaRepository<ProjectUatEntity, String> {

    List<ProjectUatEntity> findAllByOrderByIdDesc();

    List<ProjectUatEntity> findByProjectIdOrderByIdDesc(String projectId);

    long countByStatusIgnoreCase(String status);

    long countByClientApprovalIgnoreCase(String clientApproval);

    @Query("SELECT COUNT(u) FROM ProjectUatEntity u WHERE (u.defectId IS NOT NULL AND u.defectId != '' AND u.defectId != '-') OR LOWER(u.status) = 'failed'")
    long countDefects();

    @Query("SELECT DISTINCT u.projectId FROM ProjectUatEntity u WHERE u.projectId IS NOT NULL ORDER BY u.projectId")
    List<String> findDistinctProjectIds();

    @Query("SELECT DISTINCT u.status FROM ProjectUatEntity u WHERE u.status IS NOT NULL ORDER BY u.status")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT u.clientApproval FROM ProjectUatEntity u WHERE u.clientApproval IS NOT NULL ORDER BY u.clientApproval")
    List<String> findDistinctClientApprovals();

    @Query("SELECT DISTINCT u.testerName FROM ProjectUatEntity u WHERE u.testerName IS NOT NULL ORDER BY u.testerName")
    List<String> findDistinctTesters();

    @Query("SELECT u FROM ProjectUatEntity u WHERE " +
           "(:projectId IS NULL OR :projectId = '' OR :projectId = 'All' OR LOWER(u.projectId) = LOWER(:projectId)) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR LOWER(u.status) = LOWER(:status)) AND " +
           "(:clientApproval IS NULL OR :clientApproval = '' OR :clientApproval = 'All' OR LOWER(u.clientApproval) = LOWER(:clientApproval)) AND " +
           "(:tester IS NULL OR :tester = '' OR :tester = 'All' OR LOWER(u.testerName) = LOWER(:tester)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(u.id) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.projectId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.requirementId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.testCase) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.expectedResult) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.actualResult) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.testerName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY u.id DESC")
    List<ProjectUatEntity> findFiltered(
            @Param("search") String search,
            @Param("projectId") String projectId,
            @Param("status") String status,
            @Param("clientApproval") String clientApproval,
            @Param("tester") String tester
    );
}
