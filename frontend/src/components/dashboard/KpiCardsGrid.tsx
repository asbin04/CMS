import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Users,
  Target,
  Clock,
  PieChart,
  Layers,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DashboardKpiCard } from '../../types/dashboard';
import kpiRevenueIcon from '../../assets/icons/kpi/kpi-revenue.png';
import kpiReceivablesIcon from '../../assets/icons/kpi/kpi-receivables.png';
import kpiCollectedIcon from '../../assets/icons/kpi/kpi-collected.png';
import kpiExpensesIcon from '../../assets/icons/kpi/kpi-expenses.png';
import kpiProfitIcon from '../../assets/icons/kpi/kpi-profit.png';
import kpiPipelineIcon from '../../assets/icons/kpi/kpi-pipeline.png';
import kpiProjectsIcon from '../../assets/icons/kpi/kpi-projects.png';
import kpiEmployeesIcon from '../../assets/icons/kpi/kpi-employees.png';
import kpiNetPayrollIcon from '../../assets/icons/kpi/kpi-net-payroll.png';
import kpiEmployerPayrollIcon from '../../assets/icons/kpi/kpi-employer-payroll.png';

interface KpiCardsGridProps {
  cards: DashboardKpiCard[];
  onCardClick?: (card: DashboardKpiCard) => void;
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ cards }) => {
  if (!cards || cards.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs w-full">
        No active metrics configured
      </div>
    );
  }

  const renderIcon = (type: string, color: string, cardKey: string, idx: number) => {
    // 1st Card: Revenue / Invoice Value
    if (cardKey === 'revenue_invoice_value' || idx === 0 || type === 'kpi-revenue' || type === 'revenue') {
      return (
        <img
          src={kpiRevenueIcon}
          alt="Revenue / Invoice Value"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 2nd Card: Outstanding Receivables
    if (cardKey === 'outstanding_receivables' || idx === 1 || type === 'kpi-receivables' || type === 'receivables') {
      return (
        <img
          src={kpiReceivablesIcon}
          alt="Outstanding Receivables"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 3rd Card: Collected Payments
    if (cardKey === 'collected_payments' || idx === 2 || type === 'kpi-collected' || type === 'collected') {
      return (
        <img
          src={kpiCollectedIcon}
          alt="Collected Payments"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 4th Card: Total Expenses
    if (cardKey === 'total_expenses' || idx === 3 || type === 'kpi-expenses' || type === 'expenses') {
      return (
        <img
          src={kpiExpensesIcon}
          alt="Total Expenses"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 5th Card: Estimated Project Profit
    if (cardKey === 'estimated_project_profit' || idx === 4 || type === 'kpi-profit' || type === 'profit') {
      return (
        <img
          src={kpiProfitIcon}
          alt="Estimated Project Profit"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 6th Card: Weighted Sales Pipeline
    if (cardKey === 'weighted_sales_pipeline' || idx === 5 || type === 'kpi-pipeline' || type === 'pipeline') {
      return (
        <img
          src={kpiPipelineIcon}
          alt="Weighted Sales Pipeline"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 7th Card: Active Projects
    if (cardKey === 'active_projects' || idx === 6 || type === 'kpi-projects' || type === 'projects') {
      return (
        <img
          src={kpiProjectsIcon}
          alt="Active Projects"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 8th Card: Active Employees
    if (cardKey === 'active_employees' || idx === 7 || type === 'kpi-employees' || type === 'employees') {
      return (
        <img
          src={kpiEmployeesIcon}
          alt="Active Employees"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 9th Card: Net Payroll
    if (cardKey === 'net_payroll' || idx === 8 || type === 'kpi-net-payroll' || type === 'net_payroll') {
      return (
        <img
          src={kpiNetPayrollIcon}
          alt="Net Payroll"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    // 10th Card: Employer Payroll Cost
    if (cardKey === 'employer_payroll_cost' || idx === 9 || type === 'kpi-employer-payroll' || type === 'employer_payroll_cost') {
      return (
        <img
          src={kpiEmployerPayrollIcon}
          alt="Employer Payroll Cost"
          className="w-10 h-10 rounded-xl shrink-0 mb-3 object-contain"
        />
      );
    }

    const iconProps = { className: 'w-4 h-4' };
    let iconComp = <Activity {...iconProps} />;

    switch (type) {
      case 'DollarSign':
        iconComp = <DollarSign {...iconProps} />;
        break;
      case 'Briefcase':
        iconComp = <Briefcase {...iconProps} />;
        break;
      case 'Users':
        iconComp = <Users {...iconProps} />;
        break;
      case 'Target':
        iconComp = <Target {...iconProps} />;
        break;
      case 'Clock':
        iconComp = <Clock {...iconProps} />;
        break;
      case 'PieChart':
        iconComp = <PieChart {...iconProps} />;
        break;
      case 'Layers':
        iconComp = <Layers {...iconProps} />;
        break;
      case 'TrendingUp':
        iconComp = <TrendingUp {...iconProps} />;
        break;
      default:
        iconComp = <Activity {...iconProps} />;
    }

    const themeMap: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600' },
      emerald: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600' },
      violet: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
      amber: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' },
      rose: { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600' },
      indigo: { bg: 'bg-indigo-50 border-indigo-100', text: 'text-indigo-600' },
      sky: { bg: 'bg-sky-50 border-sky-100', text: 'text-sky-600' }
    };

    const { bg, text } = themeMap[color] || { bg: 'bg-slate-50 border-slate-100', text: 'text-slate-600' };

    return (
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mb-3 ${bg} ${text}`}>
        {iconComp}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 w-full">
      {(cards || []).map((card: any, idx: number) => {
        const changePercent = card.change_percentage ?? card.changePercentage ?? 0;
        const isPositive = changePercent >= 0;
        const cardKey = card.card_key ?? card.cardKey ?? `kpi_${card.id || idx}`;

        // Receivables, expenses, and payroll cost indicators
        const isDanger =
          (card.change_type ?? card.changeType) === 'negative' ||
          cardKey === 'outstanding_receivables' ||
          cardKey === 'total_expenses' ||
          cardKey === 'net_payroll' ||
          cardKey === 'employer_payroll_cost';

        // Pills: green for positive business metric, red for negative
        const pillBg = isDanger ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600';
        const formattedVal = card.formatted_value ?? card.formattedValue ?? '0';
        const compText = card.comparison_text ?? card.comparisonText ?? 'vs last period';

        // Match Title format in designer reference ("Revenue / Invoice Value")
        const rawTitle = card.title || '';
        const displayTitle =
          cardKey === 'revenue_invoice_value' || idx === 0
            ? rawTitle.replace('Revenue | Invoice Value', 'Revenue / Invoice Value') || 'Revenue / Invoice Value'
            : rawTitle;

        const formattedPercent = `+${Math.abs(changePercent)}%`;

        return (
          <div
            key={cardKey}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-4.5 flex flex-col justify-between shadow-soft hover:border-slate-300 transition-all duration-200 group cursor-default"
          >
            <div>
              {/* Colored Icon Tile */}
              {renderIcon(
                card.icon_type ?? card.iconType,
                card.color_theme ?? card.colorTheme,
                cardKey,
                idx
              )}

              {/* Metric Label */}
              <h4 className="text-[12.5px] sm:text-[13px] font-medium text-slate-500 leading-tight min-h-[26px] flex items-center">
                {displayTitle}
              </h4>

              {/* Big Metric Value */}
              <div className="mt-1.5 mb-2.5">
                <span className="text-[20px] sm:text-[22px] font-bold text-slate-900 tracking-tight leading-none">
                  {formattedVal}
                </span>
              </div>
            </div>

            {/* Bottom Change Pill */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pillBg}`}>
                {isPositive ? (
                  <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                ) : (
                  <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                )}
                {formattedPercent}
              </span>
              <span className="text-[10px] font-medium text-slate-400 truncate">
                {compText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
