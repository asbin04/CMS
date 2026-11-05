package com.company.project.attendance.service;

import com.company.project.attendance.dto.AttendanceResponse;
import com.company.project.attendance.dto.CreateAttendanceRequest;
import com.company.project.attendance.dto.UpdateAttendanceRequest;
import com.company.project.attendance.entity.AttendanceEntity;
import com.company.project.attendance.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public AttendanceResponse toResponse(AttendanceEntity entity) {
        if (entity == null) return null;
        return AttendanceResponse.builder()
                .id(entity.getId())
                .attendanceDate(entity.getAttendanceDate())
                .employeeId(entity.getEmployeeId())
                .employeeName(entity.getEmployeeName())
                .avatarInitials(entity.getAvatarInitials())
                .avatarColor(entity.getAvatarColor())
                .status(entity.getStatus())
                .checkIn(entity.getCheckIn())
                .checkOut(entity.getCheckOut())
                .workHours(entity.getWorkHours())
                .overtimeHours(entity.getOvertimeHours())
                .workMinutes(entity.getWorkMinutes())
                .overtimeMinutes(entity.getOvertimeMinutes())
                .dayType(entity.getDayType())
                .isLate(entity.getIsLate())
                .hasOvertime(entity.getHasOvertime())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AttendanceResponse> getAttendanceById(String id) {
        return attendanceRepository.findById(id).map(this::toResponse);
    }

    @Transactional
    public AttendanceResponse createAttendance(CreateAttendanceRequest request) {
        long count = attendanceRepository.count();
        AttendanceEntity record = AttendanceEntity.builder()
                .id(String.format("ATT-%06d", count + 1))
                .attendanceDate(request.getAttendanceDate())
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName())
                .avatarInitials(request.getAvatarInitials())
                .avatarColor(request.getAvatarColor())
                .status(request.getStatus())
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .workHours(request.getWorkHours())
                .overtimeHours(request.getOvertimeHours())
                .workMinutes(request.getWorkMinutes())
                .overtimeMinutes(request.getOvertimeMinutes())
                .dayType(request.getDayType())
                .isLate(request.getIsLate())
                .hasOvertime(request.getHasOvertime())
                .notes(request.getNotes())
                .build();
        AttendanceEntity saved = attendanceRepository.save(record);
        return toResponse(saved);
    }

    @Transactional
    public AttendanceEntity createAttendance(AttendanceEntity record) {
        if (record.getId() == null || record.getId().trim().isEmpty()) {
            long count = attendanceRepository.count();
            record.setId(String.format("ATT-%06d", count + 1));
        }
        return attendanceRepository.save(record);
    }

    @Transactional
    public AttendanceResponse updateAttendance(String id, UpdateAttendanceRequest updates) {
        AttendanceEntity existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + id));

        if (updates.getAttendanceDate() != null) existing.setAttendanceDate(updates.getAttendanceDate());
        if (updates.getEmployeeId() != null) existing.setEmployeeId(updates.getEmployeeId());
        if (updates.getEmployeeName() != null) existing.setEmployeeName(updates.getEmployeeName());
        if (updates.getAvatarInitials() != null) existing.setAvatarInitials(updates.getAvatarInitials());
        if (updates.getAvatarColor() != null) existing.setAvatarColor(updates.getAvatarColor());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getCheckIn() != null) existing.setCheckIn(updates.getCheckIn());
        if (updates.getCheckOut() != null) existing.setCheckOut(updates.getCheckOut());
        if (updates.getWorkHours() != null) existing.setWorkHours(updates.getWorkHours());
        if (updates.getOvertimeHours() != null) existing.setOvertimeHours(updates.getOvertimeHours());
        if (updates.getWorkMinutes() != null) existing.setWorkMinutes(updates.getWorkMinutes());
        if (updates.getOvertimeMinutes() != null) existing.setOvertimeMinutes(updates.getOvertimeMinutes());
        if (updates.getDayType() != null) existing.setDayType(updates.getDayType());
        if (updates.getIsLate() != null) existing.setIsLate(updates.getIsLate());
        if (updates.getHasOvertime() != null) existing.setHasOvertime(updates.getHasOvertime());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());

        AttendanceEntity saved = attendanceRepository.save(existing);
        return toResponse(saved);
    }

    @Transactional
    public AttendanceEntity updateAttendance(String id, AttendanceEntity updates) {
        AttendanceEntity existing = attendanceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + id));

        if (updates.getAttendanceDate() != null) existing.setAttendanceDate(updates.getAttendanceDate());
        if (updates.getEmployeeId() != null) existing.setEmployeeId(updates.getEmployeeId());
        if (updates.getEmployeeName() != null) existing.setEmployeeName(updates.getEmployeeName());
        if (updates.getAvatarInitials() != null) existing.setAvatarInitials(updates.getAvatarInitials());
        if (updates.getAvatarColor() != null) existing.setAvatarColor(updates.getAvatarColor());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
        if (updates.getCheckIn() != null) existing.setCheckIn(updates.getCheckIn());
        if (updates.getCheckOut() != null) existing.setCheckOut(updates.getCheckOut());
        if (updates.getWorkHours() != null) existing.setWorkHours(updates.getWorkHours());
        if (updates.getOvertimeHours() != null) existing.setOvertimeHours(updates.getOvertimeHours());
        if (updates.getWorkMinutes() != null) existing.setWorkMinutes(updates.getWorkMinutes());
        if (updates.getOvertimeMinutes() != null) existing.setOvertimeMinutes(updates.getOvertimeMinutes());
        if (updates.getDayType() != null) existing.setDayType(updates.getDayType());
        if (updates.getIsLate() != null) existing.setIsLate(updates.getIsLate());
        if (updates.getHasOvertime() != null) existing.setHasOvertime(updates.getHasOvertime());
        if (updates.getNotes() != null) existing.setNotes(updates.getNotes());
        if (updates.getPaidDayEquivalent() != null) existing.setPaidDayEquivalent(updates.getPaidDayEquivalent());
        if (updates.getLateFlag() != null) existing.setLateFlag(updates.getLateFlag());
        if (updates.getOvertimeValue() != null) existing.setOvertimeValue(updates.getOvertimeValue());
        if (updates.getRemarks() != null) existing.setRemarks(updates.getRemarks());

        return attendanceRepository.save(existing);
    }

    @Transactional
    public void deleteAttendance(String id) {
        attendanceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMetrics() {
        long total = attendanceRepository.count();
        long present = attendanceRepository.countByStatusIgnoreCase("Present");
        long late = attendanceRepository.countByIsLateTrue();
        Long otMinutes = attendanceRepository.sumOvertimeMinutes();
        double otHours = (otMinutes != null ? otMinutes : 0L) / 60.0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalRecords", total);
        metrics.put("totalRecordsTrend", "↑ 12% vs last month");
        metrics.put("presentRecords", present);
        metrics.put("presentRecordsTrend", "↑ 8% vs last month");
        metrics.put("lateRecords", late);
        metrics.put("lateRecordsTrend", "↓ 18% vs last month");
        metrics.put("totalOvertimeHours", String.format("%.1f", otHours));
        metrics.put("totalOvertimeHoursTrend", "↑ 25% vs last month");

        return metrics;
    }
}
