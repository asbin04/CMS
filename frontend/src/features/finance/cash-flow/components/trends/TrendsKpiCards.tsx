import React from 'react';
import { ArrowUp, ArrowDown, Wallet, BarChart2 } from 'lucide-react';
import { TrendsKpis } from '../../types';
import { formatIndianCurrency, MOCK_TRENDS_KPIS } from '../../mockData';

interface TrendsKpiCardsProps {
  kpis?: TrendsKpis;
}

export const TrendsKpiCards: React.FC<TrendsKpiCardsProps> = ({ kpis = MOCK_TRENDS_KPIS }) => {
  const safeKpis = kpis || MOCK_TRENDS_KPIS;

  const cards = [
    {
      id: 'avg-inflow',
      label: 'Avg. Monthly Inflow',
      value: formatIndianCurrency(safeKpis.avgMonthlyInflow),
      icon: ArrowUp,
      iconClass: 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981]',
    },
    {
      id: 'avg-outflow',
      label: 'Avg. Monthly Outflow',
      value: formatIndianCurrency(safeKpis.avgMonthlyOutflow),
      icon: ArrowDown,
      iconClass: 'bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]',
    },
    {
      id: 'net-cash-flow',
      label: 'Net Cash Flow',
      value: formatIndianCurrency(safeKpis.netCashFlow),
      icon: Wallet,
      iconClass: 'bg-[#EEF2FF] border border-[#E0E7FF] text-[#4F46E5]',
    },
    {
      id: 'closing-cash-latest',
      label: 'Closing Cash (Latest)',
      value: formatIndianCurrency(safeKpis.closingCashLatest),
      icon: BarChart2,
      iconClass: 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#2563EB]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.iconClass}`}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 m-0">{card.label}</p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight m-0 mt-0.5">
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
