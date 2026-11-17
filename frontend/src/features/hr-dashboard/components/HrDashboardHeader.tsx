import React from 'react';
import { User } from 'lucide-react';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { ExportButton } from '@/components/ui/ExportButton';

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
        <ReloadButton
          onClick={onRefresh}
          isRefreshing={isRefreshing}
          title="Refresh HR Data"
        />

        {/* Export button */}
        <ExportButton onClick={onExport} />
      </div>
    </div>
  );
};

