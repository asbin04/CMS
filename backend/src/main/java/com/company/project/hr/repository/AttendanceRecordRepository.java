package com.company.project.hr.repository;

import com.company.project.hr.entity.AttendanceRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecordEntity, String> {

    boolean existsByEmployeeIdAndAttendanceDate(String employeeId, String attendanceDate);

    long countByStatus(String status);

    long countByIsLateTrue();

    List<AttendanceRecordEntity> findByAttendanceDate(String attendanceDate);

    List<AttendanceRecordEntity> findByAttendanceDateAndStatusIgnoreCase(String attendanceDate, String status);

    List<AttendanceRecordEntity> findByStatusIgnoreCase(String status);

    long countByAttendanceDate(String attendanceDate);

    long countByAttendanceDateAndStatus(String attendanceDate, String status);

    long countByAttendanceDateAndIsLateTrue(String attendanceDate);

    @Query("SELECT DISTINCT a.attendanceDate FROM AttendanceRecordEntity a")
    List<String> findDistinctAttendanceDates();

    @Query("SELECT COUNT(a) FROM AttendanceRecordEntity a WHERE a.attendanceDate = :date AND (a.status = 'Late' OR a.isLate = true)")
    long countLateRecordsForDate(@Param("date") String date);

    @Query("SELECT COUNT(a), " +
           "SUM(CASE WHEN a.status = 'Half Day' THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN (a.status = 'Late' OR a.isLate = true) THEN 1L ELSE 0L END) " +
           "FROM AttendanceRecordEntity a WHERE a.attendanceDate = :date")
    List<Object[]> getAttendanceSummaryForDate(@Param("date") String date);
}
