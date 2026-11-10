import React, { useEffect } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemIdentifier?: string;
  itemType?: string;
  message?: string;
  warningText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDeleting?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Record',
  itemIdentifier,
  itemType = 'record',
  message,
  warningText = 'This action cannot be undone and will permanently remove this data.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDeleting = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden p-6 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 id="delete-modal-title" className="text-base font-bold text-slate-900 m-0">
                {title}
              </h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {message || (
                <>
                  Are you sure you want to delete {itemType}{' '}
                  {itemIdentifier && <strong className="text-slate-900">{itemIdentifier}</strong>}?
                </>
              )}
            </p>
            {warningText && (
              <div className="text-[11px] text-red-700 mt-3 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-start gap-1.5 font-medium leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{warningText}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-[12px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-white" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

