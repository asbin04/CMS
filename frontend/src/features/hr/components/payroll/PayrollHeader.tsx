import React from 'react';
import { CreditCard, RotateCw, Download, Plus } from 'lucide-react';

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
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh payroll data"
          className="w-9 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 active:bg-slate-100 text-[#64748B] flex items-center justify-center transition-all cursor-pointer shadow-2xs disabled:opacity-60"
        >
          <RotateCw className={`w-4 h-4 text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>

        {/* Export Button */}
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-[#E2E8F0] bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

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

