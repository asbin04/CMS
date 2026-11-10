import React from 'react';
import { X, ExternalLink, Code2, Edit2, Calendar, GitBranch, Shield, Zap, FileText } from 'lucide-react';
import { DevelopmentRecord } from '../types';

interface ViewDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DevelopmentRecord | null;
  onEdit: (record: DevelopmentRecord) => void;
}

export const ViewDevelopmentModal: React.FC<ViewDevelopmentModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
}) => {
  if (!isOpen || !record) return null;

  const getEnvironmentBadge = (env: string) => {
    switch (env) {
      case 'Dev':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
      case 'QA':
        return 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]';
      case 'Staging':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
      case 'Prod':
        return 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getCodeReviewBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'In Review':
        return 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]';
      case 'Changes Requested':
        return 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Released':
        return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
      case 'In Progress':
        return 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]';
      case 'QA':
        return 'bg-[#F3E8FF] text-[#9333EA] border border-[#E9D5FF]';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        .modal-border-readonly {
          border: 1px solid #C7D5E8 !important;
          background-color: #FFFFFF !important;
          border-radius: 10px !important;
        }
      `}</style>

      <div className="relative bg-white rounded-[20px] max-w-[880px] w-full shadow-2xl border border-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <Code2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-none">
                  {record.developmentId}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(
                    record.status
                  )}`}
                >
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Development Details & Technical Tracking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body - Fits completely without vertical scrolling on desktop */}
        <div className="px-7 py-3.5 space-y-3">
          {/* Linked Identifiers Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-3.5 py-2 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <span className="block text-[10.5px] font-medium text-slate-400 uppercase tracking-wide">
                Project ID
              </span>
              <span className="text-xs font-semibold text-[#4F46E5] mt-0.5 block">
                {record.projectId}
              </span>
            </div>
            <div>
              <span className="block text-[10.5px] font-medium text-slate-400 uppercase tracking-wide">
                Requirement ID
              </span>
              <span className="text-xs font-semibold text-[#4F46E5] mt-0.5 block">
                {record.requirementId}
              </span>
            </div>
            <div>
              <span className="block text-[10.5px] font-medium text-slate-400 uppercase tracking-wide">
                Task / Ticket
              </span>
              <span className="text-xs font-semibold text-[#4F46E5] mt-0.5 block">
                {record.taskId}
              </span>
            </div>
            <div>
              <span className="block text-[10.5px] font-medium text-slate-400 uppercase tracking-wide">
                Release ID
              </span>
              <span className="text-xs font-semibold text-[#4F46E5] mt-0.5 block">
                {record.releaseId || '—'}
              </span>
            </div>
          </div>

          {/* Development Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-3.5 gap-y-2.5">
            {/* Developer */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Developer
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center text-xs font-semibold text-slate-800 truncate">
                {record.developer}
              </div>
            </div>

            {/* Build Version */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Build Version
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center text-xs font-mono font-medium text-slate-700 truncate">
                {record.buildVersion}
              </div>
            </div>

            {/* Environment */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Environment
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getEnvironmentBadge(
                    record.environment
                  )}`}
                >
                  {record.environment}
                </span>
              </div>
            </div>

            {/* Code Review Status */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Code Review Status
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${getCodeReviewBadge(
                    record.codeReviewStatus
                  )}`}
                >
                  {record.codeReviewStatus}
                </span>
              </div>
            </div>

            {/* Git Branch */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Git Branch
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center gap-1.5 text-xs font-mono text-slate-800">
                <GitBranch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{record.branch}</span>
              </div>
            </div>

            {/* QA Handoff Date */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                QA Handoff Date
              </label>
              <div className="modal-border-readonly h-[38px] px-3 flex items-center gap-1.5 text-xs font-normal text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{record.qaHandoffDate || '—'}</span>
              </div>
            </div>

            {/* Repository URL */}
            <div className="sm:col-span-2">
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Repository URL
              </label>
              <a
                href={
                  record.repositoryUrl.startsWith('http')
                    ? record.repositoryUrl
                    : `https://${record.repositoryUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="modal-border-readonly h-[38px] px-3 flex items-center justify-between text-xs text-slate-700 hover:text-[#4F46E5] transition-colors"
              >
                <span className="truncate">{record.repositoryUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </a>
            </div>

            {/* Documentation Link */}
            <div className="sm:col-span-2">
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Documentation Link
              </label>
              {record.documentationLink && record.documentationLink !== '#' && record.documentationLink !== '—' ? (
                <a
                  href={
                    record.documentationLink.startsWith('http')
                      ? record.documentationLink
                      : `https://${record.documentationLink}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="modal-border-readonly h-[38px] px-3 flex items-center justify-between text-xs font-medium text-[#4F46E5] hover:underline transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                    <span className="truncate">{record.documentationLink}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#4F46E5] shrink-0 ml-2" />
                </a>
              ) : (
                <div className="modal-border-readonly h-[38px] px-3 flex items-center text-xs text-slate-400">
                  No documentation link is available for this development.
                </div>
              )}
            </div>

            {/* Technical Notes */}
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-[11.5px] font-medium text-slate-700 mb-1 leading-none">
                Technical Notes
              </label>
              <div className="modal-border-readonly p-2.5 text-xs leading-relaxed text-slate-700 min-h-[58px]">
                {record.technicalNotes || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-3 bg-white border-t border-slate-100 rounded-b-[20px]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-solid border-[#C7D5E8] rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(record);
            }}
            className="px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Development</span>
          </button>
        </div>
      </div>
    </div>
  );
};

