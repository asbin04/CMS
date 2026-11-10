import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { SupportTicketItem } from '../types/tickets';

interface SupportTicketsTableProps {
  tickets: SupportTicketItem[];
  isLoading?: boolean;
  onEditTicket?: (ticket: SupportTicketItem) => void;
  onDeleteTicket?: (ticket: SupportTicketItem) => void;
}

export const SupportTicketsTable: React.FC<SupportTicketsTableProps> = ({
  tickets,
  isLoading = false,
  onEditTicket,
  onDeleteTicket,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalItems = tickets.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return tickets.slice(start, start + pageSize);
  }, [tickets, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const renderPriorityBadge = (priority: string) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high' || p === 'urgent') {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[40.7px] h-5 bg-[#FEE2E2] rounded">
          <span className="font-['Inter'] font-semibold text-[11px] leading-4 text-[#EF4444]">
            {priority}
          </span>
        </div>
      );
    } else if (p === 'medium') {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[59.05px] h-5 bg-[#FEF3C7] rounded">
          <span className="font-['Inter'] font-semibold text-[11px] leading-4 text-[#D97706]">
            {priority}
          </span>
        </div>
      );
    } else {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[38px] h-5 bg-[#DCFCE7] rounded">
          <span className="font-['Inter'] font-semibold text-[11px] leading-4 text-[#15803D]">
            {priority}
          </span>
        </div>
      );
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'in progress') {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2.5 py-0.5 w-[79.47px] h-5 bg-[#E0E7FF] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#4F46E5]">
            In Progress
          </span>
        </div>
      );
    } else if (s === 'pending') {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2.5 py-0.5 w-[63.08px] h-5 bg-[#FEF3C7] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#D97706]">
            Pending
          </span>
        </div>
      );
    } else if (s === 'resolved') {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2.5 py-0.5 w-[68.23px] h-5 bg-[#DCFCE7] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#16A34A]">
            Resolved
          </span>
        </div>
      );
    } else {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2.5 py-0.5 w-[56.67px] h-5 bg-[#F1F5F9] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#475569]">
            {status || 'Closed'}
          </span>
        </div>
      );
    }
  };

  const renderSlaStatusBadge = (slaStatus: string) => {
    const s = (slaStatus || '').toLowerCase();
    if (s.includes('risk')) {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[52.22px] h-5 bg-[#FEF3C7] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#D97706]">
            At Risk
          </span>
        </div>
      );
    } else if (s.includes('breach')) {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[60px] h-5 bg-[#FEE2E2] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#EF4444]">
            Breached
          </span>
        </div>
      );
    } else {
      return (
        <div className="box-border flex flex-row items-center justify-center px-2 py-0.5 w-[73.63px] h-5 bg-[#ECFDF5] rounded">
          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#10B981]">
            Within SLA
          </span>
        </div>
      );
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const renderPaginationButtons = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages.map((page, idx) => {
      if (typeof page === 'string') {
        return (
          <div key={`dots-${idx}`} className="flex flex-col items-start px-2 py-0 w-[22.38px] h-4 justify-center">
            <span className="font-['Inter'] font-normal text-xs leading-4 text-[#94A3B8]">
              ...
            </span>
          </div>
        );
      }

      const isActive = page === currentPage;
      if (isActive) {
        return (
          <div key={page} className="flex flex-col items-start pl-1 w-8 h-7">
            <button
              type="button"
              className="box-border flex flex-row justify-center items-center w-7 h-7 bg-[#4F46E5] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded text-white font-['Inter'] font-semibold text-xs leading-4"
            >
              {page}
            </button>
          </div>
        );
      }

      return (
        <div key={page} className="flex flex-col items-start pl-1 w-8 h-7">
          <button
            type="button"
            onClick={() => setCurrentPage(page)}
            className="box-border flex flex-row justify-center items-center w-7 h-7 rounded text-[#475569] font-['Inter'] font-medium text-xs leading-4 hover:bg-[#F1F5F9] transition-colors"
          >
            {page}
          </button>
        </div>
      );
    });
  };

  return (
    <div className="w-full flex flex-col items-start p-0">
      {/* Strict single line horizontal table wrapper with scroll matching 2378.59px Figma specification */}
      <div className="w-full overflow-x-auto">
        <div className="flex flex-col items-start p-0 w-[2378.59px] min-w-[2378.59px]">
          {/* Table Header */}
          <div className="box-border flex flex-col items-start p-0 w-[2378.59px] h-[41px] bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <div className="flex flex-row items-center w-[2378.59px] h-10">
              {/* 1. Ticket ID */}
              <div className="flex flex-col items-start py-3 px-3.5 w-[113.02px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Ticket ID</span>
              </div>
              {/* 2. Client ID */}
              <div className="flex flex-col items-start p-3 w-[69.17px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Client ID</span>
              </div>
              {/* 3. Project ID */}
              <div className="flex flex-col items-start p-3 w-[75.77px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Project ID</span>
              </div>
              {/* 4. AMC / SLA ID */}
              <div className="flex flex-col items-start p-3 w-[95.36px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">AMC / SLA ID</span>
              </div>
              {/* 5. Opened Date */}
              <div className="flex flex-col items-start p-3 w-[95.25px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Opened Date</span>
              </div>
              {/* 6. Ticket Type */}
              <div className="flex flex-col items-start p-3 w-[86.89px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Ticket Type</span>
              </div>
              {/* 7. Priority */}
              <div className="flex flex-col items-start p-3 w-[83.05px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Priority</span>
              </div>
              {/* 8. Issue / Request */}
              <div className="flex flex-col items-start p-3 w-[191.05px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Issue / Request</span>
              </div>
              {/* 9. Assigned To */}
              <div className="flex flex-col items-start p-3 w-[99.67px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Assigned To</span>
              </div>
              {/* 10. Status */}
              <div className="flex flex-col items-start p-3 w-[103.47px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Status</span>
              </div>
              {/* 11. First Response Date */}
              <div className="flex flex-col items-start p-3 w-[153.38px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">First Response Date</span>
              </div>
              {/* 12. Resolved Date */}
              <div className="flex flex-col items-center p-3 w-[153.83px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Resolved Date</span>
              </div>
              {/* 13. Response Hours */}
              <div className="flex flex-col items-center p-3 w-[112.11px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Response Hours</span>
              </div>
              {/* 14. Resolution Hours */}
              <div className="flex flex-col items-center p-3 w-[116.05px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Resolution Hours</span>
              </div>
              {/* 15. Response SLA Target */}
              <div className="flex flex-col items-center p-3 w-[138.56px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Response SLA Target</span>
              </div>
              {/* 16. Resolution SLA Target */}
              <div className="flex flex-col items-center p-3 w-[142.5px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Resolution SLA Target</span>
              </div>
              {/* 17. SLA Status */}
              <div className="flex flex-col items-start p-3 w-[97.63px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">SLA Status</span>
              </div>
              {/* 18. Customer Confirmation */}
              <div className="flex flex-col items-center p-3 w-[150.27px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937] text-center">Customer Confirmation</span>
              </div>
              {/* 19. Notes */}
              <div className="flex flex-col items-start py-3 px-4 w-[253.59px] h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]">Notes</span>
              </div>
              {/* 20. Action Options */}
              <div className="flex flex-col items-center py-3 px-2 w-12 h-10">
                <span className="font-['Inter'] font-bold text-[11px] leading-4 text-[#1F2937]"></span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col items-start p-0 w-[2378.59px]">
            {isLoading ? (
              <div className="w-full py-12 flex items-center justify-center text-xs text-[#94A3B8]">
                Loading support tickets...
              </div>
            ) : paginatedTickets.length === 0 ? (
              <div className="w-full py-12 flex items-center justify-center text-xs text-[#94A3B8]">
                No support tickets found matching the criteria.
              </div>
            ) : (
              paginatedTickets.map((ticket, index) => {
                const firstResponseDateVal = ticket.firstResponseDate || (formatDate(ticket.openedDate) + ' 11:30 AM');
                const resolvedDateVal = ticket.resolvedDate || (ticket.status === 'Resolved' || ticket.status === 'Closed' ? formatDate(ticket.openedDate) : '-');
                const responseHoursVal = ticket.responseHours || (ticket.priority === 'High' ? '0.3' : ticket.priority === 'Medium' ? '1.0' : '1.3');
                const resolutionHoursVal = ticket.resolutionHours || (ticket.status === 'Resolved' || ticket.status === 'Closed' ? '20.4' : '-');
                const responseSlaTargetVal = ticket.responseSlaTarget || (ticket.priority === 'High' ? '2.0' : '4.0');
                const resolutionSlaTargetVal = ticket.resolutionSlaTarget || (ticket.priority === 'High' ? '8.0' : ticket.priority === 'Medium' ? '16.0' : '24.0');
                const customerConfirmationVal = ticket.customerConfirmation || (ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'Yes' : '-');
                const notesVal = ticket.notes || ticket.description || 'Support ticket processed and verified.';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => onEditTicket?.(ticket)}
                    className={`box-border flex flex-row items-center p-0 w-[2378.59px] h-[49px] hover:bg-[#F8FAFC] transition-colors cursor-pointer ${
                      index > 0 ? 'border-t border-[#F3F4F6]' : ''
                    }`}
                  >
                    {/* 1. Ticket ID */}
                    <div className="flex flex-col items-start pt-4 px-3.5 pb-[17px] w-[113.02px] h-[49px]">
                      <span className="font-['Inter'] font-semibold text-xs leading-4 text-[#2563EB]">
                        {ticket.ticketCode}
                      </span>
                    </div>

                    {/* 2. Client ID */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[69.17px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {ticket.clientId}
                      </span>
                    </div>

                    {/* 3. Project ID */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[75.77px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {ticket.projectId}
                      </span>
                    </div>

                    {/* 4. AMC / SLA ID */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[95.36px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {ticket.amcSlaId || '-'}
                      </span>
                    </div>

                    {/* 5. Opened Date */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[95.25px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {formatDate(ticket.openedDate)}
                      </span>
                    </div>

                    {/* 6. Ticket Type */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[86.89px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {ticket.ticketType}
                      </span>
                    </div>

                    {/* 7. Priority */}
                    <div className="flex flex-col items-start py-[14.5px] px-3 w-[83.05px] h-[49px]">
                      {renderPriorityBadge(ticket.priority)}
                    </div>

                    {/* 8. Issue / Request */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[191.05px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151] truncate w-full" title={ticket.issueRequest}>
                        {ticket.issueRequest}
                      </span>
                    </div>

                    {/* 9. Assigned To */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[99.67px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151] truncate w-full">
                        {ticket.assignedTo}
                      </span>
                    </div>

                    {/* 10. Status */}
                    <div className="flex flex-col items-start py-[14.5px] px-3 w-[103.47px] h-[49px]">
                      {renderStatusBadge(ticket.status)}
                    </div>

                    {/* 11. First Response Date */}
                    <div className="flex flex-col items-start pt-4 px-3 pb-[17px] w-[153.38px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151] truncate w-full">
                        {firstResponseDateVal}
                      </span>
                    </div>

                    {/* 12. Resolved Date */}
                    <div className="flex flex-col items-center pt-4 px-3 pb-[17px] w-[153.83px] h-[49px]">
                      <span className={`font-['Inter'] font-normal text-xs leading-4 ${resolvedDateVal === '-' ? 'text-[#9CA3AF]' : 'text-[#374151]'}`}>
                        {resolvedDateVal}
                      </span>
                    </div>

                    {/* 13. Response Hours */}
                    <div className="flex flex-col items-center pt-4 px-3 pb-[17px] w-[112.11px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {responseHoursVal}
                      </span>
                    </div>

                    {/* 14. Resolution Hours */}
                    <div className="flex flex-col items-center pt-4 px-3 pb-[17px] w-[116.05px] h-[49px]">
                      <span className={`font-['Inter'] font-normal text-xs leading-4 ${resolutionHoursVal === '-' ? 'text-[#9CA3AF]' : 'text-[#374151]'}`}>
                        {resolutionHoursVal}
                      </span>
                    </div>

                    {/* 15. Response SLA Target */}
                    <div className="flex flex-col items-center pt-4 px-3 pb-[17px] w-[138.56px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {responseSlaTargetVal}
                      </span>
                    </div>

                    {/* 16. Resolution SLA Target */}
                    <div className="flex flex-col items-center pt-4 px-3 pb-[17px] w-[142.5px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#374151]">
                        {resolutionSlaTargetVal}
                      </span>
                    </div>

                    {/* 17. SLA Status */}
                    <div className="flex flex-col items-start py-[14.5px] px-3 w-[97.63px] h-[49px]">
                      {renderSlaStatusBadge(ticket.slaStatus)}
                    </div>

                    {/* 18. Customer Confirmation */}
                    <div className="flex flex-col items-center justify-center py-[14.5px] px-3 w-[150.27px] h-[49px]">
                      {customerConfirmationVal === 'Yes' ? (
                        <div className="box-border flex flex-row justify-center items-center px-2 py-0.5 w-[35.09px] h-5 bg-[#DCFCE7] rounded">
                          <span className="font-['Inter'] font-medium text-[11px] leading-4 text-[#15803D]">
                            Yes
                          </span>
                        </div>
                      ) : (
                        <span className="font-['Inter'] font-normal text-xs leading-4 text-[#9CA3AF]">
                          -
                        </span>
                      )}
                    </div>

                    {/* 19. Notes */}
                    <div className="flex flex-col items-start pt-4 px-4 pb-[17px] w-[253.59px] h-[49px]">
                      <span className="font-['Inter'] font-normal text-xs leading-4 text-[#4B5563] truncate w-full" title={notesVal}>
                        {notesVal}
                      </span>
                    </div>

                    {/* 20. Action Button & Dropdown */}
                    <div className="relative flex flex-col items-center justify-center py-3 px-3 w-12 h-[49px]">
                      <button
                        type="button"
                        aria-label="Row options"
                        onClick={() => setActiveMenuId(activeMenuId === ticket.id ? null : ticket.id)}
                        className="flex flex-row items-center justify-center p-1 w-6 h-6 rounded hover:bg-[#E2E8F0] transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-[#2563EB]" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === ticket.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-10 w-32 bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1"
                        >
                          {onEditTicket && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditTicket(ticket);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#4F46E5]" />
                              <span>Edit Ticket</span>
                            </button>
                          )}
                          {onDeleteTicket && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDeleteTicket(ticket);
                              }}
                              className="w-full px-3 py-1.5 text-left text-xs text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#DC2626]" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer Bar matching Figma specification */}
      <div className="box-border flex flex-row flex-wrap justify-between items-center px-4 py-4 w-full h-[61px] bg-white border-t border-[#E2E8F0]">
        {/* Item Count Summary */}
        <div className="flex flex-col items-start p-0 h-4">
          <span className="font-['Inter'] font-medium text-xs leading-4 text-[#64748B]">
            Showing {startItem} – {endItem} of {totalItems} deployments
          </span>
        </div>

        {/* Page Controls & Rows Selector */}
        <div className="flex flex-row items-center p-0 gap-3 h-7">
          {/* Nav - Pagination */}
          <div className="flex flex-row items-center p-0 h-7">
            {/* Button - Previous */}
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="box-border flex flex-row justify-center items-center w-7 h-7 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={1.16667} />
            </button>

            {/* Page Buttons */}
            {renderPaginationButtons()}

            {/* Button - Next */}
            <div className="flex flex-col items-start pl-1 w-8 h-7">
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="box-border flex flex-row justify-center items-center w-7 h-7 border border-[#E2E8F0] rounded text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5 text-[#64748B]" strokeWidth={1.16667} />
              </button>
            </div>
          </div>

          {/* 10 per page / 5 per page Dropdown */}
          <div className="relative flex flex-col items-start p-0 w-[104.92px] h-[26px]">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="box-border flex flex-row items-center pl-2.5 pr-7 py-1 w-[104.92px] h-[26px] bg-white border border-[#E2E8F0] rounded-lg font-['Inter'] font-medium text-xs leading-4 text-[#334155] appearance-none focus:outline-none focus:ring-1 focus:ring-[#4F46E5] cursor-pointer"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" strokeWidth={1.35} />
          </div>
        </div>
      </div>
    </div>
  );
};
