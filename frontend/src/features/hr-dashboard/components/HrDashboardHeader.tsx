import React from 'react';
import { User, RotateCw, Download } from 'lucide-react';

interface HrDashboardHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onAddEmployee?: () => void;
  isRefreshing?: boolean;
  lastUpdated?: string;
}

export const HrDashboardHeader: React.FC<HrDashboardHeaderProps> = ({
  onRefresh,
  onExport,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      {/* Title block with user icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#4F46E5] shrink-0 shadow-2xs">
          <User className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            HR Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track workforce, recruitment, attendance, leave and exits.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Refresh HR Data"
          disabled={isRefreshing}
          className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#4F46E5]' : ''}`} />
        </button>

        {/* Export button */}
        <button
          type="button"
          onClick={onExport}
          className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};

