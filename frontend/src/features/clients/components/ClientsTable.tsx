import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import { Client, ClientSortOption } from '../types/clients';

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
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible',
      }}
    >
      {/* Table Action Header: Title and Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 20px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Left Heading */}
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '24px',
            letterSpacing: '-0.4px',
            color: '#0F172A',
            margin: 0,
          }}
        >
          Clients ({totalCount})
        </h2>

        {/* Right Controls: Sort by and Export */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
          {/* Sort By Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#64748B',
                whiteSpace: 'nowrap',
              }}
            >
              Sort by
            </span>
            <div style={{ position: 'relative' }}>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as ClientSortOption)}
                style={{
                  height: '30px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '4px 28px 4px 12px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1E293B',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="onboarding-desc">Onboarding Date (Newest)</option>
                <option value="onboarding-asc">Onboarding Date (Oldest)</option>
                <option value="client-asc">Client Name (A - Z)</option>
                <option value="client-desc">Client Name (Z - A)</option>
                <option value="company-asc">Company Name (A - Z)</option>
                <option value="id-asc">Client ID (Ascending)</option>
                <option value="id-desc">Client ID (Descending)</option>
              </select>
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                <ChevronDown size={14} color="#94A3B8" />
              </div>
            </div>
          </div>

          {/* Export Button */}
          <ExportButton onClick={onExport} />
        </div>
      </div>

      {/* Table Container with Horizontal Scrolling */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          position: 'relative',
        }}
      >
        <table
          style={{
            width: '1749px',
            minWidth: '1749px',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontFamily: "'Inter', sans-serif",
            whiteSpace: 'nowrap',
          }}
        >
          {/* Header Row */}
          <thead>
            <tr
              style={{
                height: '42px',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                borderBottom: '1px solid #E2E8F0',
                whiteSpace: 'nowrap',
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
              <th style={{ width: '86.23px', padding: '12px 16px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.55px', textTransform: 'uppercase', textAlign: 'center' }}>
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
                const isMenuOpen = activeMenuId === client.id;

                return (
                  <tr
                    key={client.id}
                    style={{
                      height: '51px',
                      borderBottom: '1px solid #F1F5F9',
                      transition: 'background-color 0.15s ease',
                    }}
                    className="hover:bg-slate-50/70"
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
                        onClick={() => onViewClient(client)}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 600,
                          lineHeight: '19px',
                          color: '#2563EB',
                          cursor: 'pointer',
                        }}
                        className="hover:underline"
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
                          color: '#334155',
                        }}
                      >
                        {client.contactPerson}
                      </span>
                    </td>

                    {/* EMAIL */}
                    <td style={{ width: '183.7px', padding: '15px 16px', boxSizing: 'border-box' }}>
                      <a
                        href={`mailto:${client.email}`}
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 400,
                          lineHeight: '19px',
                          color: '#2563EB',
                          textDecoration: 'none',
                        }}
                        className="hover:underline"
                      >
                        {client.email}
                      </a>
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

                    {/* ACTIONS */}
                    <td
                      style={{
                        width: '86.23px',
                        padding: '12px 16px',
                        boxSizing: 'border-box',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : client.id);
                        }}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        className="hover:bg-slate-100"
                        title="Actions"
                      >
                        <MoreVertical size={16} color="#94A3B8" />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '20px',
                            top: '40px',
                            width: '140px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                            zIndex: 50,
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onViewClient(client);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              fontSize: '12px',
                              color: '#334155',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-slate-100"
                          >
                            <Eye size={14} color="#64748B" />
                            <span>View Details</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onEditClient(client);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              fontSize: '12px',
                              color: '#334155',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-slate-100"
                          >
                            <Edit size={14} color="#64748B" />
                            <span>Edit Client</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onDeleteClient(client.id);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '6px 8px',
                              fontSize: '12px',
                              color: '#EF4444',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'left',
                            }}
                            className="hover:bg-red-50"
                          >
                            <Trash2 size={14} color="#EF4444" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Showing Range */}
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Showing <span style={{ fontWeight: 600, color: '#1E293B' }}>{startRange} – {endRange}</span> of{' '}
          <span style={{ fontWeight: 600, color: '#1E293B' }}>{totalCount}</span> clients
        </div>

        {/* Center / Right: Page Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage <= 1 ? '#CBD5E1' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={14} />
            </button>

            {getPageNumbers().map((p) => {
              const isActive = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: isActive ? 'none' : '1px solid #E2E8F0',
                    backgroundColor: isActive ? '#4F46E5' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: currentPage >= totalPages ? '#CBD5E1' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Page Size Select */}
          <div style={{ position: 'relative' }}>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                height: '30px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '4px 26px 4px 10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                color: '#475569',
                outline: 'none',
                appearance: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={8}>8 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <ChevronDown size={14} color="#94A3B8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
