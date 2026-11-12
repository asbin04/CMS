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
      badgeBg: 'bg-[#F5F3FF]',
      badgeColor: 'text-[#7C3AED]',
    },
    {
      id: 'opportunities',
      label: 'Total Opportunities',
      value: data.totalOpportunities.toLocaleString('en-IN'),
      icon: Target,
      badgeBg: 'bg-[#E0F2FE]',
      badgeColor: 'text-[#0284C7]',
    },
    {
      id: 'proposals',
      label: 'Total Proposals (Value)',
      value: data.totalProposalsValue,
      icon: FileText,
      badgeBg: 'bg-[#FEF3C7]',
      badgeColor: 'text-[#D97706]',
    },
    {
      id: 'contracts',
      label: 'Active Contracts',
      value: data.activeContracts.toLocaleString('en-IN'),
      icon: ThumbsUp,
      badgeBg: 'bg-[#DCFCE7]',
      badgeColor: 'text-[#16A34A]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs flex items-center gap-4 transition-all hover:border-slate-300"
          >
            {/* Circle Badge Icon */}
            <div
              className={`w-12 h-12 rounded-full ${card.badgeBg} ${card.badgeColor} flex items-center justify-center shrink-0`}
            >
              <IconComponent className="w-5 h-5 stroke-[2]" />
            </div>

            {/* Label & Value */}
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-slate-500 truncate">
                {card.label}
              </span>
              <span className="block text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

