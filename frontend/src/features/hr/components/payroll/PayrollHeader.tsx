import React from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { ReloadButton } from '../../../../components/ui/ReloadButton';
import { ExportButton } from '../../../../components/ui/ExportButton';

interface PayrollHeaderProps {
  lastUpdated: string;
  onRefresh: () => void;
  onExport: () => void;
  onProcessPayroll: () => void;
  isRefreshing?: boolean;
}

export const PayrollHeader: React.FC<PayrollHeaderProps> = ({
  lastUpdated,
  onRefresh,
  onExport,
  onProcessPayroll,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
      {/* Title & Icon Section */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-[#E6F7F5] border border-[#B2ECE4] text-[#0D9488] flex items-center justify-center shrink-0">
          <CreditCard className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight m-0 tracking-tight">
            Payroll / Salary
          </h1>
          <p className="text-xs text-slate-500 font-normal m-0 mt-0.5 leading-normal">
            Manage monthly payroll, salaries, deductions, employer cost and payslip records.
          </p>
        </div>
      </div>

      {/* Right Controls: Actions - strictly single line without wrapping */}
      <div className="flex items-center flex-nowrap shrink-0 gap-2.5 self-start md:self-auto overflow-x-auto max-w-full">
        {/* Refresh Icon Button */}
        <ReloadButton
          onClick={onRefresh}
          isRefreshing={isRefreshing}
          title="Refresh payroll data"
        />

        {/* Export Button */}
        <ExportButton onClick={onExport} />

        {/* Process Payroll Button */}
        <button
          type="button"
          onClick={onProcessPayroll}
          className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-[#4338CA] hover:bg-[#3730A3] active:bg-[#312E81] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Process Payroll</span>
        </button>
      </div>
    </div>
  );
};

