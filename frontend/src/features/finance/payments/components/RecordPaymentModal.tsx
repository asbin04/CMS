import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { ClientFilterOption, RecordPaymentPayload } from '../types/payments';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RecordPaymentPayload) => Promise<void>;
  clients: ClientFilterOption[];
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  clients,
}) => {
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [invoiceId, setInvoiceId] = useState('');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState('');
  const [status, setStatus] = useState('Matched');
  const [varianceAmount, setVarianceAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!invoiceId.trim()) {
      setError('Invoice ID is required');
      return;
    }
    if (!clientId.trim()) {
      setError('Please select a client');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero');
      return;
    }
    if (!referenceNo.trim()) {
      setError('Reference / UTR number is required');
      return;
    }

    const selectedClient = clients.find((c) => c.clientId === clientId);

    const payload: RecordPaymentPayload = {
      paymentDate,
      invoiceId: invoiceId.trim(),
      clientId: clientId.trim(),
      clientName: selectedClient?.clientName,
      amount: numAmount,
      invoiceAmount: numAmount + (parseFloat(varianceAmount) || 0),
      mode,
      referenceNo: referenceNo.trim(),
      status,
      varianceAmount: parseFloat(varianceAmount) || 0,
      notes: notes.trim() || '-',
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record payment';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Record Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter payment details to match with invoices and update ledger records.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Date */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Invoice ID */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Invoice ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. INV-2026-129"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 uppercase"
              />
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Client *</label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            >
              <option value="">Select Client...</option>
              {clients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.clientId} - {c.clientName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 70800"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 font-semibold"
              />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Payment Mode *</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="NEFT">NEFT</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="RTGS">RTGS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reference No */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Reference / UTR No *</label>
              <input
                type="text"
                required
                placeholder="e.g. UTR987654321"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 uppercase"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Payment Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              >
                <option value="Matched">Matched</option>
                <option value="Pending">Pending</option>
                <option value="Partially Matched">Partially Matched</option>
              </select>
            </div>
          </div>

          {/* Variance Amount */}
          {status === 'Partially Matched' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Variance Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 5000"
                value={varianceAmount}
                onChange={(e) => setVarianceAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Advance payment for phase 2 / Cheque clearing note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

