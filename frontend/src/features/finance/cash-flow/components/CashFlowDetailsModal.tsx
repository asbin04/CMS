import React from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownRight, Calendar, CheckCircle2 } from 'lucide-react';
import { CashFlowRecord } from '../types';
import { formatIndianCurrency } from '../mockData';

interface CashFlowDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CashFlowRecord | null;
}

export const CashFlowDetailsModal: React.FC<CashFlowDetailsModalProps> = ({
  isOpen,
  onClose,
  record,
}) => {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight m-0">
                  {record.cashFlowId}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {record.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                Cash Flow Summary for {record.period}
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

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top highlight cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-400">Opening Cash</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {formatIndianCurrency(record.openingCash)}
              </div>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Total Inflows</span>
              <div className="text-sm font-bold text-emerald-700 mt-1">
                +{formatIndianCurrency(record.totalInflows)}
              </div>
            </div>
            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/60">
              <span className="text-[10px] uppercase font-bold text-rose-600">Total Outflows</span>
              <div className="text-sm font-bold text-rose-700 mt-1">
                -{formatIndianCurrency(record.totalOutflows)}
              </div>
            </div>
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
              <span className="text-[10px] uppercase font-bold text-blue-600">Net Cash Flow</span>
              <div className={`text-sm font-bold mt-1 ${record.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {record.netCashFlow >= 0 ? '+' : ''}{formatIndianCurrency(record.netCashFlow)}
              </div>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/60">
              <span className="text-[10px] uppercase font-bold text-indigo-600">Closing Cash</span>
              <div className="text-sm font-bold text-[#4F46E5] mt-1">
                {formatIndianCurrency(record.closingCash)}
              </div>
            </div>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inflows breakdown */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                Inflows Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-600">Collections</span>
                  <span className="font-semibold text-emerald-600">{formatIndianCurrency(record.collections)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100/60">
                  <span className="text-slate-600">Other Inflows</span>
                  <span className="font-semibold text-emerald-600">{formatIndianCurrency(record.otherInflows)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-slate-800">
                  <span>Total Inflows</span>
                  <span className="text-emerald-700">{formatIndianCurrency(record.totalInflows)}</span>
                </div>
              </div>
            </div>

            {/* Outflows breakdown */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/20">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                Outflows Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-slate-600">Vendor Payments</span>
                  <span className="font-semibold text-rose-600">{formatIndianCurrency(record.vendorPayments)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-slate-600">Payroll Payments</span>
                  <span className="font-semibold text-rose-600">{formatIndianCurrency(record.payrollPayments)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-slate-600">Operating Expenses</span>
                  <span className="font-semibold text-rose-600">{formatIndianCurrency(record.operatingExpenses)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-rose-100/60">
                  <span className="text-slate-600">Other Outflows</span>
                  <span className="font-semibold text-rose-600">{formatIndianCurrency(record.otherOutflows)}</span>
                </div>
                <div className="flex justify-between pt-1 font-bold text-slate-800">
                  <span>Total Outflows</span>
                  <span className="text-rose-700">{formatIndianCurrency(record.totalOutflows)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                Notes & Remarks
              </span>
              <p className="text-xs text-slate-700 leading-relaxed m-0">{record.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

