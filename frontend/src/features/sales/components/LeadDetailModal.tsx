import React, { useEffect } from 'react';
import { X, Building2, Clock } from 'lucide-react';
import { Lead } from '../types/leads';
import { formatRupee } from '../../collections/utils';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
}) => {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Lead Details"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[840px] max-h-[92vh] overflow-y-auto p-6 sm:p-7 animate-scale-up text-slate-800"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Lead Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View complete information for this lead.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Lead Summary Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/70 rounded-2xl p-4 sm:p-5 flex items-center gap-4 mt-6">
          <div className="w-12 h-12 rounded-xl bg-blue-50/90 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Building2 size={24} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 leading-tight">
              {lead.company || '—'}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">
                Lead ID: <span className="font-semibold text-slate-700">{lead.id}</span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {lead.stage || 'New'}
              </span>
            </div>
          </div>
        </div>

        {/* Lead Information Section */}
        <div className="border border-slate-200/80 rounded-2xl p-5 sm:p-6 bg-white mt-5">
          <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-900">
            <Clock size={16} className="text-indigo-600" />
            <span>Lead Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* 1. Lead ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Lead ID</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 flex items-center truncate">
                {lead.id || '—'}
              </div>
            </div>

            {/* 2. Lead Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Lead Date</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.leadDate || '—'}
              </div>
            </div>

            {/* 3. Company / Person */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Company / Person</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 flex items-center truncate">
                {lead.company || '—'}
              </div>
            </div>

            {/* 4. Contact Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Name</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.contactName || '—'}
              </div>
            </div>

            {/* 5. Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-indigo-600 font-medium flex items-center truncate">
                {lead.email || '—'}
              </div>
            </div>

            {/* 6. Phone */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.phone || '—'}
              </div>
            </div>

            {/* 7. Source */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Source</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.source || '—'}
              </div>
            </div>

            {/* 8. Service Interest */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Service Interest</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs flex items-center">
                {lead.serviceInterest ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                    {lead.serviceInterest}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>

            {/* 9. Country */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Country</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.country || '—'}
              </div>
            </div>

            {/* 10. City */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">City</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.city || '—'}
              </div>
            </div>

            {/* 11. Owner ID */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Owner ID</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.ownerId || '—'}
              </div>
            </div>

            {/* 12. Stage */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Stage</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {lead.stage || 'New'}
                </span>
              </div>
            </div>

            {/* 13. Lead Score */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Lead Score</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium flex items-center truncate">
                {lead.leadScore != null ? String(lead.leadScore) : '—'}
              </div>
            </div>

            {/* 14. Expected Value */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Expected Value</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 flex items-center truncate">
                {(() => {
                  const rawVal = lead.expectedValue ?? lead.estimatedValue;
                  if (rawVal == null || rawVal === '') return '—';
                  const numVal = typeof rawVal === 'number' ? rawVal : Number(rawVal);
                  return !isNaN(numVal) ? formatRupee(numVal) : String(rawVal);
                })()}
              </div>
            </div>

            {/* 15. Expected Close Date */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Expected Close Date</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center truncate">
                {lead.expectedCloseDate || '—'}
              </div>
            </div>

            {/* 16. Next Follow-up */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Next Follow-up</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs flex items-center">
                {lead.nextFollowUp ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
                    {lead.nextFollowUp}
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </div>
            </div>

            {/* 17. Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Status</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]">
                  {lead.status || 'Active'}
                </span>
              </div>
            </div>

            {/* 18. Lost Reason */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Lost Reason</label>
              <div className="w-full h-[38px] px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center truncate">
                {lead.lostReason || '-'}
              </div>
            </div>
          </div>

          {/* Notes Section (full-width) */}
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
            <div className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
              {lead.notes || '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
