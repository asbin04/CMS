import React from 'react';
import { MonthlyTrendData } from '../../types';
import { formatIndianCurrency, MOCK_MONTHLY_TRENDS } from '../../mockData';
import { UniversalComposedChart } from '@/components/charts/UniversalComposedChart';

interface CashFlowTrendChartProps {
  data?: MonthlyTrendData[];
}

export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : MOCK_MONTHLY_TRENDS;

  const formattedData = chartData.map((d) => ({
    label: d.period,
    totalInflows: d.totalInflows,
    totalOutflows: d.totalOutflows,
    closingCash: d.closingCash,
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
        Cash Flow Trend
      </h3>

      <div className="my-auto">
        <UniversalComposedChart
          data={formattedData}
          barSeries={[
            {
              key: 'totalInflows',
              name: 'Total Inflows',
              color: '#6EE7B7',
              barWidth: 16,
              radius: [4, 4, 0, 0],
            },
            {
              key: 'totalOutflows',
              name: 'Total Outflows',
              color: '#FCA5A5',
              barWidth: 16,
              radius: [4, 4, 0, 0],
            },
          ]}
          lineSeries={[
            {
              key: 'closingCash',
              name: 'Closing Cash',
              color: '#6366F1',
              strokeWidth: 2.2,
            },
          ]}
          height={240}
          yAxisWidth={85}
          domain={[0, 4000000]}
          ticks={[0, 800000, 1600000, 2400000, 3200000, 4000000]}
          valueFormatter={(val) => (val === 0 ? '₹ 0' : formatIndianCurrency(val))}
          showLegend={true}
        />
      </div>
    </div>
  );
};
