package com.company.project.finance.repository;

import com.company.project.finance.entity.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpenseEntity e WHERE e.expenseDate BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalExpensesInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM ExpenseEntity e WHERE e.expenseDate BETWEEN :startDate AND :endDate AND e.isProjectExpense = true")
    BigDecimal sumProjectExpensesInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e FROM ExpenseEntity e WHERE e.expenseDate BETWEEN :startDate AND :endDate ORDER BY e.expenseDate DESC")
    List<ExpenseEntity> findExpensesInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, COALESCE(SUM(e.amount), 0) FROM ExpenseEntity e WHERE e.expenseDate BETWEEN :startDate AND :endDate GROUP BY e.category ORDER BY SUM(e.amount) DESC")
    List<Object[]> sumExpensesByCategoryInPeriod(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    Optional<ExpenseEntity> findByExpenseCode(String expenseCode);

    @Query("""
        SELECT e FROM ExpenseEntity e
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(e.expenseCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(e.description) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.vendorId, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.projectId, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(COALESCE(e.employeeId, '')) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:category IS NULL OR :category = '' OR :category = 'All Categories' OR e.category = :category)
          AND (:status IS NULL OR :status = '' OR :status = 'All Status' OR e.status = :status)
          AND (:projectId IS NULL OR :projectId = '' OR :projectId = 'All Projects' OR e.projectId = :projectId)
          AND (:month IS NULL OR :month = '' OR :month = 'All Months' OR e.monthLabel = :month)
        ORDER BY e.expenseDate DESC, e.id DESC
    """)
    List<ExpenseEntity> searchExpenses(
            @Param("search") String search,
            @Param("category") String category,
            @Param("status") String status,
            @Param("projectId") String projectId,
            @Param("month") String month
    );

    @Query("SELECT COALESCE(SUM(e.totalAmount), 0) FROM ExpenseEntity e")
    BigDecimal sumTotalExpenses();

    @Query("SELECT COALESCE(SUM(e.totalAmount), 0) FROM ExpenseEntity e WHERE e.status = :status")
    BigDecimal sumExpensesByStatus(@Param("status") String status);

    @Query("SELECT COALESCE(SUM(e.totalAmount), 0) FROM ExpenseEntity e WHERE e.monthLabel = :month")
    BigDecimal sumExpensesByMonth(@Param("month") String month);

    @Query("SELECT DISTINCT e.category FROM ExpenseEntity e WHERE e.category IS NOT NULL ORDER BY e.category ASC")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT e.status FROM ExpenseEntity e WHERE e.status IS NOT NULL ORDER BY e.status ASC")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT e.projectId FROM ExpenseEntity e WHERE e.projectId IS NOT NULL ORDER BY e.projectId ASC")
    List<String> findDistinctProjects();

    @Query("SELECT DISTINCT e.monthLabel FROM ExpenseEntity e WHERE e.monthLabel IS NOT NULL ORDER BY e.monthLabel DESC")
    List<String> findDistinctMonths();
}
