import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Trash2, Edit3 } from 'lucide-react';
import { AttendanceRecord } from '../types/attendance';

interface AttendanceDetailModalProps {
  record: AttendanceRecord | null;
  onClose: () => void;
  onUpdate: (updated: AttendanceRecord) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  record,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<AttendanceRecord>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
      setIsEditing(false);
    }
  }, [record]);

  if (!record) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({
        ...record,
        ...formData,
      } as AttendanceRecord);
      setIsEditing(false);
      onClose();
    } catch {
      // Handled by caller
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete record ${record.id}?`)) {
      await onDelete(record.id);
      onClose();
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
          maxWidth: '520px',
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
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {record.avatarInitials || 'AT'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                {record.employeeName} ({record.id})
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                {record.employeeId} • {record.attendanceDate}
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

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  value={formData.status || record.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{
                    width: '100%',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    padding: '0 10px',
                    fontSize: '12px',
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Check In
                  </label>
                  <input
                    type="text"
                    value={formData.checkIn || ''}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    style={{
                      width: '100%',
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      padding: '0 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Check Out
                  </label>
                  <input
                    type="text"
                    value={formData.checkOut || ''}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    style={{
                      width: '100%',
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      padding: '0 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Work Hours
                  </label>
                  <input
                    type="text"
                    value={formData.workHours || ''}
                    onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                    style={{
                      width: '100%',
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      padding: '0 10px',
                      fontSize: '12px',
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
                    value={formData.overtimeHours || ''}
                    onChange={(e) => setFormData({ ...formData, overtimeHours: e.target.value })}
                    style={{
                      width: '100%',
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      padding: '0 10px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: '#F8FAFC',
                  padding: '14px',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Status</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.status}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Day Type</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.dayType || 'Regular'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Check In</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.checkIn}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Check Out</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.checkOut}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Work Hours</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.workHours}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Overtime Hours</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.overtimeHours}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Paid Day Equivalent</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.paidDayEquivalent || '1.0'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Late Flag</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: record.lateFlag === 'Yes' ? '#DC2626' : '#16A34A', marginTop: '2px' }}>
                    {record.lateFlag || (record.isLate ? 'Yes' : 'No')}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Overtime Value</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.overtimeValue || '₹ 0'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Remarks</span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {record.remarks || '-'}
                  </div>
                </div>
              </div>

              {record.isLate && (
                <div
                  style={{
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11.5px',
                    color: '#B45309',
                  }}
                >
                  <AlertCircle size={14} />
                  <span>Marked as Late (Checked in after 09:00 AM)</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <button
              type="button"
              onClick={handleDelete}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #FCA5A5',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#4F46E5',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Edit3 size={13} />
                  <span>Edit Record</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
