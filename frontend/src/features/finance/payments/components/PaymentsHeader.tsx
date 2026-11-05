import React from 'react';
import { CreditCard, RotateCw, Download, Plus } from 'lucide-react';

interface PaymentsHeaderProps {
  lastUpdated?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onExport: () => void;
  onRecordPayment: () => void;
}

export const PaymentsHeader: React.FC<PaymentsHeaderProps> = ({
  lastUpdated = '15 Oct 2026, 11:30 AM',
  isRefreshing = false,
  onRefresh,
  onExport,
  onRecordPayment,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm w-full">
      {/* Title & Icon */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight m-0">Payments</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            Track and manage client payments, match with invoices and monitor payment status.
          </p>
        </div>
      </div>

      {/* Right Actions - Strictly single line without wrapping */}
      <div className="flex items-center flex-nowrap shrink-0 gap-2.5 sm:gap-3 self-start lg:self-auto overflow-x-auto max-w-full">
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Last Updated: <span className="font-medium text-slate-700">{lastUpdated}</span>
        </span>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm disabled:opacity-50 shrink-0 cursor-pointer"
          title="Refresh payment records and metrics"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export</span>
        </button>

        {/* Record Payment Button */}
        <button
          type="button"
          onClick={onRecordPayment}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-xs font-semibold text-white shadow-sm shadow-indigo-100 transition-colors shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>
    </div>
  );
};

