import React from 'react';
import {
  Bell,
  ChevronRight,
  FileText,
  Clock,
  Briefcase,
  ShieldCheck,
  FolderSync,
  FileX,
  Award,
  UserCheck,
  AlertCircle,
  Users
} from 'lucide-react';
import { ManagementAlertItem } from '../../types/dashboard';

interface ManagementAlertsSectionProps {
  alerts: ManagementAlertItem[];
  onAlertClick?: (alert: ManagementAlertItem) => void;
  onUpdateAlertCount?: (id: number, delta: number) => void;
}

export const ManagementAlertsSection: React.FC<ManagementAlertsSectionProps> = ({
  alerts,
  onAlertClick = () => {}
}) => {
  // Predefined 10 standard rows from the Figma specification
  const defaultAlertRows = [
    { id: 1, alert_key: 'overdue_invoices', title: 'Overdue Invoices', alert_count: 0, icon_type: 'invoice', icon_color: '#F04438' },
    { id: 2, alert_key: 'contracts_expiring', title: 'Contracts Expiring', alert_count: 0, icon_type: 'contract', icon_color: '#F59E0B' },
    { id: 3, alert_key: 'overdue_projects', title: 'Overdue Projects', alert_count: 0, icon_type: 'project', icon_color: '#0284C7' },
    { id: 4, alert_key: 'overdue_compliance', title: 'Overdue Compliance', alert_count: 0, icon_type: 'compliance', icon_color: '#16A34A' },
    { id: 5, alert_key: 'doc_expiring', title: 'Expiring Documents', alert_count: 0, icon_type: 'doc_expiring', icon_color: '#9333EA' },
    { id: 6, alert_key: 'doc_expired', title: 'Expired Documents', alert_count: 0, icon_type: 'doc_expired', icon_color: '#DC2626' },
    { id: 7, alert_key: 'warranties_expired', title: 'Expired Warranties', alert_count: 0, icon_type: 'warranty', icon_color: '#EA580C' },
    { id: 8, alert_key: 'pending_approvals', title: 'Pending Approvals', alert_count: 0, icon_type: 'approval_pending', icon_color: '#0284C7' },
    { id: 9, alert_key: 'overdue_approvals', title: 'Overdue Approvals', alert_count: 0, icon_type: 'approval_overdue', icon_color: '#E11D48' },
    { id: 10, alert_key: 'candidate_followups', title: 'Candidate Follow-ups', alert_count: 0, icon_type: 'candidate', icon_color: '#7C3AED' },
  ];

  // Merge live alert counts with rows
  const displayAlerts = defaultAlertRows.map((row) => {
    const liveAlert = (alerts || []).find(
      (a: any) =>
        (a.alert_key && a.alert_key.toLowerCase() === row.alert_key.toLowerCase()) ||
        (a.title && a.title.toLowerCase() === row.title.toLowerCase())
    );
    return {
      ...row,
      alert_count: liveAlert?.alert_count ?? row.alert_count,
      id: liveAlert?.id ?? row.id,
    };
  });

  const renderAlertIcon = (iconType: string, color: string) => {
    const size = 18;
    switch (iconType) {
      case 'invoice':
        return <FileText size={size} color={color} strokeWidth={1.8} />;
      case 'contract':
        return <FileText size={size} color={color} strokeWidth={1.8} />;
      case 'project':
        return <Briefcase size={size} color={color} strokeWidth={1.8} />;
      case 'compliance':
        return <ShieldCheck size={size} color={color} strokeWidth={1.8} />;
      case 'doc_expiring':
        return <FolderSync size={size} color={color} strokeWidth={1.8} />;
      case 'doc_expired':
        return <FileX size={size} color={color} strokeWidth={1.8} />;
      case 'warranty':
        return <Award size={size} color={color} strokeWidth={1.8} />;
      case 'approval_pending':
        return <UserCheck size={size} color={color} strokeWidth={1.8} />;
      case 'approval_overdue':
        return <Clock size={size} color={color} strokeWidth={1.8} />;
      case 'candidate':
        return <Users size={size} color={color} strokeWidth={1.8} />;
      default:
        return <AlertCircle size={size} color={color} strokeWidth={1.8} />;
    }
  };

  return (
    <div
      className="bg-white border border-[#F1F5F9]/80 rounded-[16px] p-8 flex flex-col gap-6"
      style={{
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] border border-[#FED7AA]/70 flex items-center justify-center shrink-0">
          <Bell size={18} className="text-[#F97316]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[14px] font-medium text-[#1E293B] tracking-[-0.6px] leading-tight">
            Management Alerts
          </h3>
          <p className="text-[11.5px] font-normal text-[#94A3B8] leading-5">
            Live counts from the Alerts Center. Click on an item to view filtered alerts.
          </p>
        </div>
      </div>

      {/* Table Container with Two Columns & Middle Divider */}
      <div className="border border-[#F1F5F9] rounded-lg overflow-hidden w-full">
        {/* Table Head */}
        <div className="grid grid-cols-12 bg-[#F8FAFC]/70 border-b border-[#F1F5F9] h-[47px] text-[12px] font-semibold text-[#475569] select-none">
          <div className="col-span-6 px-6 py-3 border-r border-[#F1F5F9] flex items-center">
            Alert
          </div>
          <div className="col-span-6 px-6 py-3 flex items-center">
            Count
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#F1F5F9] bg-white">
          {displayAlerts.map((alert: any) => (
            <div
              key={alert.id || alert.title}
              onClick={() => onAlertClick(alert)}
              className="grid grid-cols-12 items-center hover:bg-slate-50/70 transition-colors cursor-pointer group h-[48px]"
            >
              {/* Alert Column */}
              <div className="col-span-6 px-6 py-3 border-r border-[#F1F5F9] flex items-center gap-3.5 min-w-0">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {renderAlertIcon(alert.icon_type, alert.icon_color)}
                </div>
                <span className="text-[12px] font-medium text-[#1E293B] group-hover:text-blue-600 transition-colors truncate">
                  {alert.title}
                </span>
              </div>

              {/* Count Column */}
              <div className="col-span-6 px-6 py-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#1E293B]">
                  {alert.alert_count}
                </span>
                <ChevronRight
                  size={16}
                  className="text-[#94A3B8] group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
