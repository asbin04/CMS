import React from 'react';
import { X, Folder, Calendar, IndianRupee, TrendingUp, Percent, Database, Clock, Edit } from 'lucide-react';
import { ProjectProfitabilityRow } from '../types/project';

interface ViewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectProfitabilityRow | null;
  onEdit?: (project: ProjectProfitabilityRow) => void;
}

export const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onEdit,
}) => {
  if (!isOpen || !project) return null;

  const renderHealthBadge = (health: string) => {
    const lower = (health || '').toLowerCase();
    if (lower.includes('track') || lower.includes('health')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('risk')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('delay') || lower.includes('crit')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {health}
        </span>
      );
    }
    if (lower.includes('upcom')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          {health}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {health || '—'}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Inter']">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5]">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-[#0F172A]">{project.projectName}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#F1F5F9] text-[#475569]">
                  {project.projectCode || project.projectId}
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">Internal ID: {project.projectId}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status & Health Header Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block">Project Status</span>
              <span className="text-[13px] font-bold text-[#0F172A] mt-0.5 block">{project.status || 'Active'}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block mb-1 text-right">Delivery Health</span>
              {renderHealthBadge(project.health)}
            </div>
          </div>

          {/* Financial Performance Section */}
          <div className="space-y-3">
            <h3 className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider text-[#475569]">
              Financial Performance & Profitability
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Contract Revenue</span>
                </div>
                <span className="text-[15px] font-bold text-slate-900 mt-1">{project.revenueFormatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[11px] font-medium text-blue-700">
                  <Database className="w-3.5 h-3.5" />
                  <span>Total Cost</span>
                </div>
                <span className="text-[15px] font-bold text-slate-900 mt-1">{project.totalCostFormatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Estimated Profit</span>
                </div>
                <span className="text-[15px] font-bold text-slate-900 mt-1">{project.profitFormatted}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[11px] font-medium text-purple-700">
                  <Percent className="w-3.5 h-3.5" />
                  <span>Gross Margin</span>
                </div>
                <span className="text-[15px] font-bold text-slate-900 mt-1">{project.marginFormatted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <span className="text-xs text-slate-500">Live PostgreSQL Database Record</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(project);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#4F46E5] text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

