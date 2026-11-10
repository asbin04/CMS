import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { UatItem, UpdateUatPayload } from '../types/uat';

interface EditUatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, payload: UpdateUatPayload) => Promise<void>;
  uat: UatItem | null;
  projectOptions: string[];
}

export const EditUatModal: React.FC<EditUatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  uat,
  projectOptions,
}) => {
  const [projectId, setProjectId] = useState('PRJ-001');
  const [requirementId, setRequirementId] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testCase, setTestCase] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [testerName, setTesterName] = useState('Amit Sharma');
  const [status, setStatus] = useState('Passed');
  const [defectId, setDefectId] = useState('-');
  const [clientApproval, setClientApproval] = useState('Approved');
  const [approvalDate, setApprovalDate] = useState('-');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uat) {
      setProjectId(uat.projectId || 'PRJ-001');
      setRequirementId(uat.requirementId || '');
      setTestDate(uat.testDate || '');
      setTestCase(uat.testCase || '');
      setExpectedResult(uat.expectedResult || '');
      setActualResult(uat.actualResult || '');
      setTesterName(uat.testerName || 'Amit Sharma');
      setStatus(uat.status || 'Passed');
      setDefectId(uat.defectId || '-');
      setClientApproval(uat.clientApproval || 'Approved');
      setApprovalDate(uat.approvalDate || '-');
      setComments(uat.comments || '');
    }
  }, [uat]);

  if (!isOpen || !uat) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testCase.trim()) {
      setError('Test Case ID is required');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(uat.id, {
        projectId,
        requirementId: requirementId.trim(),
        testDate: testDate.trim(),
        testCase: testCase.trim(),
        expectedResult: expectedResult.trim(),
        actualResult: actualResult.trim(),
        testerName,
        status,
        defectId: defectId.trim() || '-',
        clientApproval,
        approvalDate: approvalDate.trim() || '-',
        comments: comments.trim() || '-',
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update UAT record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">Edit UAT: {uat.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {projectOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Requirement ID</label>
              <input
                type="text"
                value={requirementId}
                onChange={(e) => setRequirementId(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Test Case</label>
              <input
                type="text"
                value={testCase}
                onChange={(e) => setTestCase(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Test Date</label>
              <input
                type="text"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Expected Result</label>
            <textarea
              rows={2}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Actual Result</label>
            <textarea
              rows={2}
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tester Name</label>
              <select
                value={testerName}
                onChange={(e) => setTesterName(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Amit Sharma">Amit Sharma (AS)</option>
                <option value="Sneha Nair">Sneha Nair (SN)</option>
                <option value="Divya Patel">Divya Patel (DP)</option>
                <option value="Rohan Verma">Rohan Verma (RV)</option>
                <option value="Vikram Shah">Vikram Shah (VK)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Passed">Passed</option>
                <option value="In Testing">In Testing</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Defect ID (or -)</label>
              <input
                type="text"
                value={defectId}
                onChange={(e) => setDefectId(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client Approval</label>
              <select
                value={clientApproval}
                onChange={(e) => setClientApproval(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Approval Date</label>
              <input
                type="text"
                value={approvalDate}
                onChange={(e) => setApprovalDate(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Comments</label>
              <input
                type="text"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

