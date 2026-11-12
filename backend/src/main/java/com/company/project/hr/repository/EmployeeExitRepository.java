package com.company.project.hr.repository;

import com.company.project.hr.entity.EmployeeExitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmployeeExitRepository extends JpaRepository<EmployeeExitEntity, Long>, JpaSpecificationExecutor<EmployeeExitEntity> {

    Optional<EmployeeExitEntity> findByExitId(String exitId);

    boolean existsByExitId(String exitId);

    void deleteByExitId(String exitId);

    long countByExitStatus(String exitStatus);

    long countByExitReadiness(String exitReadiness);

    @Query("SELECT COUNT(e) FROM EmployeeExitEntity e WHERE e.exitStatus = 'Pending'")
    long countPendingApprovals();

    @Query("SELECT COUNT(e) FROM EmployeeExitEntity e WHERE e.exitStatus = 'Approved'")
    long countApprovedExits();

    @Query("SELECT COUNT(e) FROM EmployeeExitEntity e WHERE e.exitReadiness = 'Completed'")
    long countCompletedExits();
}

