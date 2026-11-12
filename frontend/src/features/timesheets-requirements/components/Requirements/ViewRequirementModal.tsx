import React from 'react';
import { X, ClipboardList, CheckCircle2, User, Lock, Calendar, Layers } from 'lucide-react';
import { RequirementRecord } from '../../types';

interface ViewRequirementModalProps {
  isOpen: boolean;
  requirement: RequirementRecord | null;
  onClose: () => void;
}

export const ViewRequirementModal: React.FC<ViewRequirementModalProps> = ({ isOpen, requirement, onClose }) => {
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

  if (!isOpen || !requirement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-req-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 id="view-req-title" className="text-base font-bold text-slate-900 leading-tight">
                Requirement Details
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{requirement.requirementId}</p>
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
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {requirement.type}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  requirement.status === 'Completed'
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : requirement.status === 'Pending Approval'
                    ? 'bg-[#FFFBEB] text-[#D97706]'
                    : 'bg-[#EEF2FF] text-[#4F46E5]'
                }`}
              >
                {requirement.status}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {requirement.requirementFeature}
            </h3>
            {requirement.description && (
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {requirement.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Project ID</span>
              <span className="block text-xs font-semibold text-indigo-600 mt-0.5">{requirement.projectId}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Client ID</span>
              <span className="block text-xs font-semibold text-indigo-600 mt-0.5">{requirement.clientId}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Requirement Date</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">{requirement.requirementDate}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Owner ID</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">{requirement.ownerId}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-[11px] font-medium text-slate-400">Assigned Approver</span>
              <span className="block text-xs font-semibold text-slate-800 mt-0.5">
                {requirement.assignedApprover || 'Admin – Akshit Ujjain'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-slate-100 rounded-xl p-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Priority</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1 ${
                  requirement.priority === 'High'
                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                    : requirement.priority === 'Medium'
                    ? 'bg-[#FFFBEB] text-[#D97706]'
                    : 'bg-[#ECFDF5] text-[#059669]'
                }`}
              >
                {requirement.priority}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Scope Freeze</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold mt-1 ${
                  requirement.scopeFreeze === 'Yes'
                    ? 'bg-[#ECFDF5] text-[#059669]'
                    : 'bg-[#FEF2F2] text-[#DC2626]'
                }`}
              >
                {requirement.scopeFreeze}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Approved By</span>
              <span className="block text-xs font-semibold text-slate-800 mt-1">
                {requirement.approvedBy || '-'}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-400">Approval Date</span>
              <span className="block text-xs font-semibold text-slate-800 mt-1">
                {requirement.approvalDate || '-'}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="p-4 border border-slate-100 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Completion Progress</span>
              <span>{requirement.completionPercentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  requirement.completionPercentage === 100 ? 'bg-[#10B981]' : 'bg-[#4F46E5]'
                }`}
                style={{ width: `${requirement.completionPercentage}%` }}
              />
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

export default ViewRequirementModal;

