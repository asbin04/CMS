import React, { useState } from 'react';
import { Receipt, Download, Plus } from 'lucide-react';
import { ReloadButton } from '../../../components/ui/ReloadButton';

interface InvoicesHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onCreateInvoice?: () => void;
  lastUpdated?: string;
  isRefreshing?: boolean;
}

export const InvoicesHeader: React.FC<InvoicesHeaderProps> = ({
  onRefresh,
  onExport,
  onCreateInvoice,
  lastUpdated = '15 Oct 2026, 11:30 AM',
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Left side: Green Icon Box + Title + Subtitle */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shrink-0 shadow-2xs">
          <Receipt className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Invoice Management
          </h1>
          <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
            Create, manage and track client invoices, payments and outstanding dues.
          </p>
        </div>
      </div>

      {/* Right side: Timestamp + Refresh + Export + Create Invoice */}
      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 flex-wrap">
        {/* Refresh Icon */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mr-1">
          <ReloadButton
            onClick={handleRefreshClick}
            isRefreshing={isRefreshing}
            title="Refresh invoices"
            className="p-1.5 rounded-[12px] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50 transition-colors cursor-pointer border border-[#E2E8F0] bg-[#FFFFFF]"
            style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Export Button (Secondary) */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFFFFF] hover:bg-slate-50 active:bg-slate-100 border border-[#E2E8F0] text-slate-700 text-xs font-semibold leading-4 rounded-[12px] shadow-2xs transition-colors cursor-pointer h-[38px]"
          style={{ border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFFFFF' }}
        >
          <Download className="w-4 h-4 text-slate-600 stroke-[2]" />
          <span>Export</span>
        </button>

        {/* Primary + Create Invoice Button */}
        <button
          type="button"
          onClick={onCreateInvoice}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white text-xs font-semibold leading-4 rounded-[12px] shadow-sm transition-all duration-150 cursor-pointer h-[38px]"
          style={{ borderRadius: '12px' }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Invoice</span>
        </button>
      </div>
    </div>
  );
};

