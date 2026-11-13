import React from 'react';
import { LogOut, Upload, Plus } from 'lucide-react';
import { ReloadButton } from '../../../../components/ui/ReloadButton';

interface EmployeeExitHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  onExport: () => void;
  onProcessExit: () => void;
  isRefreshing?: boolean;
}

export const EmployeeExitHeader: React.FC<EmployeeExitHeaderProps> = ({
  lastUpdated,
  onRefresh,
  onExport,
  onProcessExit,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      {/* Title & Icon Section */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#E6F7F5] border border-[#B2ECE4] text-[#0D9488] flex items-center justify-center shrink-0">
          <LogOut className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight m-0 tracking-tight">
            Employee Exit
          </h1>
          <p className="text-xs text-slate-500 font-normal m-0 mt-0.5 leading-normal">
            Manage employee exit requests, approvals, and offboarding process.
          </p>
        </div>
      </div>

      {/* Right Controls: Actions */}
      <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
        {/* Refresh Icon Button */}
        <ReloadButton
          onClick={onRefresh}
          isRefreshing={isRefreshing}
          title="Refresh exit data"
        />

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Process Exit Button */}
        <button
          type="button"
          onClick={onProcessExit}
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Process Exit</span>
        </button>
      </div>
    </div>
  );
};

