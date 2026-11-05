import React from 'react';
import { CreditCard, FileText, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { FinancePaymentKpiData } from '../types/payments';

interface PaymentsKpiCardsProps {
  kpis?: FinancePaymentKpiData | null;
  isLoading?: boolean;
}

const formatIndianCurrency = (num?: number): string => {
  if (num === undefined || num === null || isNaN(num)) return '₹ 0';
  return (
    '₹ ' +
    num.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
    })
  );
};

export const PaymentsKpiCards: React.FC<PaymentsKpiCardsProps> = ({ kpis, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 mb-3" />
            <div className="h-4 w-24 bg-slate-100 rounded mb-2" />
            <div className="h-8 w-32 bg-slate-100 rounded mb-2" />
            <div className="h-4 w-28 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      id: 'total-payments',
      title: 'Total Payments',
      value: formatIndianCurrency(kpis?.totalPayments ?? 3210000),
      growth: kpis?.totalPaymentsGrowth ?? 18,
      trend: kpis?.totalPaymentsTrend ?? 'up',
      icon: CreditCard,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      id: 'pending-payments',
      title: 'Pending Payments',
      value: formatIndianCurrency(kpis?.pendingPayments ?? 680000),
      growth: kpis?.pendingPaymentsGrowth ?? 12,
      trend: kpis?.pendingPaymentsTrend ?? 'down',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      id: 'matched-payments',
      title: 'Matched Payments',
      value: formatIndianCurrency(kpis?.matchedPayments ?? 2850000),
      growth: kpis?.matchedPaymentsGrowth ?? 20,
      trend: kpis?.matchedPaymentsTrend ?? 'up',
      icon: CheckCircle2,
      iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
    },
    {
      id: 'payment-variance',
      title: 'Payment Variance',
      value: formatIndianCurrency(kpis?.paymentVariance ?? 40000),
      growth: kpis?.paymentVarianceGrowth ?? 8,
      trend: kpis?.paymentVarianceTrend ?? 'down',
      icon: AlertTriangle,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isUp = card.trend === 'up';

        return (
          <div
            key={card.id}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-500">{card.title}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{card.value}</div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
              {isUp ? (
                <>
                  <span className="text-emerald-600 flex items-center">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    {card.growth}%
                  </span>
                  <span className="text-slate-400 font-normal">vs last month</span>
                </>
              ) : (
                <>
                  <span className="text-rose-500 flex items-center">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    {card.growth}%
                  </span>
                  <span className="text-slate-400 font-normal">vs last month</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

