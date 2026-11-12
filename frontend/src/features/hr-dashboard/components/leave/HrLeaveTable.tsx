import React from 'react';
import { Eye, Check, Ban } from 'lucide-react';
import { LeaveRecord } from '../../types';

interface HrLeaveTableProps {
  leaveRecords: LeaveRecord[];
  onViewDetails: (record: LeaveRecord) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const getLeaveStatusBadge = (status: string) => {
  switch (status) {
    case 'Approved':
      return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
    case 'Pending':
      return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    case 'Rejected':
      return 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const HrLeaveTable: React.FC<HrLeaveTableProps> = ({
  leaveRecords,
  onViewDetails,
  onApprove,
  onReject,
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
              REQUEST ID
            </th>
            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">
              EMPLOYEE ID
            </th>
            <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">
              NAME
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              DEPARTMENT
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              LEAVE TYPE
            </th>
            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">
              FROM DATE
            </th>
            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">
              TO DATE
            </th>
            <th className="py-3 px-4 min-w-[80px] whitespace-nowrap">
              DAYS
            </th>
            <th className="py-3 px-4 min-w-[110px] whitespace-nowrap">
              APPLIED ON
            </th>
            <th className="py-3 px-4 min-w-[120px] whitespace-nowrap">
              STATUS
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {leaveRecords.length === 0 ? (
            <tr>
              <td colSpan={11} className="py-12 text-center text-xs text-slate-400">
                No leave requests found matching the specified filters.
              </td>
            </tr>
          ) : (
            leaveRecords.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. Request ID */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(req)}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {req.id}
                  </button>
                </td>

                {/* 2. Employee ID */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-600 whitespace-nowrap">
                  {req.employeeId}
                </td>

                {/* 3. Employee Name */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {req.employeeName}
                </td>

                {/* 4. Department */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {req.department}
                </td>

                {/* 5. Leave Type */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                  {req.leaveType}
                </td>

                {/* 6. From Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {req.fromDate}
                </td>

                {/* 7. To Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {req.toDate}
                </td>

                {/* 8. Days */}
                <td className="py-3.5 px-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                  {req.days}
                </td>

                {/* 9. Applied On */}
                <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                  {req.appliedDate}
                </td>

                {/* 10. Status */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getLeaveStatusBadge(
                      req.status
                    )}`}
                  >
                    {req.status}
                  </span>
                </td>

                {/* 11. Actions */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {req.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(req.id)}
                          className="p-1 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Approve Leave"
                          aria-label={`Approve leave for ${req.employeeName}`}
                        >
                          <Check className="w-4 h-4 stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(req.id)}
                          className="p-1 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Reject Leave"
                          aria-label={`Reject leave for ${req.employeeName}`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => onViewDetails(req)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                      title="View Leave Details"
                      aria-label={`View leave details for ${req.employeeName}`}
                    >
                      <Eye className="w-4 h-4" />
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

