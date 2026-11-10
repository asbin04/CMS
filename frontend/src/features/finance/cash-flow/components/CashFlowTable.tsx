import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { CashFlowRecord } from '../types';
import { formatIndianCurrency } from '../mockData';
import { TableActionMenu } from '@/components/ui/TableActionMenu';

interface CashFlowTableProps {
  records: CashFlowRecord[];
  onIdClick?: (record: CashFlowRecord) => void;
  onViewDetails?: (record: CashFlowRecord) => void;
  onEdit?: (record: CashFlowRecord) => void;
  onDelete?: (record: CashFlowRecord) => void;
  onDeleteRecord?: (record: CashFlowRecord) => void;
}

export const CashFlowTable: React.FC<CashFlowTableProps> = ({
  records,
  onIdClick,
  onViewDetails,
  onEdit,
  onDelete,
  onDeleteRecord,
}) => {
  const handleDetails = (row: CashFlowRecord) => {
    if (onViewDetails) {
      onViewDetails(row);
    } else {
      onIdClick?.(row);
    }
  };

  const handleDelete = (row: CashFlowRecord) => {
    if (onDelete) {
      onDelete(row);
    } else {
      onDeleteRecord?.(row);
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-white border-b border-slate-200/80">
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              CASH FLOW ID
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              PERIOD
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              OPENING CASH
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              COLLECTIONS
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              OTHER INFLOWS
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              VENDOR PAYMENTS
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              PAYROLL PAYMENTS
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              OPERATING EXPENSES
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              OTHER OUTFLOWS
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              CLOSING CASH
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap">
              NOTES
            </th>
            <th className="py-3.5 px-4 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {records.length === 0 ? (
            <tr>
              <td colSpan={12} className="py-12 text-center text-xs text-slate-500">
                No cash flow records found matching your filters.
              </td>
            </tr>
          ) : (
            records.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/60 transition-colors border-b border-slate-100"
              >
                {/* 1. Cash Flow ID (Blue link) */}
                <td className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleDetails(row)}
                    className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-bold transition-colors cursor-pointer"
                  >
                    {row.cashFlowId}
                  </button>
                </td>

                {/* 2. Period */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                  {row.period}
                </td>

                {/* 3. Opening Cash */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                  {formatIndianCurrency(row.openingCash)}
                </td>

                {/* 4. Collections (Green) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#10B981] whitespace-nowrap">
                  {formatIndianCurrency(row.collections)}
                </td>

                {/* 5. Other Inflows (Green) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#10B981] whitespace-nowrap">
                  {formatIndianCurrency(row.otherInflows)}
                </td>

                {/* 6. Vendor Payments (Red) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#EF4444] whitespace-nowrap">
                  {formatIndianCurrency(row.vendorPayments)}
                </td>

                {/* 7. Payroll Payments (Red) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#EF4444] whitespace-nowrap">
                  {formatIndianCurrency(row.payrollPayments)}
                </td>

                {/* 8. Operating Expenses (Red) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#EF4444] whitespace-nowrap">
                  {formatIndianCurrency(row.operatingExpenses)}
                </td>

                {/* 9. Other Outflows (Red) */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#EF4444] whitespace-nowrap">
                  {formatIndianCurrency(row.otherOutflows)}
                </td>

                {/* 10. Closing Cash */}
                <td className="py-3.5 px-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                  {formatIndianCurrency(row.closingCash)}
                </td>

                {/* 11. Notes */}
                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap max-w-[180px] truncate">
                  {row.notes && row.notes.trim() ? row.notes : '—'}
                </td>

                {/* 12. Actions */}
                <td className="py-3.5 px-4 text-xs text-right whitespace-nowrap">
                  <TableActionMenu
                    items={[
                      {
                        key: 'view-details',
                        label: 'View Details',
                        icon: <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
                        onClick: () => handleDetails(row),
                      },
                      ...(onEdit
                        ? [
                            {
                              key: 'edit',
                              label: 'Edit Entry',
                              icon: <Edit className="w-3.5 h-3.5 text-slate-500 shrink-0" />,
                              onClick: () => onEdit(row),
                            },
                          ]
                        : []),
                      ...(onDelete || onDeleteRecord
                        ? [
                            {
                              key: 'delete',
                              label: 'Delete',
                              icon: <Trash2 className="w-3.5 h-3.5 text-red-500 shrink-0" />,
                              variant: 'danger' as const,
                              hasDividerAbove: true,
                              onClick: () => handleDelete(row),
                            },
                          ]
                        : []),
                    ]}
                    ariaLabel={`Actions for ${row.cashFlowId}`}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
