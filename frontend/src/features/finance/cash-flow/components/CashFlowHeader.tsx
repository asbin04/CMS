import React from 'react';
import { Wallet, Download, Plus } from 'lucide-react';
import { ReloadButton } from '../../../../components/ui/ReloadButton';

interface CashFlowHeaderProps {
  lastUpdated?: string;
  onRefresh?: () => void;
  onExport?: () => void;
  onAddCashFlow?: () => void;
  isRefreshing?: boolean;
}

export const CashFlowHeader: React.FC<CashFlowHeaderProps> = ({
  lastUpdated = '15 Oct 2026, 11:30 AM',
  onRefresh,
  onExport,
  onAddCashFlow,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 w-full">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
          <Wallet className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Cash Flow
          </h1>
          <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
            Track cash inflows, outflows, and the closing cash position for each period.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        {onRefresh && (
          <ReloadButton
            onClick={onRefresh}
            isRefreshing={isRefreshing}
            title="Refresh"
            aria-label="Refresh Cash Flow data"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
          />
        )}

        <button
          type="button"
          onClick={onExport}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer h-[36px]"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export</span>
        </button>

        <button
          type="button"
          onClick={onAddCashFlow}
          className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer h-[36px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Cash Flow</span>
        </button>
      </div>
    </div>
  );
};

