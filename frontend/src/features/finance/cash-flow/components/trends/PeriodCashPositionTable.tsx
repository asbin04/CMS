import React from 'react';
import { PeriodPositionData } from '../../types';
import { formatIndianCurrency, MOCK_PERIOD_POSITIONS } from '../../mockData';

interface PeriodCashPositionTableProps {
  data?: PeriodPositionData[];
  positions?: PeriodPositionData[];
}

export const PeriodCashPositionTable: React.FC<PeriodCashPositionTableProps> = ({
  data,
  positions,
}) => {
  const rows = (data && data.length > 0 ? data : positions) || MOCK_PERIOD_POSITIONS;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-3">
          Period-wise Cash Position
        </h3>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Inflows</th>
                <th className="py-2.5 px-3">Outflows</th>
                <th className="py-2.5 px-3">Net Cash Flow</th>
                <th className="py-2.5 px-3">Closing Cash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.period} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 text-xs font-semibold text-slate-800">
                    {row.period}
                  </td>
                  <td className="py-3 px-3 text-xs font-semibold text-[#16A34A]">
                    {formatIndianCurrency(row.inflows)}
                  </td>
                  <td className="py-3 px-3 text-xs font-semibold text-[#DC2626]">
                    {formatIndianCurrency(row.outflows)}
                  </td>
                  <td className="py-3 px-3 text-xs font-semibold text-[#16A34A]">
                    {formatIndianCurrency(row.netCashFlow)}
                  </td>
                  <td className="py-3 px-3 text-xs font-bold text-slate-900">
                    {formatIndianCurrency(row.closingCash)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
