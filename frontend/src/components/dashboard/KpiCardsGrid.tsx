import React from 'react';
import {
  Lock,
  FileText,
  DollarSign,
  TrendingUp,
  BarChart2,
  Briefcase,
  Users,
  Target,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardKpiCard } from '../../types/dashboard';

interface KpiCardsGridProps {
  cards: DashboardKpiCard[];
  onCardClick?: (card: DashboardKpiCard) => void;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white border border-[#F1F5F9] rounded-xl p-6 text-center text-[#94A3B8] text-xs w-full">
        No active metrics configured
      </div>
    );
  }

  const renderIcon = (cardKey: string, idx: number) => {
    switch (cardKey) {
      case 'revenue_invoice_value':
      case 'revenue':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0">
            <Lock size={16} className="text-[#059669] stroke-[1.67]" />
          </div>
        );
      case 'outstanding_receivables':
      case 'receivables':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#F0F9FF] flex items-center justify-center shrink-0">
            <FileText size={16} className="text-[#0284C7] stroke-[1.67]" />
          </div>
        );
      case 'collected_payments':
      case 'collected':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FAF5FF] flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-[#9333EA] stroke-[2.2]" />
          </div>
        );
      case 'total_expenses':
      case 'expenses':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <FileText size={16} className="text-[#EF4444] stroke-[1.67]" />
          </div>
        );
      case 'estimated_project_profit':
      case 'profit':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center shrink-0">
            <TrendingUp size={16} className="text-[#F59E0B] stroke-[1.67]" />
          </div>
        );
      case 'weighted_sales_pipeline':
      case 'pipeline':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <BarChart2 size={16} className="text-[#2563EB] stroke-[1.67]" />
          </div>
        );
      case 'active_projects':
      case 'projects':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Briefcase size={16} className="text-[#4F46E5] stroke-[1.67]" />
          </div>
        );
      case 'active_employees':
      case 'employees':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#0D9488] stroke-[1.67]" />
          </div>
        );
      case 'net_payroll':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] flex items-center justify-center shrink-0">
            <Target size={16} className="text-[#DB2777] stroke-[1.67]" />
          </div>
        );
      case 'employer_payroll_cost':
        return (
          <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <Layers size={16} className="text-[#2563EB] stroke-[1.67]" />
          </div>
        );
      default: {
        // Fallback index-based mapping
        const fallbacks = [
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0"><Lock size={16} className="text-[#059669] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#F0F9FF] flex items-center justify-center shrink-0"><FileText size={16} className="text-[#0284C7] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#FAF5FF] flex items-center justify-center shrink-0"><DollarSign size={16} className="text-[#9333EA] stroke-[2.2]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#FEF2F2] flex items-center justify-center shrink-0"><FileText size={16} className="text-[#EF4444] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#FFFBEB] flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-[#F59E0B] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0"><BarChart2 size={16} className="text-[#2563EB] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0"><Briefcase size={16} className="text-[#4F46E5] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#F0FDFA] flex items-center justify-center shrink-0"><Users size={16} className="text-[#0D9488] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#FDF2F8] flex items-center justify-center shrink-0"><Target size={16} className="text-[#DB2777] stroke-[1.67]" /></div>,
          <div key={idx} className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0"><Layers size={16} className="text-[#2563EB] stroke-[1.67]" /></div>,
        ];
        return fallbacks[idx % fallbacks.length];
      }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 w-full">
      {(cards || []).map((card: any, idx: number) => {
        const changePercent = card.change_percentage ?? card.changePercentage ?? 0;
        const isPositive = changePercent >= 0;
        const cardKey = card.card_key ?? card.cardKey ?? `kpi_${card.id || idx}`;

        // Per Figma CSS:
        // Metric 2 (Outstanding Receivables): +8% is red pill #FFF1F2 / #E11D48
        // Metric 4 (Total Expenses): +6% is red pill #FFF1F2 / #E11D48
        // Metric 9 (Net Payroll): -5% is red pill #FFF1F2 / #E11D48
        // Metric 10 (Employer Payroll Cost): +8% is red pill #FFF1F2 / #E11D48
        const isDanger =
          (card.change_type ?? card.changeType) === 'negative' ||
          cardKey === 'outstanding_receivables' ||
          cardKey === 'total_expenses' ||
          cardKey === 'net_payroll' ||
          cardKey === 'employer_payroll_cost';

        const pillBg = isDanger ? 'bg-[#FFF1F2] text-[#E11D48]' : 'bg-[#ECFDF5] text-[#059669]';
        const formattedVal = card.formatted_value ?? card.formattedValue ?? '0';
        const compText = card.comparison_text ?? card.comparisonText ?? 'vs last period';

        const rawTitle = card.title || '';
        const displayTitle =
          cardKey === 'revenue_invoice_value' || idx === 0
            ? rawTitle.replace('Revenue | Invoice Value', 'Revenue / Invoice Value') || 'Revenue / Invoice Value'
            : rawTitle;

        const formattedPercent = `${isPositive ? '+' : ''}${changePercent}%`;

        return (
          <div
            key={cardKey}
            className="bg-white border border-[#F1F5F9] rounded-[12px] p-4 flex flex-col justify-between h-[165px] transition-all duration-200 group cursor-default"
            style={{
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.02)',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Top: Icon */}
            <div className="flex items-center justify-between w-full">
              {renderIcon(cardKey, idx)}
            </div>

            {/* Middle: Title & Big Value */}
            <div className="flex flex-col gap-1 my-auto">
              <h4 className="text-[12px] font-medium text-[#64748B] leading-4 truncate">
                {displayTitle}
              </h4>
              <span className="text-[18px] font-bold text-[#0F172A] leading-7 tracking-tight">
                {formattedVal}
              </span>
            </div>

            {/* Bottom: Change Pill & Comparison Text */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-bold leading-4 ${pillBg}`}>
                {isPositive ? (
                  <ArrowUp size={11} className="stroke-[2.5]" />
                ) : (
                  <ArrowDown size={11} className="stroke-[2.5]" />
                )}
                {formattedPercent}
              </span>
              <span className="text-[11px] font-normal text-[#94A3B8] leading-4 truncate">
                {compText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
