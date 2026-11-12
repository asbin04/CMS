package com.company.project.attendance.repository;

import com.company.project.attendance.entity.AttendanceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<AttendanceEntity, String> {

    List<AttendanceEntity> findAllByOrderByIdDesc();

    List<AttendanceEntity> findByStatusIgnoreCase(String status);

    List<AttendanceEntity> findByEmployeeIdIgnoreCase(String employeeId);

    long countByStatusIgnoreCase(String status);

    long countByIsLateTrue();

    @Query("SELECT COALESCE(SUM(a.overtimeMinutes), 0) FROM AttendanceEntity a")
    Long sumOvertimeMinutes();
}
