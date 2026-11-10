import React from 'react';
import { ClipboardList, Clock, CheckCircle2, User, Lock } from 'lucide-react';
import { RequirementKpis } from '../../types';

interface RequirementsKpiCardsProps {
  kpis: RequirementKpis;
}

export const RequirementsKpiCards: React.FC<RequirementsKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Card 1: Total Requirements */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] border border-[#E0E7FF] flex items-center justify-center text-[#6366F1] shrink-0">
          <ClipboardList className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Total Requirements</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.totalRequirements.toLocaleString('en-IN')}
          </span>
          <span className="block text-[11px] font-medium text-[#10B981] mt-1">
            {kpis.totalRequirementsTrend}
          </span>
        </div>
      </div>

      {/* Card 2: In Progress */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">In Progress</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.inProgress.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Card 3: Completed */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#D1FAE5] flex items-center justify-center text-[#10B981] shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Completed</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.completed.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Card 4: Pending Approval */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] flex items-center justify-center text-[#F59E0B] shrink-0">
          <User className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Pending Approval</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.pendingApproval.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Card 5: Scope Frozen */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-xs">
        <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] shrink-0">
          <Lock className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <span className="block text-xs font-medium text-slate-500">Scope Frozen</span>
          <span className="block text-xl font-bold text-slate-900 leading-tight mt-0.5">
            {kpis.scopeFrozen.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
