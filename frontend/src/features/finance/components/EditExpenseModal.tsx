import React, { useState, useEffect } from 'react';
import { ExpenseItem, UpdateExpensePayload } from '../types/expenses';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: ExpenseItem | null;
  onClose: () => void;
  onSubmit: (id: number, payload: UpdateExpensePayload) => Promise<void>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
  onSubmit,
}) => {
  const [expenseDate, setExpenseDate] = useState('');
  const [category, setCategory] = useState('Software');
  const [vendorId, setVendorId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [description, setDescription] = useState('');
  const [amountBeforeTax, setAmountBeforeTax] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState('Card');
  const [status, setStatus] = useState('Approved');
  const [approvedBy, setApprovedBy] = useState('');
  const [expenseBucket, setExpenseBucket] = useState('Operational');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setExpenseDate(expense.expenseDate || '');
      setCategory(expense.category || 'Software');
      setVendorId(expense.vendorId || '');
      setProjectId(expense.projectId || '');
      setEmployeeId(expense.employeeId || '');
      setDescription(expense.description || '');
      setAmountBeforeTax(expense.amountBeforeTax || 0);
      setTaxAmount(expense.taxAmount || 0);
      setPaymentMode(expense.paymentMode || 'Card');
      setStatus(expense.status || 'Approved');
      setApprovedBy(expense.approvedBy || '');
      setExpenseBucket(expense.expenseBucket || 'Operational');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleAmountChange = (val: number) => {
    setAmountBeforeTax(val);
    setTaxAmount(Number((val * 0.18).toFixed(2)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Description is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(expense.id, {
        expenseDate,
        category,
        vendorId: vendorId.trim() || undefined,
        projectId: projectId.trim() || undefined,
        employeeId: employeeId.trim() || undefined,
        description: description.trim(),
        amountBeforeTax,
        taxAmount,
        totalAmount: Number((amountBeforeTax + taxAmount).toFixed(2)),
        paymentMode,
        status,
        approvedBy: approvedBy.trim() || undefined,
        expenseBucket,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-800">Edit Expense: {expense.expenseCode}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Date *</label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Software">Software</option>
                <option value="Travel">Travel</option>
                <option value="Utilities">Utilities</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Hardware">Hardware</option>
                <option value="Marketing">Marketing</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Vendor ID</label>
              <input
                type="text"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Project ID</label>
              <input
                type="text"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Amount Before Tax (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amountBeforeTax || ''}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={taxAmount || ''}
                onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Total (₹)</label>
              <div className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-center font-bold">
                {(amountBeforeTax + taxAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expense Bucket</label>
              <select
                value={expenseBucket}
                onChange={(e) => setExpenseBucket(e.target.value)}
                className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Operational">Operational</option>
                <option value="Project">Project</option>
                <option value="General">General</option>
                <option value="Capital">Capital</option>
                <option value="Marketing">Marketing</option>
                <option value="People">People</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs text-slate-800"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

