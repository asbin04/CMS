import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { InvoiceFilters } from '../types';

interface MoreFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: InvoiceFilters;
  onApply: (advanced: Partial<InvoiceFilters>) => void;
  onReset: () => void;
}

export const MoreFiltersModal: React.FC<MoreFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [dueDate, setDueDate] = useState(filters.dueDate || '');
  const [paymentTerms, setPaymentTerms] = useState(filters.paymentTerms || 'All');
  const [agingBucket, setAgingBucket] = useState(filters.agingBucket || 'All');
  const [outstandingOnly, setOutstandingOnly] = useState(filters.outstandingOnly || false);
  const [minAmount, setMinAmount] = useState(filters.minAmount || '');
  const [maxAmount, setMaxAmount] = useState(filters.maxAmount || '');

  // Synchronize local state when modal opens or parent filters change
  useEffect(() => {
    if (isOpen) {
      setDueDate(filters.dueDate || '');
      setPaymentTerms(filters.paymentTerms || 'All');
      setAgingBucket(filters.agingBucket || 'All');
      setOutstandingOnly(filters.outstandingOnly || false);
      setMinAmount(filters.minAmount || '');
      setMaxAmount(filters.maxAmount || '');
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      dueDate,
      paymentTerms,
      agingBucket,
      outstandingOnly,
      minAmount,
      maxAmount,
    });
    onClose();
  };

  const handleCancel = () => {
    // Revert local changes and close without applying
    setDueDate(filters.dueDate || '');
    setPaymentTerms(filters.paymentTerms || 'All');
    setAgingBucket(filters.agingBucket || 'All');
    setOutstandingOnly(filters.outstandingOnly || false);
    setMinAmount(filters.minAmount || '');
    setMaxAmount(filters.maxAmount || '');
    onClose();
  };

  const handleReset = () => {
    setDueDate('');
    setPaymentTerms('All');
    setAgingBucket('All');
    setOutstandingOnly(false);
    setMinAmount('');
    setMaxAmount('');
    onReset();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">More Filters</h3>
              <p className="text-xs text-slate-500">Filter invoices by advanced payment and aging criteria</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Due Date</label>
            <input
              type="date"
              aria-label="Due Date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
            />
          </div>

          {/* Payment Terms Days */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Payment Terms</label>
            <select
              aria-label="Payment Terms"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
            >
              <option value="All">All Payment Terms</option>
              <option value="10">10 Days</option>
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="45">45 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>

          {/* Aging Bucket */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Aging Bucket</label>
            <select
              aria-label="Aging Bucket"
              value={agingBucket}
              onChange={(e) => setAgingBucket(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
              style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
            >
              <option value="All">All Aging Buckets</option>
              <option value="1 - 30 Days">1 - 30 Days</option>
              <option value="31 - 60 Days">31 - 60 Days</option>
              <option value="61 - 90 Days">61 - 90 Days</option>
              <option value="90+ Days">90+ Days</option>
              <option value="No Due Date">No Due Date</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Total Amount Range (₹)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Amount (₹)"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
              />
              <input
                type="number"
                placeholder="Max Amount (₹)"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[12px] bg-white text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                style={{ border: '1px solid #E2E8F0', borderRadius: '12px' }}
              />
            </div>
          </div>

          {/* Outstanding Only */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={outstandingOnly}
                onChange={(e) => setOutstandingOnly(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-700">
                Show outstanding invoices only (Outstanding Amount &gt; 0)
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#E2E8F0] bg-slate-50">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-200 rounded-[12px] text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              style={{ borderRadius: '12px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[12px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              style={{ borderRadius: '12px' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

