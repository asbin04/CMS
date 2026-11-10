package com.company.project.projects.repository;

import com.company.project.projects.entity.UiuxDesignEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UiuxDesignRepository extends JpaRepository<UiuxDesignEntity, String> {

    List<UiuxDesignEntity> findAllByOrderByIdDesc();

    List<UiuxDesignEntity> findByProjectIdOrderByIdDesc(String projectId);

    long countByStatusIgnoreCase(String status);

    long countByApprovalStatusIgnoreCase(String approvalStatus);

    @Query("SELECT COUNT(u) FROM UiuxDesignEntity u WHERE u.changeRequest IS NOT NULL AND u.changeRequest != '' AND u.changeRequest != '-'")
    long countChangeRequests();

    @Query("SELECT DISTINCT u.projectId FROM UiuxDesignEntity u WHERE u.projectId IS NOT NULL ORDER BY u.projectId")
    List<String> findDistinctProjectIds();

    @Query("SELECT DISTINCT u.designType FROM UiuxDesignEntity u WHERE u.designType IS NOT NULL ORDER BY u.designType")
    List<String> findDistinctDesignTypes();

    @Query("SELECT DISTINCT u.approvalStatus FROM UiuxDesignEntity u WHERE u.approvalStatus IS NOT NULL ORDER BY u.approvalStatus")
    List<String> findDistinctApprovalStatuses();

    @Query("SELECT DISTINCT u.status FROM UiuxDesignEntity u WHERE u.status IS NOT NULL ORDER BY u.status")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT u.designer FROM UiuxDesignEntity u WHERE u.designer IS NOT NULL ORDER BY u.designer")
    List<String> findDistinctDesigners();
}

