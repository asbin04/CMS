import React from 'react';
import { Users, Target, FileText, ThumbsUp } from 'lucide-react';
import { SalesKpiData } from '../types';

interface SalesKpiCardsProps {
  data: SalesKpiData;
}

export const SalesKpiCards: React.FC<SalesKpiCardsProps> = ({ data }) => {
  const cards = [
    {
      id: 'leads',
      label: 'Total Leads',
      value: data.totalLeads.toLocaleString('en-IN'),
      icon: Users,
      badgeBg: 'bg-[rgba(237,233,254,0.7)]',
      iconColor: 'stroke-[#7C3AED]',
    },
    {
      id: 'opportunities',
      label: 'Total Opportunities',
      value: data.totalOpportunities.toLocaleString('en-IN'),
      icon: Target,
      badgeBg: 'bg-[rgba(224,242,254,0.7)]',
      iconColor: 'stroke-[#0284C7]',
    },
    {
      id: 'proposals',
      label: 'Total Proposals (Value)',
      value: data.formattedProposalsValue,
      icon: FileText,
      badgeBg: 'bg-[rgba(254,243,199,0.7)]',
      iconColor: 'stroke-[#D97706]',
    },
    {
      id: 'contracts',
      label: 'Active Contracts',
      value: data.activeContracts.toLocaleString('en-IN'),
      icon: ThumbsUp,
      badgeBg: 'bg-[rgba(209,250,229,0.7)]',
      iconColor: 'stroke-[#059669]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="box-border flex flex-row items-center p-4 bg-white border border-[#E2E8F0]/90 rounded-[12px] h-[84px] shadow-none"
          >
            {/* Overlay / Circle Icon */}
            <div
              className={`w-12 h-12 rounded-full ${card.badgeBg} flex items-center justify-center shrink-0`}
            >
              <IconComponent className={`w-6 h-6 ${card.iconColor} stroke-[2]`} />
            </div>

            {/* Label & Value */}
            <div className="ml-3.5 flex flex-col gap-0.5 min-w-0 flex-1">
              <span className="font-['Inter'] font-medium text-[12px] leading-4 text-[#64748B] truncate">
                {card.label}
              </span>
              <span className="font-['Inter'] font-bold text-[24px] leading-8 tracking-[-0.6px] text-[#0F172A] truncate">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
