package com.company.project.hr.repository;

import com.company.project.hr.entity.EmployeeApprovalEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HrEmployeeApprovalRepository extends JpaRepository<EmployeeApprovalEntity, Long> {

    long countByStatus(String status);

    List<EmployeeApprovalEntity> findByStatus(String status);

    long countByStatusIgnoreCase(String status);

    List<EmployeeApprovalEntity> findByStatusIgnoreCaseOrderBySortOrderAsc(String status);

    List<EmployeeApprovalEntity> findAllByOrderBySortOrderAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM EmployeeApprovalEntity a WHERE a.id = :id")
    Optional<EmployeeApprovalEntity> findByIdForUpdate(@Param("id") Long id);
}
