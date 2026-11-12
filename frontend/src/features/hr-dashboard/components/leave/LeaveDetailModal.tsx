import React from 'react';
import { X, Calendar, Check, Ban, Clock, FileText, User } from 'lucide-react';
import { LeaveRecord } from '../../types';

interface LeaveDetailModalProps {
  leave: LeaveRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({
  leave,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !leave) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Pending':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'Rejected':
        return 'bg-[#FEF2F2] text-[#EF4444] border-[#FECACA]';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#FAFCFF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
              <Calendar className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Leave Request Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {leave.id} • Applied on {leave.appliedDate}
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
          {/* Employee & Status bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{leave.employeeName}</h4>
              <p className="text-[11px] text-slate-500">{leave.employeeId} • {leave.department}</p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(leave.status)}`}>
              {leave.status}
            </span>
          </div>

          {/* Leave Schedule Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Leave Type</span>
              <span className="text-xs font-bold text-slate-900">{leave.leaveType}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Duration</span>
              <span className="text-xs font-bold text-[#4F46E5]">{leave.days} Day{leave.days > 1 ? 's' : ''}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Dates</span>
              <span className="text-[11px] font-bold text-slate-800">{leave.fromDate} to {leave.toDate}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="p-4 rounded-xl border border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Reason for Leave</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {leave.reason}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>

          {leave.status === 'Pending' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onReject?.(leave.id);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onApprove?.(leave.id);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-xs font-semibold text-white shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Approve</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

