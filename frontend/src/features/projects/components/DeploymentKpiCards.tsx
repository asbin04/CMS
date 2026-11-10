import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, Rocket, Users } from 'lucide-react';
import { DeploymentKpis } from '../types/deployment';

interface DeploymentKpiCardsProps {
  kpis: DeploymentKpis;
  isLoading?: boolean;
}

export const DeploymentKpiCards: React.FC<DeploymentKpiCardsProps> = ({ kpis, isLoading = false }) => {
  const cards = [
    {
      label: 'Total Deployments',
      value: kpis.totalDeployments,
      trend: kpis.totalDeploymentsChange || '↑ 14% vs last month',
      trendColor: '#10B981',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      icon: Layers,
    },
    {
      label: 'Successful Deployments',
      value: kpis.successfulDeployments,
      trend: kpis.successfulDeploymentsChange || '↑ 18% vs last month',
      trendColor: '#10B981',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      icon: CheckCircle2,
    },
    {
      label: 'Failed Deployments',
      value: kpis.failedDeployments,
      trend: kpis.failedDeploymentsChange || '↑ 25% vs last month',
      trendColor: '#D97706',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      icon: AlertTriangle,
    },
    {
      label: 'Go-Live Completed',
      value: kpis.goLiveCompleted,
      trend: kpis.goLiveCompletedChange || '↑ 20% vs last month',
      trendColor: '#10B981',
      iconBg: '#F0FDF4',
      iconColor: '#059669',
      icon: Rocket,
    },
    {
      label: 'Handover Pending',
      value: kpis.handoverPending,
      trend: kpis.handoverPendingChange || '↑ 33% vs last month',
      trendColor: '#E11D48',
      iconBg: '#FFF1F2',
      iconColor: '#E11D48',
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full font-['Inter']">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            style={{
              boxSizing: 'border-box',
              height: '104px',
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '12px',
              padding: '16px',
            }}
            className="flex flex-row items-center justify-between"
          >
            <div className="flex flex-col items-start justify-between h-full">
              <span className="font-medium text-[12px] leading-[16px] text-[#64748B]">
                {card.label}
              </span>
              <span className="font-bold text-[24px] leading-[30px] text-[#0F172A]">
                {isLoading ? '...' : card.value}
              </span>
              <span
                style={{ color: card.trendColor }}
                className="font-medium text-[11px] leading-[14px]"
              >
                {card.trend}
              </span>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                background: card.iconBg,
                borderRadius: '8px',
              }}
              className="flex items-center justify-center shrink-0 self-start"
            >
              <Icon style={{ color: card.iconColor }} className="w-5 h-5" strokeWidth={1.75} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

