import React from 'react';
import { ExpenseKpis } from '../types/expenses';

interface ExpenseKpiCardsProps {
  kpis: ExpenseKpis | null;
  isLoading: boolean;
}

export const ExpenseKpiCards: React.FC<ExpenseKpiCardsProps> = ({ kpis, isLoading }) => {
  const formatCurrency = (val: number | undefined) => {
    if (val === undefined || isNaN(val)) return '₹ 0';
    return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
  };

  const cards = [
    {
      id: 'total-expenses',
      title: 'Total Expenses',
      value: formatCurrency(kpis?.totalExpenses ?? 18760),
      trend: `↑ ${kpis?.totalExpensesTrend ?? 14}%`,
      trendColor: '#059669',
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
          <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
          <path d="M12 6v2m0 8v2" />
        </svg>
      ),
    },
    {
      id: 'approval-expenses',
      title: 'Approval Expenses',
      value: formatCurrency(kpis?.approvedExpenses ?? 15760),
      trend: `↑ ${kpis?.approvedExpensesTrend ?? 18}%`,
      trendColor: '#059669',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      id: 'pending-approval',
      title: 'Pending Approval',
      value: formatCurrency(kpis?.pendingApproval ?? 23760),
      trend: `↑ ${kpis?.pendingApprovalTrend ?? 6}%`,
      trendColor: '#D97706',
      iconBg: '#FFFBEB',
      iconColor: '#F59E0B',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: 'rejected-expenses',
      title: 'Rejected Expenses',
      value: formatCurrency(kpis?.rejectedExpenses ?? 37950),
      trend: `↑ ${kpis?.rejectedExpensesTrend ?? 28}%`,
      trendColor: '#059669',
      iconBg: '#FFF1F2',
      iconColor: '#F43F5E',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      id: 'this-month-expenses',
      title: 'This Month Expenses',
      value: formatCurrency(kpis?.thisMonthExpenses ?? 37950),
      trend: `↑ ${kpis?.thisMonthExpensesTrend ?? 12}%`,
      trendColor: '#059669',
      iconBg: '#EEF2FF',
      iconColor: '#4F46E5',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: '16px',
        width: '100%',
      }}
      className="overflow-x-auto pb-1"
    >
      {cards.map((card) => (
        <div
          key={card.id}
          style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '16px',
            gap: '12px',
            minWidth: '181.6px',
            flex: '1 1 0px',
            height: '100px',
            background: '#FFFFFF',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
          }}
        >
          {/* Left: Icon Container */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: card.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>

          {/* Right: Data Column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              minWidth: 0,
              flex: '1 1 auto',
            }}
          >
            {/* Title */}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontStyle: 'normal',
                fontWeight: 400,
                fontSize: '11px',
                lineHeight: '16px',
                color: '#64748B',
                whiteSpace: 'nowrap',
              }}
            >
              {card.title}
            </span>

            {/* Value */}
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontStyle: 'normal',
                fontWeight: 700,
                fontSize: '22px',
                lineHeight: '28px',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {isLoading ? '...' : card.value}
            </span>

            {/* Trend Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 600,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: card.trendColor,
                }}
              >
                {card.trend}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: '11px',
                  lineHeight: '16px',
                  color: '#94A3B8',
                }}
              >
                vs last month
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
