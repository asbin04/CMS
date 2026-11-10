import React from 'react';
import { Code2, Package, FileCode2, ShieldCheck, Zap } from 'lucide-react';
import { DevelopmentKpis } from '../types';

interface DevelopmentKpiCardsProps {
  kpis: DevelopmentKpis;
}

export const DevelopmentKpiCards: React.FC<DevelopmentKpiCardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Developments',
      count: kpis.totalDevelopments,
      trend: kpis.totalTrend,
      icon: Code2,
      iconBg: 'bg-[#EEF2FF]',
      iconBorder: 'border-[#E0E7FF]',
      iconColor: 'text-[#4F46E5]',
    },
    {
      title: 'In Development',
      count: kpis.inDevelopment,
      trend: kpis.inDevTrend,
      icon: Package,
      iconBg: 'bg-[#ECFDF5]',
      iconBorder: 'border-[#A7F3D0]',
      iconColor: 'text-[#059669]',
    },
    {
      title: 'In Code Review',
      count: kpis.inCodeReview,
      trend: kpis.inReviewTrend,
      icon: FileCode2,
      iconBg: 'bg-[#F5F3FF]',
      iconBorder: 'border-[#DDD6FE]',
      iconColor: 'text-[#7C3AED]',
    },
    {
      title: 'QA Handover',
      count: kpis.qaHandover,
      trend: kpis.qaTrend,
      icon: ShieldCheck,
      iconBg: 'bg-[#F0FDFA]',
      iconBorder: 'border-[#99F6E4]',
      iconColor: 'text-[#0D9488]',
    },
    {
      title: 'Released',
      count: kpis.released,
      trend: kpis.releasedTrend,
      icon: Zap,
      iconBg: 'bg-[#FFFBEB]',
      iconBorder: 'border-[#FDE68A]',
      iconColor: 'text-[#D97706]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs flex items-center gap-3.5 transition-all duration-200 hover:shadow-xs"
          >
            {/* Left Icon */}
            <div
              className={`w-10 h-10 rounded-lg ${card.iconBg} border ${card.iconBorder} flex items-center justify-center shrink-0 ${card.iconColor}`}
            >
              <IconComponent className="w-5 h-5 stroke-[2]" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium text-slate-500 truncate mb-0.5">
                {card.title}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                  {card.count}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#10B981] mt-1 block">
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

