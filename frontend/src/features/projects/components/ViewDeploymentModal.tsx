import React from 'react';
import { X, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { DeploymentItem } from '../types/deployment';

interface ViewDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: DeploymentItem | null;
}

export const ViewDeploymentModal: React.FC<ViewDeploymentModalProps> = ({
  isOpen,
  onClose,
  deployment,
}) => {
  if (!isOpen || !deployment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-['Inter']">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#0F172A]">Deployment Details</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-semibold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
              {deployment.id}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block">Project</span>
              <span className="text-[13px] font-bold text-[#0F172A]">{deployment.projectId}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block">Release Version</span>
              <span className="text-[13px] font-bold text-[#4F46E5]">{deployment.releaseVersion}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block">Environment</span>
              <span className="text-[13px] font-bold text-[#0F172A]">{deployment.environment}</span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#64748B] block">Owner</span>
              <span className="text-[13px] font-bold text-[#0F172A]">{deployment.deploymentOwner}</span>
            </div>
          </div>

          {/* Operational Checks */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#475569]">
              Deployment Checklist &amp; Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[12px] text-[#475569]">Pre-Deployment Checklist</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#047857]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                  {deployment.preDeploymentChecklist}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[12px] text-[#475569]">Database Backup Completed</span>
                <span className={`text-[12px] font-medium ${deployment.backupCompleted === 'Yes' ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  {deployment.backupCompleted}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[12px] text-[#475569]">Rollback Plan</span>
                <span className="text-[12px] font-medium text-[#047857]">{deployment.rollbackPlan}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[12px] text-[#475569]">Automated Smoke Test</span>
                <span className="text-[12px] font-medium text-[#047857]">{deployment.smokeTest}</span>
              </div>
            </div>
          </div>

          {/* Go-Live & Handover */}
          <div className="space-y-3">
            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#475569]">
              Sign-Off &amp; Handover Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[11px] text-[#64748B] block">Client Sign-Off</span>
                <span className="text-[12px] font-medium text-[#0F172A]">{deployment.clientSignOff}</span>
              </div>
              <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[11px] text-[#64748B] block">Go-Live Date</span>
                <span className="text-[12px] font-medium text-[#0F172A]">{deployment.goLiveDate || '-'}</span>
              </div>
              <div className="p-3 rounded-lg border border-[#E2E8F0] bg-white">
                <span className="text-[11px] text-[#64748B] block">Handover Status</span>
                <span className="text-[12px] font-medium text-[#0F172A]">{deployment.handoverStatus}</span>
              </div>
            </div>
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <h3 className="text-[13px] font-bold text-[#0F172A] uppercase tracking-wider text-[11px] text-[#475569]">
              Release Notes &amp; Highlights
            </h3>
            <div className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#334155] leading-relaxed whitespace-pre-wrap">
              {deployment.releaseNotes || 'No release notes provided.'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

