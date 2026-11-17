import React from 'react';
import { Users, CheckCircle, Clock, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { ExitKpiSummary } from '../../types';
import { Skeleton } from '../../../../components/ui/Skeleton';

interface EmployeeExitKpisProps {
  summary: ExitKpiSummary;
  isLoading?: boolean;
}

export const EmployeeExitKpis: React.FC<EmployeeExitKpisProps> = ({ summary, isLoading = false }) => {
  const cards = [
    {
      id: 'total-exit-requests',
      label: 'Total Exit Requests',
      value: summary.totalExitRequests,
      trend: summary.totalExitRequestsTrend,
      trendText: 'vs last month',
      icon: Users,
      iconBg: 'bg-[#EFF6FF]',
      iconBorder: 'border-[#BFDBFE]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'approved-exits',
      label: 'Approved Exits',
      value: summary.approvedExits,
      trend: summary.approvedExitsTrend,
      trendText: 'vs last month',
      icon: CheckCircle,
      iconBg: 'bg-[#ECFDF5]',
      iconBorder: 'border-[#A7F3D0]',
      iconColor: 'text-[#059669]',
    },
    {
      id: 'pending-approvals',
      label: 'Pending Approvals',
      value: summary.pendingApprovals,
      trend: summary.pendingApprovalsTrend,
      trendText: 'vs last month',
      icon: Clock,
      iconBg: 'bg-[#FFF7ED]',
      iconBorder: 'border-[#FED7AA]',
      iconColor: 'text-[#EA580C]',
    },
    {
      id: 'completed-exits',
      label: 'Completed Exits',
      value: summary.completedExits,
      trend: summary.completedExitsTrend,
      trendText: 'vs last month',
      icon: FileText,
      iconBg: 'bg-[#FAF5FF]',
      iconBorder: 'border-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;

        return (
          <div
            key={card.id}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3.5 shadow-soft hover:shadow-soft-hover hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 group cursor-default"
          >
            {/* Colored Icon Tile */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconBorder} ${card.iconColor}`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Metric Content */}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500 truncate">{card.label}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-0.5 tracking-tight group-hover:text-blue-600 transition-colors">
                {isLoading ? <Skeleton variant="text" width={45} height={24} className="rounded" /> : card.value}
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium mt-1">
                {isPositive ? (
                  <span className="text-[#059669] inline-flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                    <span>+{card.trend}%</span>
                  </span>
                ) : (
                  <span className="text-[#DC2626] inline-flex items-center gap-0.5">
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                    <span>{card.trend}%</span>
                  </span>
                )}
                <span className="text-slate-400 font-normal">{card.trendText}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

