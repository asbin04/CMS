import React, { useState } from 'react';
import { Users2, RotateCw } from 'lucide-react';
import { Department } from '../types';

interface HrDashboardHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  selectedDept?: Department;
  onDeptChange?: (dept: Department) => void;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  activeTab?: 'overview' | 'analytics';
  onTabChange?: (tab: 'overview' | 'analytics') => void;
}

export const HrDashboardHeader: React.FC<HrDashboardHeaderProps> = ({
  lastUpdated,
  onRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    onRefresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div
      className="flex flex-col gap-4 mb-1 w-full"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Title, Subtitle & Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full flex-wrap">
        {/* Left side: Teal People Icon + Title + Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 max-w-3xl">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 shadow-2xs mt-0.5 sm:mt-0">
            <Users2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-7 m-0">
              HR Dashboard
            </h1>
            <p className="text-xs text-slate-500 leading-4 font-normal m-0 mt-0.5">
              Monitor workforce activity, recruitment, attendance, leave approvals, and employee movement.
            </p>
          </div>
        </div>

        {/* Right side: Refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh HR data"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#64748B] hover:text-[#0F172A] transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
          >
            <RotateCw
              className={`w-3.5 h-3.5 stroke-[2] text-[#64748B] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
