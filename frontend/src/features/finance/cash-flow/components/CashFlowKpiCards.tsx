import React from 'react';
import { CreditCard, ArrowUp, ArrowDown, Archive } from 'lucide-react';
import { CashFlowKpis } from '../types';
import { formatIndianCurrency } from '../mockData';

interface CashFlowKpiCardsProps {
  kpis: CashFlowKpis;
}

export const CashFlowKpiCards: React.FC<CashFlowKpiCardsProps> = ({ kpis }) => {
  const cards = [
    {
      id: 'opening-cash',
      label: 'Opening Cash',
      value: formatIndianCurrency(kpis.openingCash),
      icon: CreditCard,
      iconClass: 'bg-[#F5F3FF] border border-[#DDD6FE] text-[#7C3AED]',
    },
    {
      id: 'total-inflows',
      label: 'Total Inflows',
      value: formatIndianCurrency(kpis.totalInflows),
      icon: ArrowUp,
      iconClass: 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#10B981]',
    },
    {
      id: 'total-outflows',
      label: 'Total Outflows',
      value: formatIndianCurrency(kpis.totalOutflows),
      icon: ArrowDown,
      iconClass: 'bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]',
    },
    {
      id: 'closing-cash',
      label: 'Closing Cash',
      value: formatIndianCurrency(kpis.closingCash),
      icon: Archive,
      iconClass: 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#3B82F6]',
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

