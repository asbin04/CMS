import React from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { ExitRecord } from '../../types';

interface HrExitTableProps {
  exitRecords: ExitRecord[];
  onViewDetails: (record: ExitRecord) => void;
  onEdit: (record: ExitRecord) => void;
}

const getExitStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
    case 'Notice Period':
      return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    case 'In Progress':
      return 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]';
    case 'Pending Clearance':
      return 'bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const HrExitTable: React.FC<HrExitTableProps> = ({
  exitRecords,
  onViewDetails,
  onEdit,
}) => {
  return (
    <div
      className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="border-y border-slate-100 bg-[#FAFCFF] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">
              EMPLOYEE ID
            </th>
            <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">
              EMPLOYEE NAME
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              DEPARTMENT
            </th>
            <th className="py-3 px-4 min-w-[160px] whitespace-nowrap">
              DESIGNATION
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              EXIT TYPE
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              RESIGNATION DATE
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              LAST WORKING DAY
            </th>
            <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">
              EXIT REASON
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              STATUS
            </th>
            <th className="py-3 px-4 min-w-[90px] whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {exitRecords.length === 0 ? (
            <tr>
              <td colSpan={10} className="py-12 text-center text-xs text-slate-400">
                No exit records found matching the specified filters.
              </td>
            </tr>
          ) : (
            exitRecords.map((exit) => (
              <tr
                key={exit.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. Employee ID */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(exit)}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {exit.employeeId}
                  </button>
                </td>

                {/* 2. Employee Name */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {exit.employeeName}
                </td>

                {/* 3. Department */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {exit.department}
                </td>

                {/* 4. Designation */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {exit.designation}
                </td>

                {/* 5. Exit Type */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                  {exit.exitType}
                </td>

                {/* 6. Resignation Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {exit.resignationDate}
                </td>

                {/* 7. Last Working Day */}
                <td className="py-3.5 px-4 text-xs font-semibold text-rose-600 whitespace-nowrap">
                  {exit.lastWorkingDay}
                </td>

                {/* 8. Exit Reason */}
                <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[200px] truncate">
                  {exit.reason}
                </td>

                {/* 9. Status */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getExitStatusBadgeClass(
                      exit.status
                    )}`}
                  >
                    {exit.status}
                  </span>
                </td>

                {/* 10. Actions */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewDetails(exit)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                      title="View Exit Details"
                      aria-label={`View exit details for ${exit.employeeName}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEdit(exit)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit Exit Record"
                      aria-label={`Edit exit record for ${exit.employeeName}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

