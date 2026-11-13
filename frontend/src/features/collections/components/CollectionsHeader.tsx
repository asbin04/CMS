import React, { useState } from 'react';
import { FileText, Upload, Plus } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';

interface CollectionsHeaderProps {
  onRefresh?: () => void;
  onExport: () => void;
  onOpenLogPayment?: () => void;
  onLogPayment?: () => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
}

export const CollectionsHeader: React.FC<CollectionsHeaderProps> = ({
  onRefresh,
  onExport,
  onOpenLogPayment,
  onLogPayment,
  lastUpdated = '—',
  isRefreshing: externalRefreshing = false,
}) => {
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const isRefreshing = externalRefreshing || internalRefreshing;

  const handleRefreshClick = () => {
    if (onRefresh) {
      setInternalRefreshing(true);
      onRefresh();
      setTimeout(() => setInternalRefreshing(false), 600);
    }
  };

  const handleLogPayment = onOpenLogPayment || onLogPayment || (() => {});

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left side: Amber Icon Box + Title + Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shrink-0 shadow-2xs">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Collections
          </h1>
          <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
            Monitor outstanding invoices and follow up on expected payments.
          </p>
        </div>
      </div>

      {/* Right side: Timestamp + Refresh + Export + Log Payment */}
      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
        {/* Refresh Icon */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mr-1">
          <ReloadButton
            onClick={handleRefreshClick}
            isRefreshing={isRefreshing}
            title="Refresh collections data"
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
          />
        </div>

        {/* Export Button (Secondary) */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold leading-4 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4 text-slate-600 stroke-[2]" />
          <span>Export</span>
        </button>

        {/* Primary + Log Payment Button */}
        <button
          type="button"
          onClick={handleLogPayment}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-xs font-semibold leading-4 rounded-lg shadow-sm transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Payment</span>
        </button>
      </div>
    </div>
  );
};

