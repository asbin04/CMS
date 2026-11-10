import React from 'react';
import { FileText, PlayCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { UatKpis } from '../types/uat';

interface UatKpiCardsProps {
  kpis: UatKpis;
  isLoading?: boolean;
}

const parseTrend = (trendStr?: string, defaultRate = '↑ 14%', defaultSuffix = 'vs last month') => {
  if (!trendStr) return { rate: defaultRate, suffix: defaultSuffix };
  const parts = trendStr.split(' vs ');
  if (parts.length === 2) {
    return { rate: parts[0].trim(), suffix: 'vs ' + parts[1].trim() };
  }
  return { rate: trendStr, suffix: defaultSuffix };
};

export const UatKpiCards: React.FC<UatKpiCardsProps> = ({ kpis }) => {
  const totalTrend = parseTrend(kpis.totalUatsTrend || kpis.totalTrend, '↑ 14%', 'vs last month');
  const inTestingTrend = parseTrend(kpis.inTestingTrend, '↑ 18%', 'vs last month');
  const passedTrend = parseTrend(kpis.passedTrend, '↑ 20%', 'vs last month');
  const defectTrend = parseTrend(kpis.defectsLoggedTrend, '↑ 12%', 'vs last month');
  const clientApprovedTrend = parseTrend(kpis.clientApprovedTrend, '↑ 16%', 'vs last month');

  const cards = [
    {
      id: 'total-uats',
      title: 'Total UATs',
      value: kpis.totalUats,
      trendRate: totalTrend.rate,
      trendSuffix: totalTrend.suffix,
      trendColor: '#059669',
      iconBg: '#EFF6FF',
      iconColor: '#4F46E5',
      icon: FileText,
    },
    {
      id: 'in-testing',
      title: 'In Testing',
      value: kpis.inTesting,
      trendRate: inTestingTrend.rate,
      trendSuffix: inTestingTrend.suffix,
      trendColor: '#059669',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      icon: PlayCircle,
    },
    {
      id: 'passed',
      title: 'Passed',
      value: kpis.passed,
      trendRate: passedTrend.rate,
      trendSuffix: passedTrend.suffix,
      trendColor: '#059669',
      iconBg: '#FAF5FF',
      iconColor: '#9333EA',
      icon: CheckCircle2,
    },
    {
      id: 'defect-logged',
      title: 'Defect Logged',
      value: kpis.defectsLogged,
      trendRate: defectTrend.rate,
      trendSuffix: defectTrend.suffix,
      trendColor: '#E11D48',
      iconBg: '#FFF1F2',
      iconColor: '#F43F5E',
      icon: AlertTriangle,
    },
    {
      id: 'client-approved',
      title: 'Client Approved',
      value: kpis.clientApproved,
      trendRate: clientApprovedTrend.rate,
      trendSuffix: clientApprovedTrend.suffix,
      trendColor: '#059669',
      iconBg: '#F0FDFA',
      iconColor: '#0D9488',
      icon: ShieldCheck,
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
