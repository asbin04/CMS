import React, { useState, useMemo, useEffect } from 'react';
import { X, AlertCircle, FilePlus, Sparkles } from 'lucide-react';
import { Invoice, CollectionStatus } from '../types';
import { collectionsApiService } from '../services/collectionsApiService';
import { SemanticStatusBadge } from '../../../components/ui/SemanticStatusBadge';
import {
  calculateDaysOverdue,
  calculateAgeingBucket,
  calculateStatus,
  getRecommendedAction,
  formatDateToDisplay,
  formatRupee,
} from '../utils';

interface LogPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (newInvoice: Invoice) => void;
}

export const LogPaymentModal: React.FC<LogPaymentModalProps> = ({
  isOpen,
  onClose,
  onSaveInvoice,
}) => {
  // Form fields
  const [invoiceId, setInvoiceId] = useState('');
  const [isLoadingId, setIsLoadingId] = useState(false);
  const [client, setClient] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('2025-03-01');
  const [dueDate, setDueDate] = useState('2025-04-15');
  const [outstanding, setOutstanding] = useState('150000');
  const [statusOverride, setStatusOverride] = useState<string>('auto');
  const [error, setError] = useState('');

  // Fetch suggested next invoice ID from Supabase PostgreSQL whenever modal opens
  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      setIsLoadingId(true);
      setError('');
      const targetYear = invoiceDate ? new Date(invoiceDate).getFullYear() : 2025;
      collectionsApiService
        .getNextInvoiceId(targetYear)
        .then((res) => {
          if (isMounted && res?.nextInvoiceId) {
            setInvoiceId(res.nextInvoiceId);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err?.message || 'Could not fetch next invoice ID from database');
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingId(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOpen]);

  // Live Automatic Calculations derived from form values
  const numOutstanding = useMemo(() => {
    const parsed = parseFloat(outstanding);
    return isNaN(parsed) ? 0 : parsed;
  }, [outstanding]);

  const daysOverdue = useMemo(() => {
    return calculateDaysOverdue(dueDate);
  }, [dueDate]);

  const ageingBucket = useMemo(() => {
    return calculateAgeingBucket(daysOverdue);
  }, [daysOverdue]);

  const calculatedStatus = useMemo(() => {
    return calculateStatus(dueDate, numOutstanding, daysOverdue);
  }, [dueDate, numOutstanding, daysOverdue]);

  const effectiveStatus: CollectionStatus = useMemo(() => {
    if (statusOverride !== 'auto') {
      return statusOverride as CollectionStatus;
    }
    return calculatedStatus;
  }, [statusOverride, calculatedStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceId.trim()) {
      setError('Invoice ID is required.');
      return;
    }

    if (!client.trim()) {
      setError('Client name is required.');
      return;
    }

    if (!invoiceDate) {
      setError('Invoice date is required.');
      return;
    }

    if (!dueDate) {
      setError('Due date is required.');
      return;
    }

    if (isNaN(numOutstanding) || numOutstanding < 0) {
      setError('Outstanding amount cannot be negative.');
      return;
    }

    setError('');

    const newInvoice: Invoice = {
      id: invoiceId.trim().toUpperCase(),
      clientId: invoiceId.trim().replace(/^INV-?/i, 'CL-') || 'CL-CLIENT',
      client: client.trim(),
      invoiceDate: formatDateToDisplay(invoiceDate),
      dueDate: formatDateToDisplay(dueDate),
      invoiceAmount: numOutstanding,
      amountPaid: 0,
      outstanding: numOutstanding,
      daysOverdue: daysOverdue > 0 ? daysOverdue : null,
      ageingBucket,
      status: effectiveStatus,
      recommendedAction: getRecommendedAction(effectiveStatus),
    };

    onSaveInvoice(newInvoice);
    onClose();
  };

  const getAgeingBg = (bucket: string) => {
    switch (bucket) {
      case 'Current':
        return '#F0FDF4';
      case '1–30 days':
        return '#F0FDF4';
      case '31–60 days':
        return '#FFFBEB';
      case '61–90 days':
        return '#FFF7ED';
      case '90+ days':
        return '#FEF2F2';
      default:
        return '#F8FAFC';
    }
  };

  const getAgeingBorder = (bucket: string) => {
    switch (bucket) {
      case 'Current':
        return '#BBF7D0';
      case '1–30 days':
        return '#BBF7D0';
      case '31–60 days':
        return '#FDE68A';
      case '61–90 days':
        return '#FED7AA';
      case '90+ days':
        return '#FECACA';
      default:
        return '#E2E8F0';
    }
  };

  const getAgeingColor = (bucket: string) => {
    switch (bucket) {
      case 'Current':
        return '#16A34A';
      case '1–30 days':
        return '#16A34A';
      case '31–60 days':
        return '#D97706';
      case '61–90 days':
        return '#EA580C';
      case '90+ days':
        return '#DC2626';
      default:
        return '#64748B';
    }
  };

  const renderStatusBadge = (status: CollectionStatus) => {
    return <SemanticStatusBadge status={status} />;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FilePlus size={20} color="#4F46E5" />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: '#0F172A',
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Log payment / new invoice
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 400,
                  lineHeight: '16px',
                  color: '#64748B',
                  margin: '2px 0 0 0',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Enter invoice details to record a new receivable.
              </p>
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
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#0F172A';
              e.currentTarget.style.backgroundColor = '#F1F5F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', overflowY: 'auto' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#DC2626',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Invoice ID & 2. Client Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  color: '#334155',
                  marginBottom: '5px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  1
                </span>
                <span>Invoice ID <span style={{ color: '#EF4444' }}>*</span></span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#059669',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    marginLeft: 'auto',
                  }}
                >
                  <Sparkles size={11} color="#059669" />
                  Auto-Generated
                </span>
              </label>
              <input
                type="text"
                readOnly
                title="Automatically generated sequential ID from Supabase PostgreSQL"
                placeholder={isLoadingId ? 'Generating...' : 'e.g. INV-2025-100'}
                value={isLoadingId ? 'Generating...' : invoiceId}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#F8FAFC',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: isLoadingId ? '#94A3B8' : '#1E293B',
                  cursor: 'default',
                  letterSpacing: '0.4px',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  color: '#334155',
                  marginBottom: '5px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  2
                </span>
                <span>Client Name <span style={{ color: '#EF4444' }}>*</span></span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Zenith Corp Pvt Ltd"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* 3. Invoice Date & 4. Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  color: '#334155',
                  marginBottom: '5px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  3
                </span>
                <span>Invoice Date <span style={{ color: '#EF4444' }}>*</span></span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  color: '#334155',
                  marginBottom: '5px',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  4
                </span>
                <span>Due Date <span style={{ color: '#EF4444' }}>*</span></span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>

          {/* 5. Outstanding Amount */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  lineHeight: '16px',
                  color: '#334155',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: '#4F46E5',
                    backgroundColor: '#EEF2FF',
                    padding: '1px 5px',
                    borderRadius: '4px',
                  }}
                >
                  5
                </span>
                <span>Outstanding (₹) <span style={{ color: '#EF4444' }}>*</span></span>
              </label>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#4F46E5',
                  backgroundColor: '#EEF2FF',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                Formatted: {formatRupee(numOutstanding)}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '9px',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                ₹
              </span>
              <input
                type="number"
                required
                min="0"
                step="1000"
                placeholder="e.g. 150000"
                value={outstanding}
                onChange={(e) => setOutstanding(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px 0 28px',
                  fontSize: '12px',
                  lineHeight: '16px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* 6, 7, 8 Automatic Calculations Panel */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Panel Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    backgroundColor: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={13} color="#4F46E5" />
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#0F172A',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Automatic Calculations
                </span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#4F46E5',
                  backgroundColor: '#EEF2FF',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                Live Preview
              </span>
            </div>

            {/* 3 Metric Cards: 6. Days Overdue, 7. Ageing Bucket, 8. Status */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {/* 6. Days Overdue */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#4F46E5',
                      backgroundColor: '#EEF2FF',
                      padding: '1px 5px',
                      borderRadius: '4px',
                    }}
                  >
                    6
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
                    Days Overdue
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: daysOverdue > 0 ? '#EF4444' : '#10B981',
                      lineHeight: 1,
                    }}
                  >
                    {daysOverdue > 0 ? `${daysOverdue}` : '0'}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      backgroundColor: daysOverdue > 0 ? '#FEF2F2' : '#F0FDF4',
                      border: `1px solid ${daysOverdue > 0 ? '#FECACA' : '#BBF7D0'}`,
                      color: daysOverdue > 0 ? '#EF4444' : '#16A34A',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {daysOverdue > 0 ? 'Days Overdue' : 'Not Overdue'}
                  </span>
                </div>
              </div>

              {/* 7. Ageing Bucket */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#4F46E5',
                      backgroundColor: '#EEF2FF',
                      padding: '1px 5px',
                      borderRadius: '4px',
                    }}
                  >
                    7
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
                    Ageing Bucket
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: getAgeingBg(ageingBucket),
                      border: `1px solid ${getAgeingBorder(ageingBucket)}`,
                      color: getAgeingColor(ageingBucket),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ageingBucket}
                  </span>
                </div>
              </div>

              {/* 8. Status */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '84px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#4F46E5',
                        backgroundColor: '#EEF2FF',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      8
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>
                      Status
                    </span>
                  </div>
                  <select
                    value={statusOverride}
                    onChange={(e) => setStatusOverride(e.target.value)}
                    title="Change or override status"
                    style={{
                      fontSize: '10px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '4px',
                      padding: '1px 4px',
                      color: statusOverride === 'auto' ? '#64748B' : '#4F46E5',
                      backgroundColor: '#F8FAFC',
                      cursor: 'pointer',
                      outline: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <option value="auto">Auto</option>
                    <option value="Open">Open</option>
                    <option value="Due Soon">Due Soon</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderStatusBadge(effectiveStatus)}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '38px',
                padding: '0 18px',
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
              Cancel
            </button>
            <button
              type="submit"
              style={{
                height: '38px',
                padding: '0 20px',
                borderRadius: '8px',
                backgroundColor: '#4F46E5',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: '16px',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4338CA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4F46E5';
              }}
            >
              Save payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

