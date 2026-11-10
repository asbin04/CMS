import React, { useState, useEffect } from 'react';
import {
  X,
  Wallet,
  Calendar,
  ArrowUpRight,
  BarChart2,
  Info,
  Check,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { CashFlowRecord } from '../types';
import { formatIndianCurrency } from '../mockData';
import { cashFlowApiService } from '../services/cashFlowApiService';

interface EditCashFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (record: CashFlowRecord) => void;
  record: CashFlowRecord | null;
}

export const EditCashFlowModal: React.FC<EditCashFlowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  record,
}) => {
  const isLocked = record?.status?.toLowerCase() === 'completed';

  const [openingCash, setOpeningCash] = useState<string>('');
  const [collections, setCollections] = useState<string>('');
  const [otherInflows, setOtherInflows] = useState<string>('');
  const [vendorPayments, setVendorPayments] = useState<string>('');
  const [payrollPayments, setPayrollPayments] = useState<string>('');
  const [operatingExpenses, setOperatingExpenses] = useState<string>('');
  const [otherOutflows, setOtherOutflows] = useState<string>('');
  const [status, setStatus] = useState<string>('Pending');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && record) {
      setApiError(null);
      setIsSubmitting(false);
      setOpeningCash(String(record.openingCash ?? ''));
      setCollections(String(record.collections ?? ''));
      setOtherInflows(String(record.otherInflows ?? ''));
      setVendorPayments(String(record.vendorPayments ?? ''));
      setPayrollPayments(String(record.payrollPayments ?? ''));
      setOperatingExpenses(String(record.operatingExpenses ?? ''));
      setOtherOutflows(String(record.otherOutflows ?? ''));
      setStatus(record.status || 'Pending');
      setNotes(record.notes || '');
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const numOpening = Number(openingCash) || 0;
  const numCollections = Number(collections) || 0;
  const numOtherInflows = Number(otherInflows) || 0;
  const numVendor = Number(vendorPayments) || 0;
  const numPayroll = Number(payrollPayments) || 0;
  const numOperating = Number(operatingExpenses) || 0;
  const numOtherOutflows = Number(otherOutflows) || 0;

  const totalInflows = numCollections + numOtherInflows;
  const totalOutflows = numVendor + numPayroll + numOperating + numOtherOutflows;
  const netCashFlow = totalInflows - totalOutflows;
  const closingCash = numOpening + netCashFlow;

  const closingDisplay = formatIndianCurrency(closingCash).replace('₹ ', '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setApiError("Cannot update a completed cash flow record. Completed periods are locked.");
      return;
    }

    setApiError(null);
    setIsSubmitting(true);

    try {
      const updated = await cashFlowApiService.updateCashFlow(record.id, {
        period: record.period,
        periodCode: record.periodCode,
        openingCash: numOpening,
        collections: numCollections,
        otherInflows: numOtherInflows,
        vendorPayments: numVendor,
        payrollPayments: numPayroll,
        operatingExpenses: numOperating,
        otherOutflows: numOtherOutflows,
        status,
        notes: notes.trim() || undefined,
      });

      onSubmit(updated);
      onClose();
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        err?.data?.message ||
        'Failed to update cash flow record. Please verify input values.';
      setApiError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
        }}
        className="relative bg-white rounded-[16px] border border-[#F1F5F9] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-3.5 border-b border-[#F1F5F9] bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-slate-900 leading-tight m-0">
                  Edit Cash Flow — {record.cashFlowId}
                </h2>
                {isLocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-[11.5px] text-slate-500 font-normal m-0 mt-0.5">
                Period: {record.period} ({record.periodCode})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Locked warning banner */}
        {isLocked && (
          <div className="mx-7 mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>This cash flow record is <strong>Completed</strong> and locked. Modifications are disabled per financial compliance rules.</span>
          </div>
        )}

        {/* Backend Error Alert */}
        {apiError && (
          <div className="mx-7 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              type="button"
              onClick={() => setApiError(null)}
              className="text-rose-500 hover:text-rose-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="px-7 py-3.5 space-y-3">
            {/* Section 1: Period & Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.2]" />
                <span className="text-[11.5px] font-bold text-slate-800 tracking-wide">
                  Period Details & Status
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Cash Flow ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={record.cashFlowId}
                    className="w-full h-[36px] px-3 bg-[#F8FAFC] border border-[#C7D5E8] rounded-[10px] text-xs text-slate-600 font-semibold cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Period
                  </label>
                  <input
                    type="text"
                    disabled
                    value={record.period}
                    className="w-full h-[36px] px-3 bg-[#F8FAFC] border border-[#C7D5E8] rounded-[10px] text-xs text-slate-600 font-semibold cursor-not-allowed select-none"
                  />
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    disabled={isLocked}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-[36px] px-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 transition-colors disabled:bg-[#F8FAFC] disabled:cursor-not-allowed cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Cash Position */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                <Wallet className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.2]" />
                <span className="text-[11.5px] font-bold text-slate-800 tracking-wide">
                  Cash Position
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Opening Cash <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLocked}
                      value={openingCash}
                      onChange={(e) => setOpeningCash(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Collections <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLocked}
                      value={collections}
                      onChange={(e) => setCollections(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Other Inflows
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isLocked}
                      value={otherInflows}
                      onChange={(e) => setOtherInflows(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Outflows */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.2]" />
                <span className="text-[11.5px] font-bold text-slate-800 tracking-wide">
                  Outflows
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Vendor Payments <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLocked}
                      value={vendorPayments}
                      onChange={(e) => setVendorPayments(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Payroll Payments <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLocked}
                      value={payrollPayments}
                      onChange={(e) => setPayrollPayments(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Operating Expenses <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLocked}
                      value={operatingExpenses}
                      onChange={(e) => setOperatingExpenses(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Other Outflows
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isLocked}
                      value={otherOutflows}
                      onChange={(e) => setOtherOutflows(e.target.value)}
                      className="w-full h-[36px] pl-6 pr-3 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Closing & Notes */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8FAFC] rounded-lg">
                <BarChart2 className="w-3.5 h-3.5 text-[#4F46E5] stroke-[2.2]" />
                <span className="text-[11.5px] font-bold text-slate-800 tracking-wide">
                  Closing & Notes
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                <div className="lg:col-span-5">
                  <label className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-700 mb-1">
                    <span>Closing Cash</span>
                    <Info className="w-3.5 h-3.5 text-[#6366F1]" />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 pointer-events-none">
                      ₹
                    </span>
                    <input
                      type="text"
                      readOnly
                      value={closingDisplay}
                      className="w-full h-[36px] pl-6 pr-3 bg-[#F8FAFC] border border-[#C7D5E8] rounded-[10px] text-xs font-semibold text-slate-800 cursor-not-allowed select-none"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">
                    Notes
                  </label>
                  <div className="relative">
                    <textarea
                      rows={2}
                      maxLength={500}
                      disabled={isLocked}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full h-[58px] p-2.5 pb-5 bg-white border border-[#C7D5E8] rounded-[10px] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]/20 disabled:bg-[#F8FAFC] disabled:cursor-not-allowed resize-none transition-colors"
                    />
                    <span className="absolute right-2.5 bottom-1.5 text-[10.5px] text-slate-400 font-normal pointer-events-none">
                      {notes.length} / 500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-7 py-3 border-t border-[#F1F5F9] bg-white shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
            >
              Cancel
            </button>
            {!isLocked && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Update Cash Flow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

