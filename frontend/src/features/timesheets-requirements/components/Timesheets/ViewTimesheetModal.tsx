import React from 'react';
import { X, Clock, Calendar, User, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { TimesheetRecord } from '../../types';

interface ViewTimesheetModalProps {
  isOpen: boolean;
  timesheet: TimesheetRecord | null;
  onClose: () => void;
}

export const ViewTimesheetModal: React.FC<ViewTimesheetModalProps> = ({ isOpen, timesheet, onClose }) => {
  React.useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const mainEl = document.querySelector('main');
      const prevMainOverflow = mainEl ? mainEl.style.overflow : '';

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (mainEl) {
        mainEl.style.overflow = 'hidden';
      }

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        if (mainEl) {
          mainEl.style.overflow = prevMainOverflow;
        }
      };
    }
  }, [isOpen]);

  if (!isOpen || !timesheet) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
      style={{
        fontFamily: "'Inter', sans-serif",
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-timesheet-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="view-timesheet-title" className="text-base font-bold text-slate-900 leading-tight">
                Timesheet Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{timesheet.timesheetId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 bg-slate-50/70 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Employee</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">
                {timesheet.employeeName} ({timesheet.employeeId})
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Date</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">{timesheet.date}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Project ID</span>
              <span className="block text-xs font-semibold text-indigo-600 mt-0.5">{timesheet.projectId}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Task ID</span>
              <span className="block text-xs font-semibold text-indigo-600 mt-0.5">{timesheet.taskId}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Hours Logged</span>
              <span className="block text-base font-bold text-slate-900 mt-0.5">
                {timesheet.hours.toFixed(2)} hrs
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Billable</span>
              <span className="block text-xs font-semibold text-slate-800 mt-1">
                {timesheet.billable} ({timesheet.billableRate})
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Billable Amount</span>
              <span className="block text-base font-bold text-[#10B981] mt-0.5">
                {timesheet.billableAmount}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Approval Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1 ${
                  timesheet.approvalStatus === 'Approved'
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : timesheet.approvalStatus === 'Pending'
                    ? 'bg-[#FFFBEB] text-[#D97706]'
                    : 'bg-[#FEF2F2] text-[#DC2626]'
                }`}
              >
                {timesheet.approvalStatus}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Assigned Approver</span>
              <span className="block text-xs font-semibold text-slate-800 mt-1">
                {timesheet.assignedApprover || 'CEO – Akshit Ujjain'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Approved By</span>
              <span className="block text-xs font-semibold text-slate-800 mt-1">
                {timesheet.approvedBy || '-'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Estimated Labor Cost</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">
                {timesheet.estimatedLaborCost}
              </span>
            </div>
          </div>

          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-1">Notes</span>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700">
              {timesheet.notes || 'No remarks recorded.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewTimesheetModal;


