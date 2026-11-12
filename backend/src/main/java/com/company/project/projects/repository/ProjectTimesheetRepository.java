package com.company.project.projects.repository;

import com.company.project.projects.entity.ProjectTimesheetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProjectTimesheetRepository extends JpaRepository<ProjectTimesheetEntity, String>, JpaSpecificationExecutor<ProjectTimesheetEntity> {

    Optional<ProjectTimesheetEntity> findByTimesheetId(String timesheetId);

    boolean existsByTimesheetId(String timesheetId);

    long countByApprovalStatusIgnoreCase(String approvalStatus);

    @Query("SELECT COUNT(t) FROM ProjectTimesheetEntity t WHERE LOWER(TRIM(t.approvalStatus)) IN ('pending', 'pending approval')")
    long countPendingApprovals();

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM ProjectTimesheetEntity t")
    BigDecimal sumTotalHours();

    @Query("SELECT COALESCE(SUM(t.hours), 0) FROM ProjectTimesheetEntity t WHERE t.isBillable = true")
    BigDecimal sumBillableHours();

    @Query("SELECT COALESCE(SUM(t.billableAmount), 0) FROM ProjectTimesheetEntity t WHERE t.isBillable = true")
    BigDecimal sumBillableAmount();
}

