package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.EmployeeMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface EmployeeMasterRepository extends JpaRepository<EmployeeMaster, Long> {

    List<EmployeeMaster> findAllByOrderByOrderIndexAscIdAsc();

    Optional<EmployeeMaster> findByEmployeeId(String employeeId);

    boolean existsByEmployeeId(String employeeId);

    long countByStatusIgnoreCase(String status);

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeMaster e")
    BigDecimal sumTotalMonthlyCtc();

    @Query("SELECT COUNT(e) FROM EmployeeMaster e WHERE e.createdAt < :cutoff")
    long countBefore(@org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff);

    @Query("SELECT COUNT(e) FROM EmployeeMaster e WHERE LOWER(e.status) = LOWER(:status) AND e.createdAt < :cutoff")
    long countByStatusBefore(@org.springframework.data.repository.query.Param("status") String status, @org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff);

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeMaster e WHERE e.createdAt < :cutoff")
    BigDecimal sumTotalMonthlyCtcBefore(@org.springframework.data.repository.query.Param("cutoff") java.time.LocalDateTime cutoff);
}

