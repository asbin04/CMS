import React from 'react';
import { Ticket, Clock, CheckCircle2, AlertTriangle, Target } from 'lucide-react';
import { SupportTicketKpis } from '../types/tickets';

interface SupportTicketKpiCardsProps {
  kpis: SupportTicketKpis | null;
  isLoading?: boolean;
}

export const SupportTicketKpiCards: React.FC<SupportTicketKpiCardsProps> = ({ kpis, isLoading = false }) => {
  const cards = [
    {
      id: 'total',
      label: 'Total Tickets',
      value: kpis ? kpis.totalTickets.toLocaleString() : '186',
      icon: Ticket,
      iconColor: '#2563EB',
      iconBg: '#F0F3FF',
    },
    {
      id: 'open',
      label: 'Open Tickets',
      value: kpis ? kpis.openTickets.toLocaleString() : '34',
      icon: Clock,
      iconColor: '#2563EB',
      iconBg: '#EEF6FF',
    },
    {
      id: 'resolved',
      label: 'Resolved Tickets',
      value: kpis ? kpis.resolvedTickets.toLocaleString() : '124',
      icon: CheckCircle2,
      iconColor: '#059669',
      iconBg: '#ECFDF5',
    },
    {
      id: 'breaches',
      label: 'SLA Breaches',
      value: kpis ? kpis.slaBreaches.toLocaleString() : '6',
      icon: AlertTriangle,
      iconColor: '#F43F5E',
      iconBg: '#FFF1F2',
    },
    {
      id: 'compliance',
      label: 'SLA Compliance',
      value: kpis ? kpis.slaComplianceFormatted : '96.8%',
      icon: Target,
      iconColor: '#0284C7',
      iconBg: '#F0F9FF',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="box-border flex flex-row items-center p-4 gap-[14px] bg-white border border-[#F3F4F6] rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.05)] h-[85px] transition-all duration-150 hover:shadow-md"
          >
            {/* 48x48 Icon Box */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: card.iconBg }}
            >
              <IconComponent className="w-5 h-5" style={{ color: card.iconColor }} />
            </div>

            {/* Content Column */}
            <div className="flex flex-col justify-center min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-[#374151] truncate">
                {card.label}
              </span>
              <span className="text-2xl font-bold text-[#111827] leading-8 truncate">
                {isLoading ? '...' : card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

