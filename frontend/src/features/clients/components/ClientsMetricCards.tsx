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
            style={{
              backgroundColor: '#FFFFFF',
              border: isSelected ? '1.5px solid #4F46E5' : '1px solid #E2E8F0',
              borderRadius: '12px',
              height: '118px',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '16px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSelected
                ? '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -2px rgba(79, 70, 229, 0.1)'
                : 'none',
            }}
            className="hover:shadow-sm hover:border-slate-300"
          >
            {/* Left Icon Container: 48x48 */}
            <div
              style={{
                width: '48px',
                height: '48px',
                minWidth: '48px',
                borderRadius: '12px',
                backgroundColor: card.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconComponent size={24} color={card.iconColor} strokeWidth={2} />
            </div>

            {/* Right Metric Details */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '2px',
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  lineHeight: '18px',
                  color: '#64748B',
                  whiteSpace: 'nowrap',
                }}
              >
                {card.label}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '24px',
                  fontWeight: 700,
                  lineHeight: '32px',
                  color: '#0F172A',
                  letterSpacing: '-0.6px',
                }}
              >
                {card.value}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '1px',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: '16px',
                    color: card.isPositive ? '#059669' : '#DC2626',
                    whiteSpace: 'nowrap',
                  }}
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
