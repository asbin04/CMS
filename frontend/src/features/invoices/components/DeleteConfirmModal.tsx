import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';
import { InvoiceRecord } from '../types';
import { invoicesApiService } from '../invoicesApiService';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onConfirm: (invoiceId: string) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !invoice) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await invoicesApiService.deleteInvoice(invoice.invoiceId);
      onConfirm(invoice.invoiceId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Cannot delete invoice: financial activity exists or operation failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Trash2 className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 m-0">Delete Invoice</h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to delete invoice <strong className="text-slate-900">{invoice.invoiceId}</strong> for{' '}
              <strong className="text-slate-900">{invoice.clientName || invoice.clientId}</strong>?
            </p>
            {error ? (
              <div className="text-[11px] text-red-700 mt-3 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-start gap-1.5 font-medium leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : (
              <p className="text-[11px] text-red-600 mt-2 bg-red-50 p-2 rounded-lg border border-red-200">
                Invoices can only be deleted if no payments or reversals have been recorded.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
            style={{ borderRadius: '12px' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-[12px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            style={{ borderRadius: '12px' }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete Invoice</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

