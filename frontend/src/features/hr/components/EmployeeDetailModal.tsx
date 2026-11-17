import React, { useState } from 'react';
import {
  X,
  Mail,
  IndianRupee,
  UserCheck,
  Briefcase,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';
import { EmployeeData } from '@/types/employee';

interface EmployeeDetailModalProps {
  employee: EmployeeData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, data: Partial<EmployeeData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  initialIsEditing?: boolean;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  initialIsEditing = false,
}) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [formData, setFormData] = useState<Partial<EmployeeData>>({});
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setIsEditing(initialIsEditing);
    }
  }, [employee, initialIsEditing]);

  if (!isOpen || !employee) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(employee.id, formData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${employee.fullName} (${employee.employeeId})?`)) {
      await onDelete(employee.id);
      onClose();
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      case 'on notice':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'probation':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      default:
        return 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold"
              style={{
                backgroundColor: employee.avatarBg || '#DBEAFE',
                color: employee.avatarColor || '#1D4ED8',
              }}
            >
              {employee.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-slate-800">{employee.fullName}</h2>
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${getStatusBadgeClass(employee.status)}`}>
                  {employee.status}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 font-mono">
                {employee.employeeId} • {employee.employeeCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-[12px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="h-8 w-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-slate-400" />
                Department & Role
              </span>
              {isEditing ? (
                <div className="space-y-1.5 pt-1">
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white"
                  />
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-slate-800">{employee.designation}</p>
                  <p className="text-[12px] text-slate-600">{employee.department} • {employee.employmentType}</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                Reporting Manager
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.reportingManager || ''}
                  onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                  className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white mt-1"
                />
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-slate-800">{employee.reportingManager}</p>
                  <p className="text-[12px] text-slate-600">Location: {employee.location}</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Contact Info
              </span>
              {isEditing ? (
                <div className="space-y-1.5 pt-1">
                  <input
                    type="email"
                    value={formData.workEmail || ''}
                    onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                    className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white"
                  />
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white"
                  />
                </div>
              ) : (
                <>
                  <p className="text-[13px] font-medium text-blue-600">{employee.workEmail}</p>
                  <p className="text-[12px] text-slate-600">{employee.phone}</p>
                </>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-slate-400" />
                Compensation
              </span>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.monthlyCtc || ''}
                  onChange={(e) => setFormData({ ...formData, monthlyCtc: Number(e.target.value) })}
                  className="w-full h-7 px-2 text-[12px] border border-slate-200 rounded bg-white mt-1"
                />
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-slate-800">
                    {employee.monthlyCtcFormatted || `₹ ${employee.monthlyCtc.toLocaleString('en-IN')}`} / month
                  </p>
                  <p className="text-[12px] text-slate-500">
                    Annual: {employee.annualCtcFormatted || `₹ ${(employee.monthlyCtc * 12).toLocaleString('en-IN')}`}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Joining and Tenure info */}
          <div className="p-3 rounded-lg border border-slate-200/80 bg-white grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Joining Date</span>
              <span className="text-[13px] font-semibold text-slate-700">{employee.joiningDate}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Tenure</span>
              <span className="text-[13px] font-semibold text-slate-700">{employee.tenureStatus}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 font-medium block">Status</span>
              <span className={`inline-block px-2 py-0.5 mt-0.5 text-[11px] font-semibold rounded-full border ${getStatusBadgeClass(employee.status)}`}>
                {employee.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

