import React from 'react';
import { BarChart3 } from 'lucide-react';
import { ReloadButton } from '@/components/ui/ReloadButton';
import { ExportButton } from '@/components/ui/ExportButton';

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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-auto sm:h-14">
      {/* Title & Subtitle */}
      <div className="flex items-center">
        {/* Background+Border+Shadow */}
        <div className="box-border w-11 h-11 rounded-[12px] bg-[#EEF2FF] border border-[#E0E7FF] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0">
          <BarChart3 className="w-6 h-6 stroke-[#4F46E5] stroke-[2]" />
        </div>
        <div className="ml-3.5 flex flex-col gap-1">
          <h1 className="font-['Inter'] font-bold text-[24px] leading-8 tracking-[-0.6px] text-[#0F172A]">
            Sales Performance & Pipeline
          </h1>
          <p className="font-['Inter'] font-normal text-[14px] leading-5 text-[#64748B]">
            Monitor sales performance, pipeline value, and conversion across the sales lifecycle.
          </p>
        </div>
      </div>

      {/* Date Selector & Export Actions */}
      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
        <ReloadButton
          onClick={onRefresh}
          isRefreshing={isRefreshing}
          title="Refresh sales data"
          ariaLabel="Refresh sales data"
        />

        <ExportButton
          onClick={onExport}
          label="Export Report"
          title="Export Report"
        />
      </div>
    </div>
  );
};
