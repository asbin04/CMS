import React from 'react';
import { X, UserMinus, Calendar, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { ExitRecord } from '../../types';

interface ExitDetailModalProps {
  exitRecord: ExitRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (exitRecord: ExitRecord) => void;
}

export const ExitDetailModal: React.FC<ExitDetailModalProps> = ({
  exitRecord,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen || !exitRecord) return null;

  const getExitStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]';
      case 'Notice Period':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]';
      case 'In Progress':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]';
      case 'Pending Clearance':
        return 'bg-[#EEF2FF] text-[#6366F1] border-[#C7D2FE]';
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
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
              <UserMinus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Employee Exit Details
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {exitRecord.id} • {exitRecord.employeeName}
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
              <h4 className="font-bold text-slate-900 text-sm">{exitRecord.employeeName}</h4>
              <p className="text-[11px] text-slate-500">
                {exitRecord.employeeId} • {exitRecord.designation} ({exitRecord.department})
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getExitStatusBadge(exitRecord.status)}`}>
              {exitRecord.status}
            </span>
          </div>

          {/* Dates & Exit Type Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Exit Type</span>
              <span className="text-xs font-bold text-slate-900">{exitRecord.exitType}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Resignation Date</span>
              <span className="text-xs font-bold text-slate-800">{exitRecord.resignationDate}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Last Working Day</span>
              <span className="text-xs font-bold text-rose-600">{exitRecord.lastWorkingDay}</span>
            </div>
          </div>

          {/* Reason */}
          <div className="p-3.5 rounded-xl border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Exit Reason</span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs">
              {exitRecord.reason}
            </p>
          </div>

          {/* Clearances & Handover Info */}
          <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100 space-y-2">
            <h5 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Transition & Handover Status
            </h5>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">
                  <strong className="text-slate-800 font-semibold">Handover:</strong> {exitRecord.handoverStatus || 'Standard knowledge transfer document in review.'}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="text-slate-600">
                  <strong className="text-slate-800 font-semibold">Department Clearance:</strong> {exitRecord.clearanceStatus || 'Pending final asset handover and IT clearance.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(exitRecord);
              }}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-2xs transition-colors cursor-pointer"
            >
              Edit Exit Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

