import React from 'react';
import { X, Clock, Calendar, Building, User, FileText, CheckCircle2 } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface AttendanceDetailModalProps {
  attendance: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  attendance,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !attendance) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Late':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'Half Day':
        return 'bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE]';
      case 'Absent':
        return 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]';
      case 'On Leave':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAFCFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Attendance Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {attendance.id} • {attendance.date}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Employee Info Header */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-xs">
                {attendance.employeeName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{attendance.employeeName}</h4>
                <p className="text-[11px] text-slate-500">{attendance.employeeId} • {attendance.department}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(attendance.status)}`}>
              {attendance.status}
            </span>
          </div>

          {/* Time Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Check-In</span>
              <span className="text-xs font-bold text-slate-800">{attendance.checkIn}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Check-Out</span>
              <span className="text-xs font-bold text-slate-800">{attendance.checkOut}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Working Hours</span>
              <span className="text-xs font-bold text-[#4F46E5]">{attendance.workingHours}</span>
            </div>
          </div>

          {/* Notes & Activity */}
          <div className="p-3.5 rounded-xl border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Log Details & Notes</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {attendance.notes || 'Recorded via automated attendance gateway. Verified without discrepancies.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

