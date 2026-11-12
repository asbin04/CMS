package com.company.project.hr.repository;

import com.company.project.hr.entity.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long>, JpaSpecificationExecutor<EmployeeEntity> {

    boolean existsByEmployeeId(String employeeId);

    boolean existsByWorkEmail(String workEmail);

    Optional<EmployeeEntity> findByEmployeeId(String employeeId);

    Optional<EmployeeEntity> findByWorkEmail(String workEmail);

    List<EmployeeEntity> findByDepartment(String department);

    List<EmployeeEntity> findByStatus(String status);

    List<EmployeeEntity> findByDepartmentAndStatus(String department, String status);

    long countByStatus(String status);

    long countByDepartmentAndStatus(String department, String status);

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeEntity e WHERE e.status = :status")
    BigDecimal sumMonthlyCtcByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeEntity e WHERE e.department = :department AND e.status = :status")
    BigDecimal sumMonthlyCtcByDepartmentAndStatus(@Param("department") String department, @Param("status") String status);

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeEntity e WHERE e.status IN ('Active', 'On Notice')")
    BigDecimal sumMonthlyCtcForActiveAndNotice();

    @Query("SELECT COALESCE(SUM(e.monthlyCtc), 0) FROM EmployeeEntity e WHERE e.department = :department AND e.status IN ('Active', 'On Notice')")
    BigDecimal sumMonthlyCtcByDepartmentForActiveAndNotice(@Param("department") String department);

    @Query("SELECT e.employeeId FROM EmployeeEntity e WHERE e.employeeId LIKE 'EMP-%'")
    List<String> findAllEmployeeIdsWithPrefix();

    @Query("SELECT e.employeeId, e.department FROM EmployeeEntity e WHERE e.employeeId IS NOT NULL AND e.department IS NOT NULL")
    List<Object[]> findAllEmployeeIdAndDepartment();

    @Query("SELECT e.joiningDate FROM EmployeeEntity e WHERE e.joiningDate IS NOT NULL")
    List<String> findAllJoiningDates();

    @Query("SELECT e.joiningDate FROM EmployeeEntity e WHERE e.department = :department AND e.joiningDate IS NOT NULL")
    List<String> findJoiningDatesByDepartment(@Param("department") String department);
}
