import React from 'react';
import { BarChart3, RotateCw, ArrowUpFromLine } from 'lucide-react';

interface SalesDashboardHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export const SalesDashboardHeader: React.FC<SalesDashboardHeaderProps> = ({
  isRefreshing,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
      {/* Title & Icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#DCE4FD] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
          <BarChart3 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 tracking-tight leading-tight">
            Sales Performance & Pipeline
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-0.5 leading-normal">
            Monitor sales performance, pipeline value, and conversion across the sales lifecycle.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-9 h-9 rounded-xl border border-[#DCE3ED] bg-white flex items-center justify-center text-[#64748B] hover:text-slate-900 hover:bg-slate-50/80 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          title="Refresh sales data"
          aria-label="Refresh sales data"
        >
          <RotateCw className={`w-4 h-4 stroke-[2] text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={onExport}
          className="h-9 px-3.5 rounded-xl border border-[#DCE3ED] bg-white flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50/80 transition-all shadow-2xs cursor-pointer"
        >
          <ArrowUpFromLine className="w-4 h-4 text-slate-600 stroke-[2]" />
          <span>Export Report</span>
        </button>
      </div>
    </div>
  );
};

