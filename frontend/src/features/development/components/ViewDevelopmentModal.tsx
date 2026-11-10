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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5]">
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

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Linked Identifiers Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Developer
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800">
                {record.developer}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Build Version
              </label>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700">
                {record.buildVersion}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Environment
              </label>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getEnvironmentBadge(
                    record.environment
                  )}`}
                >
                  {record.environment}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Code Review Status
              </label>
              <div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getCodeReviewBadge(
                    record.codeReviewStatus
                  )}`}
                >
                  {record.codeReviewStatus}
                </span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Git Branch
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800">
                <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                <span>{record.branch}</span>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">
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
                className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-normal text-slate-700 transition-colors"
              >
                <span className="truncate">{record.repositoryUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
              </a>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                QA Handoff Date
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{record.qaHandoffDate || '—'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Documentation Link
              </label>
              {record.documentationLink ? (
                <a
                  href={
                    record.documentationLink.startsWith('http')
                      ? record.documentationLink
                      : `https://${record.documentationLink}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-[#4F46E5] transition-colors"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FileText className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>View Documentation</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#4F46E5]" />
                </a>
              ) : (
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-400">
                  No link available
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Technical Notes
              </label>
              <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs leading-relaxed text-slate-700 min-h-[60px]">
                {record.technicalNotes || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(record);
            }}
            className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Development</span>
          </button>
        </div>
      </div>
    </div>
  );
};

