import React, { useState } from 'react';
import { Code2, RotateCw, Download, Plus } from 'lucide-react';

interface DevelopmentPageHeaderProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onAddDevelopment?: () => void;
  lastUpdated?: string;
}

export const DevelopmentPageHeader: React.FC<DevelopmentPageHeaderProps> = ({
  onRefresh,
  onExport,
  onAddDevelopment,
  lastUpdated = '15 Oct 2026, 11:30 AM',
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2 w-full">
      {/* Title & Icon */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shrink-0 shadow-2xs">
          <Code2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-7 m-0">
            Development
          </h1>
          <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
            Track development activities, code progress, build versions, QA handoff and releases.
          </p>
        </div>
      </div>

      {/* Right Controls: Timestamp, Refresh, Export, + Add Development */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Last Updated: {lastUpdated}</span>
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh"
            aria-label="Refresh Development data"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#4F46E5]' : ''}`} />
          </button>
        </div>

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
          onClick={onAddDevelopment}
          className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer h-[36px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Development</span>
        </button>
      </div>
    </div>
  );
};

