import React from 'react';
import { Handshake, CheckCircle2, UserPlus, CreditCard } from 'lucide-react';
import { ClientsMetrics } from '../types/clients';

interface ClientsMetricCardsProps {
  metrics: ClientsMetrics;
  activeFilter?: string | null;
  onSelectFilter?: (filter: string | null) => void;
}

export const ClientsMetricCards: React.FC<ClientsMetricCardsProps> = ({
  metrics,
  activeFilter,
  onSelectFilter,
}) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Clients',
      value: (metrics?.totalClients ?? 0).toLocaleString(),
      trend: metrics?.totalClientsTrend || '↑ 12% vs last month',
      isPositive: true,
      icon: Handshake,
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'active',
      label: 'Active Clients',
      value: (metrics?.activeClients ?? 0).toLocaleString(),
      trend: metrics?.activeClientsTrend || '↑ 8% vs last month',
      isPositive: true,
      icon: CheckCircle2,
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      id: 'new',
      label: 'New Clients',
      value: (metrics?.newClients ?? 0).toLocaleString(),
      trend: metrics?.newClientsTrend || '↑ 20% vs last month',
      isPositive: true,
      icon: UserPlus,
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
    },
    {
      id: 'credit',
      label: 'Total Credit Limit',
      value: metrics?.totalCreditLimit || '₹ 0',
      trend: metrics?.totalCreditLimitTrend || '↑ 18% vs last month',
      isPositive: true,
      icon: CreditCard,
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        const isSelected = activeFilter === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(isSelected ? null : card.id)}
            className={`bg-white rounded-xl border p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
              isSelected
                ? 'border-indigo-600 ring-2 ring-indigo-100 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Left Icon Container: 44x44 */}
            <div
              className="w-11 h-11 min-w-[44px] min-h-[44px] max-w-[44px] max-h-[44px] rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                width: '44px',
                height: '44px',
                minWidth: '44px',
                minHeight: '44px',
                backgroundColor: card.iconBg,
                borderColor: card.iconColor + '20',
              }}
            >
              <IconComponent size={20} className="w-5 h-5" color={card.iconColor} strokeWidth={2.2} />
            </div>

            {/* Right Metric Details */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-medium text-slate-500 leading-tight truncate">
                {card.label}
              </span>
              <span className="text-[24px] sm:text-[26px] font-bold text-slate-900 leading-tight mt-1 tracking-tight">
                {card.value}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span
                  className={`text-[11.5px] font-semibold flex items-center gap-0.5 ${
                    card.isPositive ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {card.trend}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
