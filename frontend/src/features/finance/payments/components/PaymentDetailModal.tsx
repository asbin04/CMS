import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2, CreditCard, Building, Calendar, Hash, FileText } from 'lucide-react';
import { FinancePaymentRecord, UpdatePaymentPayload } from '../types/payments';

interface PaymentDetailModalProps {
  payment: FinancePaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdatePaymentPayload) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const formatIndianCurrency = (num?: number): string => {
  if (num === undefined || num === null) return '₹ 0';
  return '₹ ' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  payment,
  isOpen,
  onClose,
  onUpdate,
}) => {
  if (!isOpen || !payment) return null;

  const [status, setStatus] = useState(payment.status);
  const [mode, setMode] = useState(payment.mode);
  const [referenceNo, setReferenceNo] = useState(payment.referenceNo);
  const [notes, setNotes] = useState(payment.notes || '');
  const [varianceAmount, setVarianceAmount] = useState(String(payment.varianceAmount || 0));
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSuccess(false);

    try {
      setIsUpdating(true);
      await onUpdate(payment.id, {
        status,
        mode,
        referenceNo: referenceNo.trim(),
        notes: notes.trim(),
        varianceAmount: parseFloat(varianceAmount) || 0,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update payment';
      setError(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{payment.id}</h2>
              <p className="text-xs text-slate-500">{payment.clientName} ({payment.clientId})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleUpdate} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Payment updated successfully!</span>
            </div>
          )}

          {/* Quick Metrics Banner */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Payment Amount</span>
              <div className="text-base font-bold text-slate-900">{formatIndianCurrency(payment.amount)}</div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium">Invoice Amount</span>
              <div className="text-base font-bold text-slate-700">{formatIndianCurrency(payment.invoiceAmount)}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Payment Date:</span>
              <span className="font-semibold text-slate-800">{payment.paymentDate}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Invoice ID:</span>
              <span className="font-semibold text-indigo-600">{payment.invoiceId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> Client:</span>
              <span className="font-semibold text-slate-800">{payment.clientName}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-slate-400" /> Variance:</span>
              <span className="font-semibold text-amber-600">{formatIndianCurrency(payment.varianceAmount)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                >
                  <option value="Matched">Matched</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Matched">Partially Matched</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="NEFT">NEFT</option>
                  <option value="UPI">UPI</option>
                  <option value="Cheque">Cheque</option>
                  <option value="RTGS">RTGS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Reference / UTR No</label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 uppercase"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Variance Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={varianceAmount}
                onChange={(e) => setVarianceAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

