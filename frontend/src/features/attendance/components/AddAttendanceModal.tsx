import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (record: Partial<AttendanceRecord>) => Promise<void>;
  employees: { id: string; name: string; initials: string; color: string }[];
}

export const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  employees,
}) => {
  const [employeeId, setEmployeeId] = useState(employees[0]?.id || '');
  const [attendanceDate, setAttendanceDate] = useState('31 Oct 2026');
  const [status, setStatus] = useState<'Present' | 'Leave' | 'Half Day' | 'Absent' | 'Holiday'>('Present');
  const [checkIn, setCheckIn] = useState('09:00 AM');
  const [checkOut, setCheckOut] = useState('06:00 PM');
  const [workHours, setWorkHours] = useState('8h 00m');
  const [overtimeHours, setOvertimeHours] = useState('0h 00m');
  const [dayType, setDayType] = useState('Regular');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedEmp = employees.find((e) => e.id === employeeId) || employees[0];
      const isLate = checkIn.includes('AM') && !checkIn.startsWith('08:') && !checkIn.startsWith('09:00');
      const hasOvertime = overtimeHours !== '0h 0m' && overtimeHours !== '-';
      const paidDayEquivalent = status === 'Half Day' ? '0.5' : (status === 'Leave' || status === 'Absent' || status === 'Holiday' ? '0.0' : '1.0');
      const lateFlag = isLate ? 'Yes' : 'No';
      let otVal = '₹ 0';
      if (hasOvertime) {
        const m = overtimeHours.match(/(\d+)h\s*(\d+)m/);
        if (m) {
          const otMins = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
          otVal = `₹ ${Math.round(otMins * 12.5).toLocaleString('en-IN')}`;
        }
      }
      const defaultRemark = isLate ? 'Late arrival' : (status === 'Half Day' ? 'Left early' : (status === 'Leave' ? 'Personal leave' : (status === 'Holiday' ? 'Company holiday' : (status === 'Absent' ? 'Absent' : '-'))));

      await onAdd({
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        avatarInitials: selectedEmp.initials,
        avatarColor: selectedEmp.color,
        attendanceDate,
        status,
        checkIn: status === 'Absent' || status === 'Leave' || status === 'Holiday' ? '-' : checkIn,
        checkOut: status === 'Absent' || status === 'Leave' || status === 'Holiday' ? '-' : checkOut,
        workHours: status === 'Absent' || status === 'Leave' || status === 'Holiday' ? '0h 0m' : workHours,
        overtimeHours: status === 'Absent' || status === 'Leave' || status === 'Holiday' ? '0h 0m' : overtimeHours,
        dayType: status === 'Leave' ? 'Leave' : (status === 'Holiday' ? 'Holiday' : 'Working Day'),
        isLate,
        hasOvertime,
        paidDayEquivalent,
        lateFlag,
        overtimeValue: otVal,
        remarks: notes || defaultRemark,
        notes,
      });
      onClose();
    } catch {
      // Handled by caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter', sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                Add Attendance Record
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                Create a live employee attendance entry in PostgreSQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Employee & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Date
              </label>
              <input
                type="text"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                placeholder="e.g. 31 Oct 2026"
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Status & Day Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Attendance Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                }}
              >
                <option value="Present">Present</option>
                <option value="Leave">Leave</option>
                <option value="Half Day">Half Day</option>
                <option value="Absent">Absent</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                Day Type
              </label>
              <select
                value={dayType}
                onChange={(e) => setDayType(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '0 10px',
                  fontSize: '12px',
                  color: '#1E293B',
                  outline: 'none',
                }}
              >
                <option value="Regular">Regular</option>
                <option value="Weekend">Weekend</option>
                <option value="Holiday">Holiday</option>
              </select>
            </div>
          </div>

          {/* Check In / Check Out */}
          {status !== 'Absent' && status !== 'Leave' && status !== 'Holiday' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Check In Time
                </label>
                <input
                  type="text"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  placeholder="09:00 AM"
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '12px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Check Out Time
                </label>
                <input
                  type="text"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  placeholder="06:00 PM"
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '12px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Work Hours & Overtime Hours */}
          {status !== 'Absent' && status !== 'Leave' && status !== 'Holiday' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Work Hours
                </label>
                <input
                  type="text"
                  value={workHours}
                  onChange={(e) => setWorkHours(e.target.value)}
                  placeholder="8h 00m"
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '12px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Overtime Hours
                </label>
                <input
                  type="text"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(e.target.value)}
                  placeholder="0h 00m"
                  style={{
                    width: '100%',
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '12px',
                    color: '#1E293B',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
              Notes / Remarks
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional remarks regarding punctuality or attendance reason..."
              rows={2}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '8px 10px',
                fontSize: '12px',
                color: '#1E293B',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Add Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
