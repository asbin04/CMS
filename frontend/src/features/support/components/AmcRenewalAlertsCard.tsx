import React from 'react';
import { Bell, AlertTriangle, Calendar } from 'lucide-react';

interface AmcRenewalAlertsCardProps {
  overdueCount: number;
  dueSoon30Count: number;
  upcoming31to90Count: number;
  onFilterAlert?: (alertType: string) => void;
}

export const AmcRenewalAlertsCard: React.FC<AmcRenewalAlertsCardProps> = ({
  overdueCount,
  dueSoon30Count,
  upcoming31to90Count,
  onFilterAlert,
}) => {
  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: '476px',
        height: '250.5px',
        background: '#FFFFFF',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        padding: '20px',
      }}
      className="flex flex-col justify-between items-start font-['Inter']"
    >
      {/* Title with Bell Icon */}
      <div className="flex flex-row items-center gap-2">
        <Bell className="w-4 h-4 text-[#334155]" strokeWidth={1.5} />
        <h3 className="font-semibold text-[14px] leading-[20px] text-[#1E293B]">
          Renewal Alerts
        </h3>
      </div>

      {/* 3 Alert Rows Container */}
      <div className="flex flex-col justify-center items-start gap-2.5 w-full">
        {/* Alert 1: Overdue */}
        <div
          style={{
            boxSizing: 'border-box',
            height: '42px',
            background: 'rgba(254, 242, 242, 0.7)',
            border: '1px solid #FEE2E2',
            borderRadius: '8px',
            padding: '12px',
          }}
          className="flex flex-row justify-between items-center w-full"
        >
          <div className="flex flex-row items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" strokeWidth={1.5} />
            <span className="font-normal text-[12px] leading-[16px] text-[#0F172A]">
              <strong className="font-bold">{overdueCount} contracts</strong> are overdue for renewal.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFilterAlert?.('Overdue')}
            className="font-semibold text-[12px] leading-[16px] text-[#4F46E5] hover:underline cursor-pointer"
          >
            View
          </button>
        </div>

        {/* Alert 2: ≤ 30 Days */}
        <div
          style={{
            boxSizing: 'border-box',
            height: '42px',
            background: 'rgba(255, 251, 235, 0.7)',
            border: '1px solid #FEF3C7',
            borderRadius: '8px',
            padding: '12px',
          }}
          className="flex flex-row justify-between items-center w-full"
        >
          <div className="flex flex-row items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" strokeWidth={1.5} />
            <span className="font-normal text-[12px] leading-[16px] text-[#0F172A]">
              <strong className="font-bold">{dueSoon30Count} contracts</strong> are due within the next 30 days.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFilterAlert?.('≤ 30 Days')}
            className="font-semibold text-[12px] leading-[16px] text-[#4F46E5] hover:underline cursor-pointer"
          >
            View
          </button>
        </div>

        {/* Alert 3: 31 – 90 Days */}
        <div
          style={{
            boxSizing: 'border-box',
            height: '42px',
            background: 'rgba(239, 246, 255, 0.6)',
            border: '1px solid #DBEAFE',
            borderRadius: '8px',
            padding: '12px',
          }}
          className="flex flex-row justify-between items-center w-full"
        >
          <div className="flex flex-row items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#3B82F6] shrink-0" strokeWidth={1.5} />
            <span className="font-normal text-[12px] leading-[16px] text-[#0F172A]">
              <strong className="font-bold">{upcoming31to90Count} contracts</strong> are due in 31 – 90 days.
            </span>
          </div>
          <button
            type="button"
            onClick={() => onFilterAlert?.('31 – 90 Days')}
            className="font-semibold text-[12px] leading-[16px] text-[#4F46E5] hover:underline cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
};

