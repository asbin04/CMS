import React from 'react';
import { Clock, CheckCircle2, Briefcase, UserCheck } from 'lucide-react';
import { TimesheetKpis } from '../../types';

interface TimesheetsKpiCardsProps {
  kpis: TimesheetKpis;
}

export const TimesheetsKpiCards: React.FC<TimesheetsKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Hours */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#6366F1] shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Total Hours</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.totalHours}
          </span>
          <span className="block text-[11px] font-medium text-[#10B981] mt-1">
            {kpis.totalHoursTrend}
          </span>
        </div>
      </div>

      {/* Card 2: Billable Hours */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Billable Hours</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.billableHours}
          </span>
          <span className="block text-[11px] font-medium text-[#10B981] mt-1">
            {kpis.billableHoursTrend}
          </span>
        </div>
      </div>

      {/* Card 3: Billable Amount */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] shrink-0">
          <Briefcase className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Billable Amount</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.billableAmount}
          </span>
          <span className="block text-[11px] font-medium text-[#10B981] mt-1">
            {kpis.billableAmountTrend}
          </span>
        </div>
      </div>

      {/* Card 4: Pending Approvals */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shrink-0">
          <UserCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Pending Approvals</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.pendingApprovals}
          </span>
          <span className="block text-[11px] font-medium text-[#EF4444] mt-1">
            {kpis.pendingApprovalsTrend}
          </span>
        </div>
      </div>
    </div>
  );
};

