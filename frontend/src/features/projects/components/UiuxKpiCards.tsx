import React from 'react';
import { ShoppingBag, Edit3, CheckCircle2, RotateCcw, Clock } from 'lucide-react';
import { UiuxKpis } from '../types/uiux';

interface UiuxKpiCardsProps {
  kpis: UiuxKpis;
  isLoading?: boolean;
}

export const UiuxKpiCards: React.FC<UiuxKpiCardsProps> = ({ kpis }) => {
  const cards = [
    {
      id: 'total-designs',
      title: 'Total Designs',
      value: kpis.totalDesigns,
      trendRate: '↑ 18%',
      trendSuffix: 'vs last month',
      trendColor: '#059669',
      iconBg: '#EFF6FF',
      iconColor: '#4F46E5',
      icon: ShoppingBag,
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: kpis.inProgress,
      trendRate: '↑ 22%',
      trendSuffix: 'vs last month',
      trendColor: '#059669',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      icon: Edit3,
    },
    {
      id: 'approved',
      title: 'Approved',
      value: kpis.approved,
      trendRate: '↑ 16%',
      trendSuffix: 'vs last month',
      trendColor: '#059669',
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
      icon: CheckCircle2,
    },
    {
      id: 'change-requests',
      title: 'Change Requests',
      value: kpis.changeRequests,
      trendRate: '↑ 33%',
      trendSuffix: 'vs last month',
      trendColor: '#F43F5E',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      icon: RotateCcw,
    },
    {
      id: 'pending-approval',
      title: 'Pending Approval',
      value: kpis.pendingApproval,
      trendRate: '↑ 10%',
      trendSuffix: 'vs last month',
      trendColor: '#F43F5E',
      iconBg: '#EFF6FF',
      iconColor: '#4F46E5',
      icon: Clock,
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '0px',
        gap: '16px',
        width: '100%',
        height: '97px',
        alignSelf: 'stretch',
        boxSizing: 'border-box',
      }}
      className="overflow-x-auto"
    >
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '16px',
              width: '181.6px',
              minWidth: '175px',
              height: '97px',
              flex: '1 1 181.6px',
              background: '#FFFFFF',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '12px',
            }}
          >
            {/* Horizontal Row: Icon on left, Content column with same left alignment */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                padding: '0px',
                gap: '12px',
                width: '100%',
                height: '63px',
              }}
            >
              {/* Icon Container (36x36px, radius 8px) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '0px',
                  width: '36px',
                  height: '36px',
                  background: card.iconBg,
                  borderRadius: '8px',
                  flexShrink: 0,
                }}
              >
                <IconComponent size={20} color={card.iconColor} strokeWidth={1.66667} />
              </div>

              {/* Text Column: Title, Value, Trend (Same Left Alignment) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '0px',
                  height: '63px',
                  flexGrow: 1,
                  minWidth: 0,
                }}
              >
                {/* Title */}
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: '11px',
                    lineHeight: '16px',
                    color: '#64748B',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    height: '17px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {card.title}
                </div>

                {/* Big Number */}
                <div
                  style={{
                    fontFamily: 'Inter',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    fontSize: '24px',
                    lineHeight: '30px',
                    color: '#0F172A',
                    textAlign: 'left',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {card.value}
                </div>

                {/* Trend Row */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: '0px',
                    gap: '2px',
                    height: '17px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontStyle: 'normal',
                      fontWeight: 600,
                      fontSize: '11px',
                      lineHeight: '16px',
                      color: card.trendColor,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {card.trendRate}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: '11px',
                      lineHeight: '16px',
                      color: '#94A3B8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {card.trendSuffix}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
