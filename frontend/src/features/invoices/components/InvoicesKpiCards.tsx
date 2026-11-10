import React from 'react';
import { FileText, Receipt, CreditCard, ArrowUp, ArrowDown } from 'lucide-react';
import { InvoiceKpiSummary } from '../types';
import { formatRupee, formatRupeeCompact } from '../utils';

interface InvoicesKpiCardsProps {
  kpis: InvoiceKpiSummary;
}

export const InvoicesKpiCards: React.FC<InvoicesKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {/* Card 1: Total Invoices */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium truncate mb-1">Total Invoices</p>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{kpis.totalInvoices}</h2>
          <div className="flex items-center text-xs">
            <span className="text-[#10B981] font-semibold flex items-center">
              <ArrowUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              {Math.abs(kpis.totalInvoicesTrend)}%
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Invoice Value */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0">
          <Receipt className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium truncate mb-1">Total Invoice Value</p>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
            {formatRupeeCompact(kpis.totalInvoiceValue)}
          </h2>
          <div className="flex items-center text-xs">
            <span className="text-[#10B981] font-semibold flex items-center">
              <ArrowUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              {Math.abs(kpis.totalInvoiceValueTrend)}%
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Card 3: Paid Amount */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
          <CreditCard className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium truncate mb-1">Paid Amount</p>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
            {formatRupee(kpis.paidAmount)}
          </h2>
          <div className="flex items-center text-xs">
            <span className="text-[#10B981] font-semibold flex items-center">
              <ArrowUp className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              {Math.abs(kpis.paidAmountTrend)}%
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </div>
      </div>

      {/* Card 4: Outstanding Amount */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 sm:p-5 shadow-xs flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
          <Receipt className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500 font-medium truncate mb-1">Outstanding Amount</p>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">
            {formatRupee(kpis.outstandingAmount)}
          </h2>
          <div className="flex items-center text-xs">
            <span className="text-[#EF4444] font-semibold flex items-center">
              <ArrowDown className="w-3 h-3 mr-0.5 stroke-[2.5]" />
              {Math.abs(kpis.outstandingAmountTrend)}%
            </span>
            <span className="text-slate-400 ml-1">vs last month</span>
          </div>
        </div>
      </div>
    </div>
  );
};
