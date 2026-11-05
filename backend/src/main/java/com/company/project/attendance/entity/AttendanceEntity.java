package com.company.project.attendance.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceEntity {

    @Id
    @Column(name = "id", length = 30, nullable = false)
    private String id;

    @Column(name = "attendance_date", length = 50, nullable = false)
    private String attendanceDate;

    @Column(name = "employee_id", length = 30, nullable = false)
    private String employeeId;

    @Column(name = "employee_name", length = 100, nullable = false)
    private String employeeName;

    @Column(name = "avatar_initials", length = 10)
    private String avatarInitials;

    @Column(name = "avatar_color", length = 30)
    private String avatarColor;

    @Column(name = "status", length = 30, nullable = false)
    private String status;

    @Column(name = "check_in", length = 30)
    private String checkIn;

    @Column(name = "check_out", length = 30)
    private String checkOut;

    @Column(name = "work_hours", length = 30)
    private String workHours;

    @Column(name = "overtime_hours", length = 30)
    private String overtimeHours;

    @Column(name = "work_minutes")
    private Integer workMinutes;

    @Column(name = "overtime_minutes")
    private Integer overtimeMinutes;

    @Column(name = "day_type", length = 30)
    private String dayType;

    @Column(name = "is_late")
    private Boolean isLate;

    @Column(name = "has_overtime")
    private Boolean hasOvertime;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_day_equivalent", length = 20)
    private String paidDayEquivalent;

    @Column(name = "late_flag", length = 10)
    private String lateFlag;

    @Column(name = "overtime_value", length = 30)
    private String overtimeValue;

    @Column(name = "remarks", length = 150)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
