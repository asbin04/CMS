import React, { useState, useEffect } from 'react';
import { X, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { InvoiceRecord } from '../types';
import { formatDateDisplay, formatDateForInput, deriveStatuses, calculateDaysOverdue, calculateAgingBucket } from '../utils';
import { invoicesApiService, UpdateInvoicePayload } from '../invoicesApiService';

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onSave: (updated: InvoiceRecord) => void;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSave,
}) => {
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectId, setProjectId] = useState('');
  const [contractId, setContractId] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(30);
  const [amountBeforeTax, setAmountBeforeTax] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [taxAmount, setTaxAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice && isOpen) {
      setInvoiceDate(formatDateForInput(invoice.invoiceDate));
      setDueDate(formatDateForInput(invoice.dueDate));
      setClientId(invoice.clientId);
      setClientName(invoice.clientName || invoice.clientId);
      setProjectId(invoice.projectId);
      setContractId(invoice.contractId);
      setPaymentTermsDays(invoice.paymentTermsDays || 30);
      setAmountBeforeTax(String(invoice.amountBeforeTax));
      setTaxRate(invoice.taxRate !== undefined && invoice.taxRate !== null ? Number(invoice.taxRate) : 0);
      setTaxAmount(invoice.taxAmount);
      setTotalAmount(invoice.totalAmount);
      setPaidAmount(String(invoice.paidAmount));
      setNotes(invoice.notes || '');
      setError('');
      setIsSubmitting(false);
    }
  }, [invoice, isOpen]);

  if (!isOpen || !invoice) return null;

  const handleAmountChange = (rawAmount: string, rate: number) => {
    setAmountBeforeTax(rawAmount);
    const num = parseFloat(rawAmount.replace(/,/g, ''));
    if (!isNaN(num) && num >= 0) {
      const calculatedTax = Math.round(num * (rate / 100));
      setTaxAmount(calculatedTax);
      setTotalAmount(num + calculatedTax);
    } else {
      setTaxAmount(0);
      setTotalAmount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmt = parseFloat(amountBeforeTax.replace(/,/g, ''));
    const rawPaid = parseFloat(paidAmount.replace(/,/g, '') || '0');

    if (isNaN(rawAmt) || rawAmt <= 0) {
      setError('Amount before tax must be greater than 0.');
      return;
    }
    if (isNaN(rawPaid) || rawPaid < 0) {
      setError('Paid amount cannot be negative.');
      return;
    }
    if (rawPaid > totalAmount) {
      setError(`Paid amount (₹${rawPaid.toLocaleString('en-IN')}) cannot exceed total invoice amount (₹${totalAmount.toLocaleString('en-IN')}).`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: UpdateInvoicePayload = {
        clientId: clientId.trim(),
        client: clientName.trim(),
        clientName: clientName.trim(),
        projectId: projectId.trim(),
        contractId: contractId.trim(),
        invoiceDate: formatDateForInput(invoiceDate),
        dueDate: formatDateForInput(dueDate),
        amountBeforeTax: rawAmt,
        taxRate,
        taxAmount,
        paymentTermsDays,
        notes: notes.trim(),
      };

      const updated = await invoicesApiService.updateInvoice(invoice.invoiceId, payload);
      onSave(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update invoice. Please check the fields and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 m-0">Edit Invoice — {invoice.invoiceId}</h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5">Update invoice details, payments, and financial calculations</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-600 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Row 1: Invoice ID (Read-only) & Invoice Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice ID (Locked)</label>
                <input
                  type="text"
                  value={invoice.invoiceId}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 rounded-[12px] bg-slate-100 text-xs font-semibold text-slate-500 cursor-not-allowed"
                  style={{ borderRadius: '12px' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  required
                />
              </div>
            </div>

            {/* Row 2: Client & Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  required
                />
              </div>
            </div>

            {/* Row 3: Contract ID & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contract ID</label>
                <input
                  type="text"
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  required
                />
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Financial Adjustments
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Before Tax (₹)</label>
                  <input
                    type="number"
                    value={amountBeforeTax}
                    onChange={(e) => handleAmountChange(e.target.value, taxRate)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Rate (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setTaxRate(rate);
                      handleAmountChange(amountBeforeTax, rate);
                    }}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                  >
                    <option value={0}>0%</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:border-indigo-500"
                    style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
                    min="0"
                    max={totalAmount}
                    required
                  />
                </div>
              </div>

              {/* Total & Outstanding Calculation */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">Total Amount:</span>
                  <span className="text-sm font-bold text-indigo-700 font-mono">
                    {'₹ ' + totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Remaining Outstanding:</span>
                  <span className="text-sm font-bold text-rose-600 font-mono">
                    {'₹ ' + Math.max(0, totalAmount - (parseFloat(paidAmount) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
                style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 text-white rounded-[12px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              style={{ borderRadius: '12px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

