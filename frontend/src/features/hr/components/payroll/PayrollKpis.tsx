import React from 'react';
import { Users, IndianRupee, FileText, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { PayrollKpiData } from '../../types/payroll';

interface PayrollKpisProps {
  kpiData: PayrollKpiData | null;
  isLoading?: boolean;
}

export const PayrollKpis: React.FC<PayrollKpisProps> = ({ kpiData, isLoading = false }) => {
  if (isLoading || !kpiData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={`kpi-skeleton-${idx}`}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs animate-pulse"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-100 shrink-0" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total-employees',
      label: 'Total Employees',
      value: kpiData.totalEmployees.toLocaleString('en-IN'),
      trend: kpiData.totalEmployeesTrend,
      isPositive: kpiData.totalEmployeesTrendPositive,
      icon: Users,
      iconBg: 'bg-[#EFF6FF]',
      iconBorder: 'border-[#BFDBFE]',
      iconColor: 'text-[#2563EB]',
    },
    {
      id: 'total-payroll-cost',
      label: 'Total Payroll Cost (CTC)',
      value: kpiData.formattedTotalPayrollCost || `₹ ${kpiData.totalPayrollCost.toLocaleString('en-IN')}`,
      trend: kpiData.totalPayrollCostTrend,
      isPositive: kpiData.totalPayrollCostTrendPositive,
      icon: IndianRupee,
      iconBg: 'bg-[#F0FDF4]',
      iconBorder: 'border-[#BBF7D0]',
      iconColor: 'text-[#16A34A]',
    },
    {
      id: 'net-pay-disbursed',
      label: 'Net Pay Disbursed',
      value: kpiData.formattedNetPayDisbursed || `₹ ${kpiData.netPayDisbursed.toLocaleString('en-IN')}`,
      trend: kpiData.netPayDisbursedTrend,
      isPositive: kpiData.netPayDisbursedTrendPositive,
      icon: FileText,
      iconBg: 'bg-[#FAF5FF]',
      iconBorder: 'border-[#F3E8FF]',
      iconColor: 'text-[#9333EA]',
    },
    {
      id: 'pending-payrolls',
      label: 'Pending Payrolls',
      value: kpiData.pendingPayrolls.toLocaleString('en-IN'),
      trend: kpiData.pendingPayrollsTrend,
      isPositive: kpiData.pendingPayrollsTrendPositive,
      icon: Clock,
      iconBg: 'bg-[#EEF2FF]',
      iconBorder: 'border-[#C7D2FE]',
      iconColor: 'text-[#4F46E5]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.id}
            className="bg-white border border-[#E2E8F0] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-soft hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-200 group cursor-default"
          >
            {/* Colored Icon Tile */}
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${card.iconBg} ${card.iconBorder} ${card.iconColor}`}
            >
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            {/* Metric Content */}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-slate-500 truncate">{card.label}</div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-0.5 tracking-tight group-hover:text-indigo-600 transition-colors">
                {card.value}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {card.isPositive ? (
                  <ArrowUp className="w-3.5 h-3.5 text-[#16A34A] stroke-[2.5]" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-[#DC2626] stroke-[2.5]" />
                )}
                <span
                  className={`text-xs font-medium leading-none ${
                    card.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
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
