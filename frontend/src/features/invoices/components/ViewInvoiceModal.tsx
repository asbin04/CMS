import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Printer,
  CreditCard,
  History,
  RotateCcw,
  Plus,
  Loader2,
  Check,
} from 'lucide-react';
import { InvoiceRecord } from '../types';
import { formatRupee } from '../utils';
import {
  invoicesApiService,
  BackendPaymentRecord,
  RecordPaymentPayload,
  ReversePaymentPayload,
} from '../invoicesApiService';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceRecord | null;
  onEdit?: (invoice: InvoiceRecord) => void;
  onInvoiceUpdated?: (updatedInvoice: InvoiceRecord) => void;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onEdit,
  onInvoiceUpdated,
}) => {
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceRecord | null>(invoice);
  const [payments, setPayments] = useState<BackendPaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Payment Recording State
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Bank Transfer');
  const [payRefId, setPayRefId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Payment Reversal State
  const [reversingPayment, setReversingPayment] = useState<BackendPaymentRecord | null>(null);
  const [reversalAmount, setReversalAmount] = useState('');
  const [reversalReason, setReversalReason] = useState('Customer Request / Correction');
  const [isSubmittingReversal, setIsSubmittingReversal] = useState(false);

  useEffect(() => {
    if (isOpen && invoice) {
      setCurrentInvoice(invoice);
      setShowRecordPayment(false);
      setReversingPayment(null);
      setPaymentError('');
      setPaymentSuccess('');
      loadPayments(invoice.invoiceId);
    }
  }, [isOpen, invoice]);

  const loadPayments = async (invoiceId: string) => {
    setIsLoadingPayments(true);
    try {
      const history = await invoicesApiService.getPaymentHistory(invoiceId);
      setPayments(history || []);
    } catch {
      // Ignore or set empty
      setPayments([]);
    } finally {
      setIsLoadingPayments(false);
    }
  };

  if (!isOpen || !currentInvoice) return null;

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid payment amount greater than 0.');
      return;
    }
    if (amountNum > currentInvoice.outstandingAmount) {
      setPaymentError(
        `Payment amount (₹${amountNum.toLocaleString('en-IN')}) cannot exceed outstanding amount (₹${currentInvoice.outstandingAmount.toLocaleString('en-IN')}).`
      );
      return;
    }

    setIsSubmittingPay(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const payload: RecordPaymentPayload = {
        amount: amountNum,
        paymentMethod: payMethod,
        referenceId: payRefId.trim() || undefined,
        notes: payNotes.trim() || undefined,
        paymentDate: new Date().toISOString().split('T')[0],
      };

      await invoicesApiService.recordPayment(currentInvoice.invoiceId, payload);
      setPaymentSuccess('Payment recorded successfully.');
      setShowRecordPayment(false);
      setPayAmount('');
      setPayRefId('');
      setPayNotes('');

      // Refresh payments and invoice data
      await loadPayments(currentInvoice.invoiceId);
      const updated = await invoicesApiService.getInvoiceById(currentInvoice.invoiceId);
      setCurrentInvoice(updated);
      onInvoiceUpdated?.(updated);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to record payment.');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleReversePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversingPayment) return;

    const amountNum = parseFloat(reversalAmount.replace(/,/g, ''));
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid reversal amount greater than 0.');
      return;
    }
    if (!reversalReason.trim()) {
      setPaymentError('Reversal reason is required.');
      return;
    }

    setIsSubmittingReversal(true);
    setPaymentError('');
    setPaymentSuccess('');

    try {
      const idempotencyKey = `IDEMP-REV-${currentInvoice.invoiceId}-${reversingPayment.id}-${Date.now()}`;
      const payload: ReversePaymentPayload = {
        reversalAmount: amountNum,
        reason: reversalReason.trim(),
        referenceId: reversingPayment.referenceId,
        idempotencyKey,
      };

      await invoicesApiService.reversePayment(currentInvoice.invoiceId, reversingPayment.id, payload);
      setPaymentSuccess(`Payment ${reversingPayment.id} reversed successfully.`);
      setReversingPayment(null);

      // Refresh payments and invoice data
      await loadPayments(currentInvoice.invoiceId);
      const updated = await invoicesApiService.getInvoiceById(currentInvoice.invoiceId);
      setCurrentInvoice(updated);
      onInvoiceUpdated?.(updated);
    } catch (err: any) {
      setPaymentError(err.message || 'Failed to reverse payment.');
    } finally {
      setIsSubmittingReversal(false);
    }
  };

  const renderStatusBadge = (status: InvoiceRecord['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            <Clock className="w-3.5 h-3.5" /> Partially Paid
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]">
            <AlertTriangle className="w-3.5 h-3.5" /> Unpaid
          </span>
        );
    }
  };

  const renderCollectionBadge = (status: InvoiceRecord['collectionStatus']) => {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
            Completed
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            Pending
          </span>
        );
      case 'Follow Up':
        return (
          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
            Follow Up
          </span>
        );
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
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 m-0">{currentInvoice.invoiceId}</h3>
                {renderStatusBadge(currentInvoice.status)}
              </div>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Client: <strong className="text-slate-700">{currentInvoice.clientName || currentInvoice.clientId}</strong>
              </p>
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {paymentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paymentSuccess}</span>
            </div>
          )}

          {paymentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Invoice Date</p>
              <p className="text-xs font-semibold text-slate-900">{currentInvoice.invoiceDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-xs font-semibold text-slate-900">{currentInvoice.dueDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Terms</p>
              <p className="text-xs font-semibold text-slate-900">{currentInvoice.paymentTermsDays} Days</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Days Overdue</p>
              <p className={`text-xs font-bold ${currentInvoice.daysOverdue > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                {currentInvoice.daysOverdue > 0 ? `${currentInvoice.daysOverdue} Days` : '0 (On time)'}
              </p>
            </div>
          </div>

          {/* Client & Contract Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Client ID</span>
              <span className="text-xs font-bold text-indigo-600">{currentInvoice.clientId}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Project ID</span>
              <span className="text-xs font-bold text-indigo-600">{currentInvoice.projectId}</span>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <span className="text-[11px] text-slate-500 font-medium block mb-1">Contract ID</span>
              <span className="text-xs font-bold text-indigo-600">{currentInvoice.contractId}</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Financial Summary</h4>
              {currentInvoice.outstandingAmount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setPayAmount(String(currentInvoice.outstandingAmount));
                    setShowRecordPayment(!showRecordPayment);
                    setReversingPayment(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              )}
            </div>
            <div className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Amount Before Tax:</span>
                <span className="font-mono font-semibold text-slate-800">{formatRupee(currentInvoice.amountBeforeTax)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Tax Amount (GST):</span>
                <span className="font-mono font-semibold text-slate-800">{formatRupee(currentInvoice.taxAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-700">{formatRupee(currentInvoice.totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-semibold pt-1">
                <span>Paid Amount:</span>
                <span className="font-mono">{formatRupee(currentInvoice.paidAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-rose-700 font-bold pt-1">
                <span>Outstanding Amount:</span>
                <span className="font-mono">{formatRupee(currentInvoice.outstandingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Record Payment Form Accordion */}
          {showRecordPayment && (
            <form onSubmit={handleRecordPaymentSubmit} className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                <h5 className="text-xs font-bold text-indigo-900">Record Live Payment</h5>
                <button
                  type="button"
                  onClick={() => setShowRecordPayment(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentInvoice.outstandingAmount}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="NEFT">NEFT</option>
                    <option value="RTGS">RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Reference ID / UTR</label>
                  <input
                    type="text"
                    value={payRefId}
                    onChange={(e) => setPayRefId(e.target.value)}
                    placeholder="e.g. UTR-2026-9988"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordPayment(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-60"
                >
                  {isSubmittingPay ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <span>Submit Payment</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Payment Reversal Form Accordion */}
          {reversingPayment && (
            <form onSubmit={handleReversePaymentSubmit} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                <h5 className="text-xs font-bold text-amber-900">
                  Reverse Payment: {reversingPayment.id} (₹{reversingPayment.amount.toLocaleString('en-IN')})
                </h5>
                <button
                  type="button"
                  onClick={() => setReversingPayment(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Reversal Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={reversingPayment.amount}
                    value={reversalAmount}
                    onChange={(e) => setReversalAmount(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reversalReason}
                    onChange={(e) => setReversalReason(e.target.value)}
                    placeholder="e.g. Duplicate entry, Cheque bounce"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReversingPayment(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReversal}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-60"
                >
                  {isSubmittingReversal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Reversing...</span>
                    </>
                  ) : (
                    <span>Confirm Reversal</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Payment History Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Payment History ({payments.length})
                </h4>
              </div>
            </div>

            {isLoadingPayments ? (
              <div className="p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Loading payment ledger...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                      <th className="px-3 py-2">Payment ID</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2 font-mono text-indigo-600 font-semibold">{p.id}</td>
                        <td className="px-3 py-2 text-slate-600">{p.date}</td>
                        <td className="px-3 py-2 text-slate-700">{p.method || 'Bank Transfer'}</td>
                        <td className="px-3 py-2 text-slate-600 font-mono text-[11px]">{p.referenceId || '—'}</td>
                        <td className="px-3 py-2 text-right font-mono font-semibold text-emerald-700">
                          {formatRupee(p.amount)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setReversingPayment(p);
                              setReversalAmount(String(p.amount));
                              setShowRecordPayment(false);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors cursor-pointer"
                            title="Reverse Payment"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reverse</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Status & Aging */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Aging Bucket</p>
              <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-800">
                {currentInvoice.agingBucket}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Collection Status</p>
              {renderCollectionBadge(currentInvoice.collectionStatus)}
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium mb-1">Outstanding Status</p>
              <span className={`text-xs font-bold ${currentInvoice.outstanding === 'Yes' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {currentInvoice.outstanding === 'Yes' ? 'Pending Dues' : 'Fully Settled'}
              </span>
            </div>
          </div>

          {/* Notes */}
          {currentInvoice.notes && (
            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-slate-700">
              <strong className="block text-[11px] font-bold text-amber-800 mb-0.5">Notes:</strong>
              {currentInvoice.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] bg-slate-50">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors"
            style={{ borderRadius: '12px' }}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ borderRadius: '12px' }}
            >
              Close
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(currentInvoice);
                }}
                className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[12px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                style={{ borderRadius: '12px' }}
              >
                Edit Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

