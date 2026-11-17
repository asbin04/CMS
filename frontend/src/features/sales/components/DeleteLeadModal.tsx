import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { Lead } from '../types/leads';

interface DeleteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onConfirm: (id: string) => Promise<void> | void;
}

export const DeleteLeadModal: React.FC<DeleteLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(lead.id);
      onClose();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete lead from database.';
      setError(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-lead-title"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden p-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 id="delete-lead-title" className="text-base font-bold text-slate-900 m-0">
                Delete Lead?
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Are you sure you want to delete this lead? This action cannot be undone.
            </p>

            {/* Target Lead Summary Box */}
            <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-150 text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">{lead.company}</span>
                <span className="font-mono text-slate-500 font-medium text-[11px]">{lead.id}</span>
              </div>
              {lead.contactName && (
                <div className="text-slate-600 text-[11.5px]">Contact: {lead.contactName}</div>
              )}
            </div>

            {error && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Lead'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

