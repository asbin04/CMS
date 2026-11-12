import React from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { Employee, EmployeeStatus } from '../types';
import { StatusDropdownMenu, StatusItemConfig } from '../../../components/ui/StatusDropdownMenu';

interface HrEmployeeTableProps {
  employees: Employee[];
  onUpdateStatus?: (employeeId: string, newStatus: EmployeeStatus) => void;
  onViewEmployee?: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
}

const EMPLOYEE_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Active', label: 'Active', dotColor: '#10B981', textColor: '#059669' },
  { value: 'On Notice', label: 'On Notice', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Inactive', label: 'Inactive', dotColor: '#94A3B8', textColor: '#64748B' },
];

const getStatusBadgeClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]';
    case 'on notice':
      return 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]';
    case 'inactive':
    case 'exited':
      return 'bg-slate-100 text-slate-600 border border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
};

export const HrEmployeeTable: React.FC<HrEmployeeTableProps> = ({
  employees,
  onUpdateStatus,
  onViewEmployee,
  onEditEmployee,
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
              NAME
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              DEPARTMENT
            </th>
            <th className="py-3 px-4 min-w-[180px] whitespace-nowrap">
              DESIGNATION
            </th>
            <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">
              EMPLOYMENT TYPE
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              JOINING DATE
            </th>
            <th className="py-3 px-4 min-w-[140px] whitespace-nowrap">
              STATUS
            </th>
            <th className="py-3 px-4 min-w-[150px] whitespace-nowrap">
              MONTHLY CTC
            </th>
            <th className="py-3 px-4 min-w-[100px] whitespace-nowrap text-right">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                No employees found matching the specified filters.
              </td>
            </tr>
          ) : (
            employees.map((emp) => (
              <tr
                key={emp.id}
                className="hover:bg-slate-50/70 transition-colors group"
              >
                {/* 1. Employee ID */}
                <td className="py-3.5 px-4 text-xs font-semibold text-[#4F46E5] whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onViewEmployee?.(emp)}
                    className="hover:underline focus:outline-none cursor-pointer"
                    title={`View details for ${emp.name}`}
                  >
                    {emp.id}
                  </button>
                </td>

                {/* 2. Name */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {emp.name}
                </td>

                {/* 3. Department */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {emp.department}
                </td>

                {/* 4. Designation */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {emp.designation}
                </td>

                {/* 5. Employment Type */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {emp.employmentType}
                </td>

                {/* 6. Joining Date */}
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {emp.joiningDate}
                </td>

                {/* 7. Status (Interactive Dropdown Menu) */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                  <StatusDropdownMenu
                    currentStatus={emp.status}
                    options={EMPLOYEE_STATUS_CONFIGS}
                    headerTitle="CHANGE STATUS"
                    triggerVariant="badge"
                    getBadgeClass={getStatusBadgeClass}
                    onSelect={(newStatus) =>
                      onUpdateStatus?.(emp.id, newStatus as EmployeeStatus)
                    }
                  />
                </td>

                {/* 8. Monthly CTC */}
                <td className="py-3.5 px-4 text-xs font-semibold text-slate-900 whitespace-nowrap">
                  {emp.monthlyCtc}
                </td>

                {/* 9. Actions */}
                <td className="py-3.5 px-4 text-xs whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewEmployee?.(emp)}
                      className="p-1 rounded-md text-slate-400 hover:text-[#4F46E5] hover:bg-[#EEF2FF] transition-colors cursor-pointer"
                      title="View Details"
                      aria-label={`View ${emp.name}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditEmployee?.(emp)}
                      className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit Employee"
                      aria-label={`Edit ${emp.name}`}
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
