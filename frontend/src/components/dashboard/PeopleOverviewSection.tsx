import React, { useState } from 'react';
import { Users, ChevronDown, UserPlus, UserMinus, TrendingUp, FileText } from 'lucide-react';
import { PeopleMonthlyRecord, PeopleSummary } from '../../types/dashboard';
import { UniversalBarChart } from '../charts/UniversalBarChart';
import { UniversalAreaLineChart } from '../charts/UniversalAreaLineChart';

interface PeopleOverviewSectionProps {
  monthlyData: PeopleMonthlyRecord[];
  summary: PeopleSummary;
}

const DEFAULT_PEOPLE_MONTHLY: PeopleMonthlyRecord[] = [
  { id: 1, month_name: 'Oct', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 1 },
  { id: 2, month_name: 'Nov', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 2 },
  { id: 3, month_name: 'Dec', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 3 },
  { id: 4, month_name: 'Jan', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 4 },
  { id: 5, month_name: 'Feb', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 5 },
  { id: 6, month_name: 'Mar', employee_count: 0, net_payroll: 0, employer_payroll_cost: 0, sort_order: 6 }
];

const DEFAULT_PEOPLE_SUMMARY: PeopleSummary = {
  id: 1,
  active_employees: 0,
  new_joiners_ytd: 0,
  exits_ytd: 0,
  net_growth: 0
};

export const PeopleOverviewSection: React.FC<PeopleOverviewSectionProps> = ({
  monthlyData = [],
  summary
}) => {
  const [period, setPeriod] = useState('Last 6 Months');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const safeMonthlyData = (monthlyData && monthlyData.length > 0) ? monthlyData : DEFAULT_PEOPLE_MONTHLY;
  const safeSummary = summary || DEFAULT_PEOPLE_SUMMARY;

  const employeeCountData = safeMonthlyData.map((d: any) => ({
    label: d.month_name || d.monthName || '',
    count: d.employee_count ?? d.employeeCount ?? 0
  }));

  const payrollTrendData = safeMonthlyData.map((d: any) => ({
    label: d.month_name || d.monthName || '',
    netPayroll: Number(d.net_payroll ?? d.netPayroll ?? 0),
    payrollCost: Number(d.employer_payroll_cost ?? d.employerPayrollCost ?? 0)
  }));

  const maxEmployeeCount = Math.max(...employeeCountData.map((d) => d.count), 0);
  const employeeDomain: [number, number] = [0, Math.max(60, maxEmployeeCount)];
  const employeeTicks = maxEmployeeCount <= 60 ? [0, 20, 40, 60] : undefined;

  const maxPayrollVal = Math.max(...payrollTrendData.map((d) => Math.max(d.netPayroll, d.payrollCost)), 0);
  const payrollDomain: [number, number] = [0, Math.max(3000000, maxPayrollVal)];
  const payrollTicks = maxPayrollVal <= 3000000 ? [0, 1000000, 2000000, 3000000] : undefined;

  const formatLakhs = (val: number) => {
    if (!val || val === 0) return '0';
    return `${Math.round(val / 100000)}L`;
  };

  const netGrowth = safeSummary.net_growth ?? ((safeSummary.new_joiners_ytd ?? 0) - (safeSummary.exits_ytd ?? 0));
  const formattedNetGrowth = netGrowth > 0 ? `+${netGrowth}` : `${netGrowth ?? 0}`;
  const netGrowthColor = netGrowth >= 0 ? 'text-[#059669]' : 'text-[#EF4444]';

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
          <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] flex items-center justify-center shrink-0">
            <Users size={16} className="text-[#4F46E5] stroke-[1.33]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-[#1E293B] leading-5">
              People Overview
            </h3>
            <p className="text-[11.5px] font-normal text-[#94A3B8] leading-[17px]">
              Active employee count, net payroll and employer payroll cost.
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

      {/* 3 Columns: Employee Count, Payroll Trend, Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-start">
        {/* Column 1: Subchart 1 Employee Count Trend */}
        <div className="flex flex-col w-full h-[215px]">
          <div className="flex items-center h-[32px] mb-0 pb-4">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Employee Count Trend
            </h4>
          </div>
          <UniversalBarChart
            data={employeeCountData}
            series={[{ key: 'count', name: 'Employees', color: '#38BDF8' }]}
            height={176}
            valueFormatter={(v) => `${v}`}
            barWidth={14}
            barRadius={[4, 4, 0, 0]}
            yAxisWidth={28}
            ticks={employeeTicks}
            domain={employeeDomain}
          />
        </div>

        {/* Column 2: Subchart 2 Payroll Trend (₹) */}
        <div className="flex flex-col w-full h-[215px]">
          <div className="flex items-center justify-between h-[32px] mb-0 pb-4">
            <h4 className="text-[12px] font-bold text-[#334155] leading-4">
              Payroll Trend (₹)
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] inline-block" />
                <span className="text-[10px] text-[#64748B]">Net Payroll</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] inline-block" />
                <span className="text-[10px] text-[#64748B]">Employer Payroll Cost</span>
              </div>
            </div>
          </div>
          <UniversalAreaLineChart
            data={payrollTrendData}
            series={[
              {
                key: 'netPayroll',
                name: 'Net Payroll',
                strokeColor: '#0284C7',
                fillGradient: true,
                fillColorStart: 'rgba(224, 242, 254, 0.6)',
                fillColorEnd: 'rgba(224, 242, 254, 0.1)'
              },
              {
                key: 'payrollCost',
                name: 'Employer Payroll Cost',
                strokeColor: '#7C3AED',
                fillGradient: true,
                fillColorStart: 'rgba(239, 230, 255, 0.6)',
                fillColorEnd: 'rgba(239, 230, 255, 0.1)'
              }
            ]}
            height={176}
            strokeWidth={2.175}
            showDots={true}
            showLegend={false}
            yAxisWidth={28}
            ticks={payrollTicks}
            domain={payrollDomain}
            valueFormatter={formatLakhs}
          />
        </div>

        {/* Column 3: Subcard 3 Employee Summary */}
        <div
          className="flex flex-col justify-between p-4 rounded-xl border border-[#F1F5F9] h-[215px] w-full"
          style={{ background: 'rgba(248, 250, 252, 0.7)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 h-[28px]">
            <FileText size={16} className="text-[#64748B] stroke-[1.5]" />
            <h4 className="text-[12px] font-bold text-[#1E293B] leading-4">
              Employee Summary
            </h4>
          </div>

          {/* 4 Rows */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/50">
              <div className="flex items-center gap-2 text-[#475569]">
                <Users size={16} className="text-[#94A3B8] stroke-[1.5]" />
                <span className="text-[12px] font-normal">Active Employees</span>
              </div>
              <span className="text-[14px] font-bold text-[#0F172A]">
                {safeSummary.active_employees}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/50">
              <div className="flex items-center gap-2 text-[#475569]">
                <UserPlus size={16} className="text-[#10B981] stroke-[1.5]" />
                <span className="text-[12px] font-normal">New Joinees (YTD)</span>
              </div>
              <span className="text-[14px] font-bold text-[#0F172A]">
                {safeSummary.new_joiners_ytd}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]/50">
              <div className="flex items-center gap-2 text-[#475569]">
                <UserMinus size={16} className="text-[#F43F5E] stroke-[1.5]" />
                <span className="text-[12px] font-normal">Exits (YTD)</span>
              </div>
              <span className="text-[14px] font-bold text-[#0F172A]">
                {safeSummary.exits_ytd}
              </span>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2 text-[#334155]">
                <TrendingUp size={16} className="text-[#14B8A6] stroke-[1.5]" />
                <span className="text-[12px] font-medium">Net Growth</span>
              </div>
              <span className={`text-[14px] font-bold ${netGrowthColor}`}>
                {formattedNetGrowth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
