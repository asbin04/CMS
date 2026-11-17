import { Employee, HrKpiMetric } from '../types';

export const INITIAL_HR_KPIS: HrKpiMetric[] = [
  // Row 1
  {
    id: 'active-employees',
    label: 'Active Employees',
    value: '0',
    iconName: 'users',
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
  },
  {
    id: 'on-notice',
    label: 'On Notice',
    value: '0',
    iconName: 'clock',
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
  },
  {
    id: 'total-monthly-ctc',
    label: 'Total Monthly CTC',
    value: '₹0',
    iconName: 'credit-card',
    iconBg: '#EEF2FF',
    iconColor: '#6366F1',
  },
  {
    id: 'new-hires-this-month',
    label: 'New Hires This Month',
    value: '0',
    iconName: 'user-plus',
    iconBg: '#EFF6FF',
    iconColor: '#3B82F6',
  },
  // Row 2
  {
    id: 'attendance-records',
    label: 'Attendance Records',
    value: '0',
    iconName: 'trending-up',
    iconBg: '#F0F9FF',
    iconColor: '#0284C7',
  },
  {
    id: 'half-days',
    label: 'Half Days',
    value: '0',
    iconName: 'clock',
    iconBg: '#EEF2FF',
    iconColor: '#6366F1',
  },
  {
    id: 'late-records',
    label: 'Late Records',
    value: '0',
    iconName: 'clock',
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
  {
    id: 'open-candidates-1',
    label: 'Open Candidates',
    value: '0',
    iconName: 'search',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  // Row 3
  {
    id: 'open-candidates-2',
    label: 'Open Candidates',
    value: '0',
    iconName: 'search',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
  },
  {
    id: 'candidates-over-30-days',
    label: 'Candidates Over 30 Days',
    value: '0',
    iconName: 'alert-triangle',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
  {
    id: 'pending-leave-approvals',
    label: 'Pending Leave Approvals',
    value: '0',
    iconName: 'calendar',
    iconBg: '#FFFBEB',
    iconColor: '#F59E0B',
  },
  {
    id: 'employees-exiting',
    label: 'Employees Exiting',
    value: '0',
    iconName: 'user-minus',
    iconBg: '#FEF2F2',
    iconColor: '#EF4444',
  },
];

export const MOCK_EMPLOYEES: Employee[] = [];
