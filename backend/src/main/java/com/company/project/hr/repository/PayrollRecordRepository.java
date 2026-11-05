package com.company.project.hr.repository;

import com.company.project.hr.entity.PayrollRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecordEntity, Long>, JpaSpecificationExecutor<PayrollRecordEntity> {

    Optional<PayrollRecordEntity> findByPayrollId(String payrollId);

    boolean existsByPayrollId(String payrollId);

    void deleteByPayrollId(String payrollId);

    @Query("SELECT COUNT(DISTINCT p.employeeId) FROM PayrollRecordEntity p")
    long countDistinctEmployees();

    @Query("SELECT COUNT(DISTINCT p.employeeId) FROM PayrollRecordEntity p WHERE LOWER(p.payrollMonth) = LOWER(:month)")
    long countDistinctEmployeesByMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(p.grossSalary), 0) FROM PayrollRecordEntity p WHERE LOWER(p.payrollMonth) = LOWER(:month)")
    BigDecimal sumGrossSalaryByMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(p.grossSalary), 0) FROM PayrollRecordEntity p")
    BigDecimal sumTotalGrossSalary();

    @Query("SELECT COALESCE(SUM(p.monthlyCtc), 0) FROM PayrollRecordEntity p WHERE LOWER(p.payrollMonth) = LOWER(:month)")
    BigDecimal sumMonthlyCtcByMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(p.monthlyCtc), 0) FROM PayrollRecordEntity p")
    BigDecimal sumTotalMonthlyCtc();

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM PayrollRecordEntity p WHERE p.paymentStatus = 'Paid' AND LOWER(p.payrollMonth) = LOWER(:month)")
    BigDecimal sumNetSalaryDisbursedByMonth(@Param("month") String month);

    @Query("SELECT COALESCE(SUM(p.netSalary), 0) FROM PayrollRecordEntity p WHERE p.paymentStatus = 'Paid'")
    BigDecimal sumTotalNetSalaryDisbursed();

    @Query("SELECT COUNT(p) FROM PayrollRecordEntity p WHERE p.paymentStatus = 'Pending' AND LOWER(p.payrollMonth) = LOWER(:month)")
    long countPendingPayrollsByMonth(@Param("month") String month);

    @Query("SELECT COUNT(p) FROM PayrollRecordEntity p WHERE p.paymentStatus = 'Pending'")
    long countTotalPendingPayrolls();

    @Query("SELECT MAX(p.updatedAt) FROM PayrollRecordEntity p WHERE LOWER(p.payrollMonth) = LOWER(:month)")
    OffsetDateTime findMaxUpdatedAtByMonth(@Param("month") String month);

    @Query("SELECT MAX(p.updatedAt) FROM PayrollRecordEntity p")
    OffsetDateTime findMaxUpdatedAt();

    @Query("SELECT p.payrollMonth FROM PayrollRecordEntity p GROUP BY p.payrollMonth ORDER BY MAX(p.id) DESC")
    List<String> findDistinctPayrollMonths();

    @Query("SELECT DISTINCT p.employmentType FROM PayrollRecordEntity p ORDER BY p.employmentType ASC")
    List<String> findDistinctEmploymentTypes();

    @Query("SELECT DISTINCT p.paymentStatus FROM PayrollRecordEntity p ORDER BY p.paymentStatus ASC")
    List<String> findDistinctPaymentStatuses();

    @Query("SELECT DISTINCT p.employeeId, p.employeeName FROM PayrollRecordEntity p ORDER BY p.employeeName ASC")
    List<Object[]> findDistinctEmployeePairs();
}
