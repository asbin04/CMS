import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { Invoice } from '../types';
import { formatRupee } from '../utils';

interface ViewInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = ({
  isOpen,
  invoice,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const subtotal = Math.round(invoice.invoiceAmount / 1.18);
  const gst = invoice.invoiceAmount - subtotal;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(3px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#0D172E',
            color: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="#818CF8" />
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '24px',
                  margin: 0,
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Invoice preview — {invoice.id}
              </h3>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: "'Inter', sans-serif" }}>
                Issued by KALPANAAA Software Solutions Pvt. Ltd.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Invoice Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, fontFamily: "'Inter', sans-serif" }}>
          {/* Top Info */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '24px',
              borderBottom: '1px solid #F1F5F9',
              paddingBottom: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: 700, letterSpacing: '0.5px' }}>
                Billed to
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: '20px', color: '#0F172A', marginTop: '4px' }}>
                {invoice.client}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px', color: '#64748B', marginTop: '2px' }}>Client ID: {invoice.clientId}</div>
              <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px', color: '#64748B', marginTop: '2px' }}>GSTIN: 27AABCK1234D1Z5</div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px', color: '#64748B' }}>
                Invoice Date: <strong style={{ color: '#0F172A', fontWeight: 600 }}>{invoice.invoiceDate}</strong>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px', color: '#64748B', marginTop: '4px' }}>
                Due Date:{' '}
                <strong style={{ color: invoice.status === 'Overdue' ? '#DC2626' : '#0F172A', fontWeight: 600 }}>
                  {invoice.dueDate}
                </strong>
              </div>
              <div style={{ marginTop: '8px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: 600,
                    lineHeight: '16px',
                    backgroundColor: invoice.status === 'Overdue' ? '#FEE2E2' : '#FEF3C7',
                    color: invoice.status === 'Overdue' ? '#DC2626' : '#D97706',
                  }}
                >
                  Status: {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', lineHeight: '16px', marginBottom: '20px', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>DESCRIPTION</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>QTY</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>RATE</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '12px', color: '#0F172A', fontWeight: 400, fontSize: '12px', lineHeight: '16px' }}>
                  Software Engineering & Cloud Architecture Deliverables
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#64748B', fontSize: '12px', lineHeight: '16px' }}>1</td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#64748B', fontSize: '12px', lineHeight: '16px' }}>{formatRupee(subtotal)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#0F172A', fontSize: '12px', lineHeight: '16px' }}>
                  {formatRupee(subtotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Calculation Breakdown */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', lineHeight: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal:</span>
                <span>{formatRupee(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>GST (18%):</span>
                <span>{formatRupee(gst)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: '#0F172A',
                  borderTop: '1px solid #E2E8F0',
                  paddingTop: '8px',
                }}
              >
                <span>Total amount:</span>
                <span>{formatRupee(invoice.invoiceAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 600 }}>
                <span>Amount paid:</span>
                <span>{formatRupee(invoice.amountPaid)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#DC2626',
                  fontWeight: 600,
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '6px',
                }}
              >
                <span>Balance due:</span>
                <span>{formatRupee(invoice.outstanding)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              height: '38px',
              padding: '0 16px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              color: '#334155',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E2E8F0';
            }}
          >
            Close
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '38px',
                padding: '0 16px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: '16px',
                color: '#334155',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
