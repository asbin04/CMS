import React from 'react';
import { FileText, RotateCw, Calendar, AlertTriangle } from 'lucide-react';

interface AmcRenewalsKpiCardsProps {
  total: number;
  dueSoon30: number;
  upcoming31to90: number;
  overdue: number;
  isLoading?: boolean;
}

export const AmcRenewalsKpiCards: React.FC<AmcRenewalsKpiCardsProps> = ({
  total,
  dueSoon30,
  upcoming31to90,
  overdue,
  isLoading = false,
}) => {
  return (
    <div
      data-testid="amc-renewals-kpi-cards"
      className="flex flex-row flex-wrap sm:flex-nowrap justify-between items-start p-0 gap-4 w-full max-w-[972px] font-['Inter']"
    >
      {/* Card 1: Total Contracts */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '231px',
          height: '112px',
          background: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '28px 16px',
        }}
        className="flex flex-row items-center gap-4 flex-1 min-w-[200px]"
      >
        <div
          style={{ width: '48px', height: '48px', background: '#EEF2FF', borderRadius: '12px' }}
          className="flex items-center justify-center shrink-0"
        >
          <FileText className="w-6 h-6 text-[#4F46E5]" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold text-[12px] leading-[16px] text-[#64748B]">
            Total Contracts
          </span>
          <span className="font-bold text-[24px] leading-[30px] text-[#0F172A]">
            {isLoading ? '...' : total}
          </span>
        </div>
      </div>

      {/* Card 2: Renewal Due (≤ 30 Days) */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '231px',
          height: '112px',
          background: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '16px',
        }}
        className="flex flex-row items-center gap-4 flex-1 min-w-[200px]"
      >
        <div
          style={{ width: '48px', height: '48px', background: '#ECFDF5', borderRadius: '12px' }}
          className="flex items-center justify-center shrink-0"
        >
          <RotateCw className="w-6 h-6 text-[#059669]" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold text-[12px] leading-[16px] text-[#64748B]">
            Renewal Due (≤ 30 Days)
          </span>
          <span className="font-bold text-[24px] leading-[30px] text-[#0F172A]">
            {isLoading ? '...' : dueSoon30}
          </span>
        </div>
      </div>

      {/* Card 3: Upcoming (31 - 90 Days) */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '231px',
          height: '112px',
          background: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '16px',
        }}
        className="flex flex-row items-center gap-4 flex-1 min-w-[200px]"
      >
        <div
          style={{ width: '48px', height: '48px', background: '#FFFBEB', borderRadius: '12px' }}
          className="flex items-center justify-center shrink-0"
        >
          <Calendar className="w-6 h-6 text-[#F59E0B]" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold text-[12px] leading-[16px] text-[#64748B]">
            Upcoming (31 – 90 Days)
          </span>
          <span className="font-bold text-[24px] leading-[30px] text-[#0F172A]">
            {isLoading ? '...' : upcoming31to90}
          </span>
        </div>
      </div>

      {/* Card 4: Overdue Renewals */}
      <div
        style={{
          boxSizing: 'border-box',
          width: '231px',
          height: '112px',
          background: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          padding: '28px 16px',
        }}
        className="flex flex-row items-center gap-4 flex-1 min-w-[200px]"
      >
        <div
          style={{ width: '48px', height: '48px', background: '#FFF1F2', borderRadius: '12px' }}
          className="flex items-center justify-center shrink-0"
        >
          <AlertTriangle className="w-6 h-6 text-[#F43F5E]" strokeWidth={2} />
        </div>
        <div className="flex flex-col items-start gap-1">
          <span className="font-semibold text-[12px] leading-[16px] text-[#64748B]">
            Overdue Renewals
          </span>
          <span className="font-bold text-[24px] leading-[30px] text-[#0F172A]">
            {isLoading ? '...' : overdue}
          </span>
        </div>
      </div>
    </div>
  );
};

