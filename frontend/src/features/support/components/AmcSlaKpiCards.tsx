import React from 'react';
import { ClipboardList, ShieldCheck, Clock, AlertTriangle, Wallet } from 'lucide-react';
import { AmcSlaKpis } from '../types/amcSla';

interface AmcSlaKpiCardsProps {
  kpis: AmcSlaKpis;
  isLoading?: boolean;
}

export const AmcSlaKpiCards: React.FC<AmcSlaKpiCardsProps> = ({ kpis, isLoading = false }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Contracts',
      value: kpis.totalContracts,
      icon: ClipboardList,
      bg: 'bg-[#EEF2FF]',
      border: 'border-[#E0E7FF]',
      iconColor: 'text-[#4F46E5]',
    },
    {
      id: 'active',
      label: 'Active Contracts',
      value: kpis.activeContracts,
      icon: ShieldCheck,
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
      iconColor: 'text-[#059669]',
    },
    {
      id: 'expiring',
      label: 'Expiring (≤ 30 Days)',
      value: kpis.expiringContracts,
      icon: Clock,
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
      iconColor: 'text-[#D97706]',
    },
    {
      id: 'overdue',
      label: 'Renewal Overdue',
      value: kpis.renewalOverdueContracts,
      icon: AlertTriangle,
      bg: 'bg-[#FFF1F2]',
      border: 'border-[#FECDD3]',
      iconColor: 'text-[#E11D48]',
    },
    {
      id: 'value',
      label: 'Total Contract Value',
      value: kpis.formattedContractValue || (kpis.totalContractValue ? `₹ ${kpis.totalContractValue.toLocaleString('en-IN')}` : '₹ 2,48,500'),
      icon: Wallet,
      bg: 'bg-[#EFF6FF]',
      border: 'border-[#BFDBFE]',
      iconColor: 'text-[#2563EB]',
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full"
      data-testid="amc-kpi-cards"
    >
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="box-border flex flex-row items-center p-4 gap-3 bg-white border border-[rgba(226,232,240,0.8)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] h-[80px] w-full"
          >
            <div
              className={`box-border flex flex-row justify-center items-center w-[40px] h-[40px] ${card.bg} border ${card.border} rounded-[12px] shrink-0`}
            >
              <IconComponent className={`w-[20px] h-[20px] ${card.iconColor}`} strokeWidth={1.75} />
            </div>
            <div className="flex flex-col items-start justify-center overflow-hidden">
              <span className="font-['Inter'] font-medium text-[11px] leading-[15px] text-[#64748B] whitespace-nowrap truncate">
                {card.label}
              </span>
              <span className="font-['Inter'] font-bold text-[20px] leading-[26px] text-[#0F172A] tracking-[-0.5px] truncate">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
