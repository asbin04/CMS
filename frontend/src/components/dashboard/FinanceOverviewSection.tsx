import React, { useState } from 'react';
import { Database, ChevronDown } from 'lucide-react';
import { FinanceMonthlyRecord, ExpenseBreakdownItem } from '../../types/dashboard';
import { UniversalBarChart } from '../charts/UniversalBarChart';
import { UniversalAreaLineChart } from '../charts/UniversalAreaLineChart';
import { UniversalDonutChart } from '../charts/UniversalDonutChart';

interface FinanceOverviewSectionProps {
  monthlyData: FinanceMonthlyRecord[];
  expenseBreakdown: ExpenseBreakdownItem[];
}

const DEFAULT_MONTHLY_DATA: FinanceMonthlyRecord[] = [
  { id: 1, month_name: 'Oct', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 1 },
  { id: 2, month_name: 'Nov', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 2 },
  { id: 3, month_name: 'Dec', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 3 },
  { id: 4, month_name: 'Jan', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 4 },
  { id: 5, month_name: 'Feb', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 5 },
  { id: 6, month_name: 'Mar', invoice_value: 0, collected_payments: 0, outstanding_receivables: 0, expenses: 0, sort_order: 6 }
];

const DEFAULT_EXPENSE_BREAKDOWN: ExpenseBreakdownItem[] = [
  { id: 1, category_name: 'Salaries', percentage: 0, amount: 0, color_hex: '#2563EB', sort_order: 1 },
  { id: 2, category_name: 'Operations', percentage: 0, amount: 0, color_hex: '#10B981', sort_order: 2 },
  { id: 3, category_name: 'Software & Tools', percentage: 0, amount: 0, color_hex: '#A855F7', sort_order: 3 },
  { id: 4, category_name: 'Travel & Admin', percentage: 0, amount: 0, color_hex: '#F97316', sort_order: 4 },
  { id: 5, category_name: 'Others', percentage: 0, amount: 0, color_hex: '#F43F5E', sort_order: 5 }
];

export const FinanceOverviewSection: React.FC<FinanceOverviewSectionProps> = ({
  monthlyData = [],
  expenseBreakdown = []
}) => {
  const [period, setPeriod] = useState('Last 6 Months');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const formatLakhs = (val: number) => {
    if (!val || val === 0) return '₹ 0.00';
    return `₹ ${(val / 100000).toFixed(1)}L`;
  };

  const safeMonthlyData = (monthlyData && monthlyData.length > 0) ? monthlyData : DEFAULT_MONTHLY_DATA;
  const safeExpenseBreakdown = (expenseBreakdown && expenseBreakdown.length > 0) ? expenseBreakdown : DEFAULT_EXPENSE_BREAKDOWN;

  const invoiceVsCollectionsData = safeMonthlyData.map((d: any) => ({
    label: d.month_name || d.monthName || '',
    invoice: d.invoice_value ?? d.invoiceValue ?? 0,
    collected: d.collected_payments ?? d.collectedPayments ?? 0
  }));

  const receivablesData = safeMonthlyData.map((d: any) => ({
    label: d.month_name || d.monthName || '',
    receivables: d.outstanding_receivables ?? d.outstandingReceivables ?? 0
  }));

  const expensesData = safeMonthlyData.map((d: any) => ({
    label: d.month_name || d.monthName || '',
    expense: d.expenses ?? 0
  }));

  const maxInvoiceVal = Math.max(...safeMonthlyData.map((d: any) => Math.max(d.invoice_value ?? d.invoiceValue ?? 0, d.collected_payments ?? d.collectedPayments ?? 0)), 0);
  const maxReceivablesVal = Math.max(...safeMonthlyData.map((d: any) => d.outstanding_receivables ?? d.outstandingReceivables ?? 0), 0);
  const maxExpenseVal = Math.max(...safeMonthlyData.map((d: any) => d.expenses ?? 0), 0);

  const totalExpenseVal = safeExpenseBreakdown.reduce((sum, item: any) => sum + (item.amount || 0), 0);
  const totalExpenseFormatted = totalExpenseVal > 0 ? `₹ ${(totalExpenseVal / 100000).toFixed(1)}L` : '₹ 0.00';

  return (
    <div
      className="bg-white border border-[#F1F5F9] rounded-[16px] p-6 flex flex-col transition-all duration-200"
      style={{
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.02)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center shrink-0">
            <Database size={16} className="text-[#059669] stroke-[1.5]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-[#1E293B] leading-5">
              Finance Overview
            </h3>
            <p className="text-[11.5px] font-normal text-[#94A3B8] leading-[17px]">
              Invoice value, collections, outstanding receivables, expenses, estimated project profit and payroll measures.
            </p>
          </div>
        </div>

        {/* Dropdown Filter */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 border border-[#E2E8F0] px-3 py-1 rounded-lg text-[12px] font-medium text-[#475569] bg-white hover:bg-slate-50 transition-colors h-[26px]"
          >
            <span>{period}</span>
            <ChevronDown size={12} className="text-[#94A3B8]" />
          </button>
          {showPeriodDropdown && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-[#E2E8F0] rounded-lg shadow-lg p-1 z-30 text-xs">
              {['Last 6 Months', 'Last Quarter', 'Full FY25'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setPeriod(opt);
                    setShowPeriodDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded hover:bg-slate-50 ${
                    period === opt ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-[#475569]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4 Columns in a Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-5 items-start">
        {/* Panel 1: Invoice Value vs Collections */}
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-[28px] justify-center">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Invoice Value vs Collections
            </h4>
          </div>
          <div className="flex items-center gap-3 h-[15px] mb-2">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#2563EB] inline-block" />
              <span className="text-[10px] font-normal text-[#64748B]">Invoice Value</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981] inline-block" />
              <span className="text-[10px] font-normal text-[#64748B]">Collected Payments</span>
            </div>
          </div>
          <UniversalBarChart
            data={invoiceVsCollectionsData}
            series={[
              { key: 'invoice', name: 'Invoice Value', color: '#3B82F6' },
              { key: 'collected', name: 'Collected Payments', color: '#10B981' }
            ]}
            height={176}
            showLegend={false}
            valueFormatter={formatLakhs}
            barWidth={7}
            yAxisWidth={28}
            ticks={[0, 1000000, 2000000, 3000000, 4000000]}
            domain={[0, Math.max(4000000, maxInvoiceVal)]}
          />
        </div>

        {/* Panel 2: Outstanding Receivables */}
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-[51px] justify-start pt-1">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Outstanding Receivables
            </h4>
          </div>
          <UniversalAreaLineChart
            data={receivablesData}
            series={[
              {
                key: 'receivables',
                name: 'Outstanding Receivables',
                strokeColor: '#EF4444',
                fillGradient: true,
                fillColorStart: 'rgba(239, 68, 68, 0.25)',
                fillColorEnd: 'rgba(239, 68, 68, 0)'
              }
            ]}
            height={176}
            strokeWidth={1.8}
            showDots={false}
            yAxisWidth={28}
            ticks={[0, 1000000, 2000000, 3000000, 4000000]}
            domain={[0, Math.max(4000000, maxReceivablesVal)]}
            valueFormatter={formatLakhs}
          />
        </div>

        {/* Panel 3: Expenses */}
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-[51px] justify-start pt-1">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Expenses
            </h4>
          </div>
          <UniversalBarChart
            data={expensesData}
            series={[{ key: 'expense', name: 'Expenses', color: '#F97316' }]}
            height={176}
            showLegend={false}
            valueFormatter={formatLakhs}
            barWidth={9}
            barRadius={[4, 4, 0, 0]}
            yAxisWidth={28}
            ticks={[0, 1000000, 2000000, 3000000, 4000000]}
            domain={[0, Math.max(4000000, maxExpenseVal)]}
          />
        </div>

        {/* Panel 4: Expense Breakdown (Donut) */}
        <div className="flex flex-col w-full">
          <div className="flex flex-col h-[51px] justify-start pt-1">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Expense Breakdown
            </h4>
          </div>
          <div className="flex items-center justify-between gap-2 h-[176px]">
            <UniversalDonutChart
              data={safeExpenseBreakdown.map((item: any) => ({
                label: item.category_name || item.categoryName || '',
                value: item.amount || 0,
                percentage: item.percentage || 0,
                color: item.color_hex || item.colorHex || '#2563EB'
              }))}
              centerPrimaryText={totalExpenseFormatted}
              centerSecondaryText="Total Expenses"
              size={128}
              showLegend={true}
              legendVariant="compact"
              valueFormatter={formatLakhs}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
