import React from 'react';
import { Eye } from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface HrAttendanceTableProps {
  attendanceRecords: AttendanceRecord[];
  onViewDetails: (record: AttendanceRecord) => void;
}

const getAttendanceBadgeClass = (status: string) => {
  switch (status) {
    case 'Present':
      return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
    case 'Late':
      return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    case 'Half Day':
      return 'bg-[#EEF2FF] text-[#6366F1] border border-[#C7D2FE]';
    case 'Absent':
      return 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]';
    case 'On Leave':
      return 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const HrAttendanceTable: React.FC<HrAttendanceTableProps> = ({
  attendanceRecords,
  onViewDetails,
}) => {
  return (
    <div
      className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-slate-200"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <table className="w-full text-left border-collapse min-w-[1200px]">
        <thead>
          <tr className="border-y border-slate-100 bg-[#FAFCFF] text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              EMPLOYEE ID
            </th>
            <th className="py-3 px-4 min-w-[170px] whitespace-nowrap">
              EMPLOYEE NAME
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              DEPARTMENT
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              DATE
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              CHECK-IN
            </th>
            <th className="py-3 px-4 min-w-[130px] whitespace-nowrap">
              CHECK-OUT
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              WORKING HOURS
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              STATUS
            </th>
            <th className="py-3 px-4 min-w-[80px] whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {attendanceRecords.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                No attendance records found matching the specified filters.
              </td>
            </tr>
          ) : (
            attendanceRecords.map((record) => (
              <tr
                key={record.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. Employee ID */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewDetails(record)}
                    className="hover:underline focus:outline-none cursor-pointer"
                  >
                    {record.employeeId}
                  </button>
                </td>

                {/* 2. Employee Name */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {record.employeeName}
                </td>

                {/* 3. Department */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {record.department}
                </td>

                {/* 4. Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {record.date}
                </td>

                {/* 5. Check-In */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                  {record.checkIn}
                </td>

                {/* 6. Check-Out */}
                <td className="py-3.5 px-4 text-xs font-medium text-slate-800 whitespace-nowrap">
                  {record.checkOut}
                </td>

                {/* 7. Working Hours */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {record.workingHours}
                </td>

                {/* 8. Status */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getAttendanceBadgeClass(
                      record.status
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>

                {/* 9. Actions */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap text-right">
                  <button
                    type="button"
                    onClick={() => onViewDetails(record)}
                    className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                    title="View Attendance Details"
                    aria-label={`View attendance for ${record.employeeName}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

