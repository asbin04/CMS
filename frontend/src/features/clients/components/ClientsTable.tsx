import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Client, ClientSortOption } from '../types/clients';
import { TableActionMenu } from '../../../components/ui/TableActionMenu';

interface ClientsTableProps {
  clients: Client[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  sortBy: ClientSortOption;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSortChange: (sort: ClientSortOption) => void;
  onViewClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onExport: () => void;
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  totalCount,
  currentPage,
  pageSize,
  sortBy,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onViewClient,
  onEditClient,
  onDeleteClient,
  onExport,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#059669',
        };
      case 'Pending':
      case 'New':
        return {
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          color: '#D97706',
        };
      case 'Prospect':
        return {
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#2563EB',
        };
      case 'Suspended':
        return {
          backgroundColor: '#FFF1F2',
          border: '1px solid #FECDD3',
          color: '#F43F5E',
        };
      case 'Inactive':
      default:
        return {
          backgroundColor: '#F1F5F9',
          border: '1px solid #E2E8F0',
          color: '#64748B',
        };
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startRange = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Table Action Header: Title and Controls */}
      <div className="px-4 sm:px-5 pt-2 sm:pt-2.5 pb-3 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
        {/* Left Heading */}
        <div className="flex items-center gap-3">
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '16px',
              lineHeight: '24px',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.4px',
              color: '#0F172A',
              margin: 0,
            }}
          >
            Clients ({totalCount})
          </h2>
        </div>

        {/* Right Controls: Sort by and Export */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Sort by
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ClientSortOption)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
              >
                <option value="onboarding-desc">Onboarding Date (Newest)</option>
                <option value="onboarding-asc">Onboarding Date (Oldest)</option>
                <option value="client-asc">Client Name (A - Z)</option>
                <option value="client-desc">Client Name (Z - A)</option>
                <option value="company-asc">Company Name (A - Z)</option>
                <option value="id-asc">Client ID (Ascending)</option>
                <option value="id-desc">Client ID (Descending)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <Download size={14} className="text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div
        className="w-full overflow-x-auto relative horizontal-table-scroll custom-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <table
          style={{
            width: '1749px',
            minWidth: '1749px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Header Row */}
          <thead>
            <tr
              style={{
                height: '42px',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <th style={{ width: '90.45px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CLIENT ID
              </th>
              <th style={{ width: '111.75px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CLIENT CODE
              </th>
              <th style={{ width: '152.52px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CLIENT NAME
              </th>
              <th style={{ width: '167.83px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                COMPANY NAME
              </th>
              <th style={{ width: '141.72px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                INDUSTRY
              </th>
              <th style={{ width: '142px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CONTACT PERSON
              </th>
              <th style={{ width: '183.7px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                EMAIL
              </th>
              <th style={{ width: '136.72px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                PHONE
              </th>
              <th style={{ width: '92.06px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                COUNTRY
              </th>
              <th style={{ width: '97.25px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CITY
              </th>
              <th style={{ width: '109.81px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                CLIENT TYPE
              </th>
              <th style={{ width: '139.95px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase' }}>
                ACCOUNT OWNER
              </th>
              <th style={{ width: '97.03px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase', textAlign: 'center' }}>
                STATUS
              </th>
              {/* Sticky Right Actions Column Header */}
              <th
                className="sticky right-0 z-20 bg-[#F8FAFC] shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)] border-l border-[#E2E8F0]"
                style={{ width: '90px', minWidth: '90px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase', textAlign: 'center' }}
              >
                ACTIONS
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={14} style={{ padding: '40px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                  No clients match the current filters.
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const badgeStyle = getStatusBadgeStyle(client.status);

                return (
                  <tr
                    key={client.id}
                    style={{
                      height: '51px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50/70 group"
                  >
                    {/* CLIENT ID */}
                    <td style={{ width: '90.45px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        onClick={() => onViewClient(client)}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 500,
                          lineHeight: '19px',
                          color: '#2563EB',
                          cursor: 'pointer',
                        }}
                        className="hover:underline"
                      >
                        {client.id}
                      </span>
                    </td>

                    {/* CLIENT CODE */}
                    <td style={{ width: '111.75px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.clientCode}
                      </span>
                    </td>

                    {/* CLIENT NAME */}
                    <td style={{ width: '152.52px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          lineHeight: '19px',
                          color: '#0F172A',
                        }}
                      >
                        {client.clientName}
                      </span>
                    </td>

                    {/* COMPANY NAME */}
                    <td style={{ width: '167.83px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.companyName}
                      </span>
                    </td>

                    {/* INDUSTRY */}
                    <td style={{ width: '141.72px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.industry}
                      </span>
                    </td>

                    {/* CONTACT PERSON */}
                    <td style={{ width: '142px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.contactPerson}
                      </span>
                    </td>

                    {/* EMAIL */}
                    <td style={{ width: '183.7px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#2563EB',
                        }}
                      >
                        {client.email}
                      </span>
                    </td>

                    {/* PHONE */}
                    <td style={{ width: '136.72px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.phone}
                      </span>
                    </td>

                    {/* COUNTRY */}
                    <td style={{ width: '92.06px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.country}
                      </span>
                    </td>

                    {/* CITY */}
                    <td style={{ width: '97.25px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.city}
                      </span>
                    </td>

                    {/* CLIENT TYPE */}
                    <td style={{ width: '109.81px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.clientType}
                      </span>
                    </td>

                    {/* ACCOUNT OWNER */}
                    <td style={{ width: '139.95px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <span
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#475569',
                        }}
                      >
                        {client.accountOwner}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td
                      style={{
                        width: '97.03px',
                        padding: '14px 16px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          height: '23px',
                          ...badgeStyle,
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            lineHeight: '16px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {client.status}
                        </span>
                      </div>
                    </td>

                    {/* Sticky Right ACTIONS Column */}
                    <td
                      className="sticky right-0 z-10 bg-white group-hover:bg-slate-50/70 shadow-[-2px_0_4px_-1px_rgba(0,0,0,0.06)] border-l border-[#E2E8F0] transition-colors"
                      style={{
                        width: '90px',
                        minWidth: '90px',
                        padding: '10px 16px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                      }}
                    >
                      <div className="flex items-center justify-center">
                        <TableActionMenu
                          isOpen={activeMenuId === client.id}
                          onToggle={() => setActiveMenuId((prev) => (prev === client.id ? null : client.id))}
                          onClose={() => setActiveMenuId((prev) => (prev === client.id ? null : prev))}
                          onViewDetails={() => onViewClient(client)}
                          onEdit={() => onEditClient(client)}
                          onDelete={() => onDeleteClient(client.id)}
                          viewLabel="View Details"
                          editLabel="Edit Client"
                          deleteLabel="Delete"
                          ariaLabel={`Actions for ${client.clientName}`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 sm:px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
        {/* Left: Showing Range */}
        <div>
          Showing <span className="font-semibold text-slate-800">{startRange} – {endRange}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> clients
        </div>

        {/* Center / Right: Page Controls */}
        <div className="flex items-center gap-4">
          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft size={15} />
            </button>

            {getPageNumbers().map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#4F46E5] text-white shadow-xs'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Page Size Select */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
