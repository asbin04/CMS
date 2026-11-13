import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Upload,
  FileText,
  ShieldCheck,
  User,
  Package,
  BarChart2,
  Folder,
  Users,
  Menu as MenuIcon,
  Timer,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { PriorityCard, PriorityLevel } from '@/components/ui/PriorityCard';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { HealthBadge } from '@/components/ui/HealthBadge';
import { followUpService } from '@/services/followUpService';
import {
  FollowUpItemData,
  FollowUpSummaryData,
  Priority,
  HealthStatus,
} from '@/types/followUp';

export type { Priority, HealthStatus };
export type QueueItem = FollowUpItemData;

// Icon helper function for dynamic modules
const renderModuleIcon = (moduleCode?: string, moduleName?: string) => {
  const code = (moduleCode || '').toUpperCase();
  const name = (moduleName || '').toLowerCase();

  if (code === 'INVOICES' || name.includes('invoice')) {
    return <FileText className="w-4 h-4 text-[#EF4444] stroke-[1.33]" />;
  }
  if (code === 'COMPLIANCE' || name.includes('compliance')) {
    return <ShieldCheck className="w-4 h-4 text-[#10B981] stroke-[1.33]" />;
  }
  if (code === 'APPROVALS' || name.includes('approval')) {
    return <User className="w-4 h-4 text-[#6366F1] stroke-[1.33]" />;
  }
  if (code === 'DOCUMENTS' || name.includes('document')) {
    return <FileText className="w-4 h-4 text-[#3B82F6] stroke-[1.33]" />;
  }
  if (code === 'ASSETS' || name.includes('asset')) {
    return <Package className="w-4 h-4 text-[#0D9488] stroke-[1.33]" />;
  }
  if (code === 'OPPORTUNITIES' || name.includes('opportunit')) {
    return <BarChart2 className="w-4 h-4 text-[#2563EB] stroke-[1.33]" />;
  }
  if (code === 'PROJECT_CONTROL' || name.includes('project')) {
    return <Folder className="w-4 h-4 text-[#3B82F6] stroke-[1.33]" />;
  }
  if (code === 'CANDIDATES' || name.includes('candidate')) {
    return <Users className="w-4 h-4 text-[#9333EA] stroke-[1.33]" />;
  }
  return <FileText className="w-4 h-4 text-[#2563EB] stroke-[1.33]" />;
};

// Route mapping for module navigation
const MODULE_ROUTES: Record<string, string> = {
  INVOICES: '/management/collections',
  APPROVALS: '/management/approval-inbox',
  OPPORTUNITIES: '/sales/opportunities',
  CANDIDATES: '/hr/employee-master',
};

interface FollowUpQueuePageProps {
  searchQuery?: string;
  onSearchClear?: () => void;
}

export const FollowUpQueuePage: React.FC<FollowUpQueuePageProps> = (props) => {
  const navigate = useNavigate();

  let context: { searchQuery?: string; onSearchClear?: () => void } | null = null;
  try {
    context = useOutletContext<{ searchQuery?: string; onSearchClear?: () => void }>();
  } catch {
    context = null;
  }
  const searchQuery = props.searchQuery ?? context?.searchQuery ?? '';
  const onSearchClear = props.onSearchClear ?? context?.onSearchClear;

  const [items, setItems] = useState<FollowUpItemData[]>([]);
  const [summary, setSummary] = useState<FollowUpSummaryData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<PriorityLevel | 'all'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('—');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeModalItem, setActiveModalItem] = useState<FollowUpItemData | null>(null);
  const [actionNote, setActionNote] = useState<string>('');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const formatTimestamp = (date: Date = new Date()) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fetch items and summary from backend database
  const loadData = useCallback(async (isRefreshAction = false) => {
    if (isRefreshAction) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [fetchedItems, fetchedSummary] = await Promise.all([
        followUpService.getItems(),
        followUpService.getSummary(),
      ]);

      setItems(fetchedItems);
      setSummary(fetchedSummary);

      if (fetchedSummary.lastRefreshed) {
        setLastRefreshed(formatTimestamp(new Date(fetchedSummary.lastRefreshed)));
      } else {
        setLastRefreshed(formatTimestamp());
      }

      if (isRefreshAction) {
        showToast('Queue data refreshed successfully from database');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to backend';
      setErrorMessage(msg);
      showToast('Error connecting to backend database');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalItem) {
        setActiveModalItem(null);
      }
    };
    if (activeModalItem) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalItem]);

  const handleRefresh = () => {
    loadData(true);
  };

  const handleResetData = async () => {
    setIsLoading(true);
    try {
      await followUpService.resetData();
      await loadData();
      showToast('Follow-up queue reset to default data');
    } catch {
      showToast('Failed to reset queue data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const headers = [
      'ID',
      'Module',
      'Subtitle',
      'Count',
      'Key Information',
      'Key Details',
      'Priority',
      'Health',
      'Days Since Last Follow-up',
      'Status',
    ];
    const rows = filteredItems.map((i) => [
      i.id,
      `"${i.moduleName}"`,
      `"${i.moduleSub || ''}"`,
      i.count,
      `"${i.keyInfoTitle}"`,
      `"${i.keyInfoSub || ''}"`,
      i.priority,
      i.health,
      `"${i.daysSinceLastFollowUp}"`,
      i.isDone ? 'Completed' : 'Pending',
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\r\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `follow_up_queue_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported CSV file successfully');
  };

  const handleToggleDone = async (id: number | string) => {
    try {
      const updated = await followUpService.toggleDone(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      // Refresh summary counts
      const updatedSummary = await followUpService.getSummary();
      setSummary(updatedSummary);

      showToast(
        updated.isDone
          ? `Marked "${updated.moduleName}" as done`
          : `Reopened "${updated.moduleName}"`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update follow-up status';
      showToast(msg);
    }
  };

  const handlePerformAction = async (item: FollowUpItemData, actionType: string) => {
    setIsSubmittingAction(true);
    try {
      const updated = await followUpService.performAction(item.id, {
        action: actionType,
        notes: actionNote.trim() || undefined,
      });

      setItems((prev) => prev.map((it) => (it.id === item.id ? updated : it)));
      const updatedSummary = await followUpService.getSummary();
      setSummary(updatedSummary);

      showToast(`Action recorded for "${item.moduleName}"`);
      setActiveModalItem(null);
      setActionNote('');
    } catch {
      showToast('Failed to record action');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handlePrimaryAction = (item: FollowUpItemData) => {
    if (item.primaryActionLabel === 'Mark Follow-up Done' || item.isDone) {
      handleToggleDone(item.id);
    } else {
      setActionNote('');
      setActiveModalItem(item);
    }
  };

  const handleSecondaryAction = (item: FollowUpItemData) => {
    const code = (item.moduleCode || '').toUpperCase();
    const route = MODULE_ROUTES[code];
    if (route) {
      navigate(route);
    }
  };

  // Dynamic Filtering: Search + Priority Cards
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter =
        selectedFilter === 'all' || item.priority.toLowerCase() === selectedFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.moduleName.toLowerCase().includes(query) ||
        (item.moduleSub && item.moduleSub.toLowerCase().includes(query)) ||
        item.keyInfoTitle.toLowerCase().includes(query) ||
        (item.keyInfoSub && item.keyInfoSub.toLowerCase().includes(query)) ||
        item.priority.toLowerCase().includes(query) ||
        item.health.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [items, selectedFilter, searchQuery]);

  // Priority counts calculation: dynamically derived from backend summary or live items
  const highCount = useMemo(() => {
    if (summary) return summary.highPriorityCount;
    return items
      .filter((i) => i.priority === 'High' && !i.isDone)
      .reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [summary, items]);

  const mediumCount = useMemo(() => {
    if (summary) return summary.mediumPriorityCount;
    return items
      .filter((i) => i.priority === 'Medium' && !i.isDone)
      .reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [summary, items]);

  const lowCount = useMemo(() => {
    if (summary) return summary.lowPriorityCount;
    return items
      .filter((i) => i.priority === 'Low' && !i.isDone)
      .reduce((acc, curr) => acc + (curr.count || 0), 0);
  }, [summary, items]);

  return (
    <div
      className="w-full min-w-0 max-w-full flex flex-col items-start p-6 gap-6 box-border bg-[#F8FAFC]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Item Details Interactive Modal */}
      {activeModalItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModalItem(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${activeModalItem.iconBg || 'bg-[#EFF6FF]'}`}
                >
                  {renderModuleIcon(activeModalItem.moduleCode, activeModalItem.moduleName)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A] m-0">
                    {activeModalItem.moduleName}
                  </h3>
                  <p className="font-normal text-xs text-[#64748B] m-0">
                    {activeModalItem.moduleSub}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex flex-col gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Key Information
                  </span>
                  <PriorityBadge priority={activeModalItem.priority} />
                </div>
                <p className="font-bold text-sm text-slate-900 m-0">
                  {activeModalItem.keyInfoTitle}
                </p>
                <p className="text-slate-500 m-0">{activeModalItem.keyInfoSub}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    Pending Count
                  </span>
                  <p className="font-bold text-sm text-slate-800 m-0 mt-0.5">
                    {activeModalItem.count} items
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-center">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase mb-1">
                    Follow-Up Health
                  </span>
                  <div>
                    <HealthBadge status={activeModalItem.health} />
                  </div>
                </div>
              </div>

              {/* Action Notes Input */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="action-notes"
                  className="font-semibold text-[11px] text-slate-700 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Log Follow-up Note (Saved to Database)</span>
                </label>
                <textarea
                  id="action-notes"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Enter notes or updates for this follow-up item..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Existing Notes History if available */}
              {activeModalItem.notes && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">
                    Previous Activity Log
                  </span>
                  <p className="text-slate-700 whitespace-pre-wrap text-[11px] m-0 mt-1">
                    {activeModalItem.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-medium text-xs text-slate-600 hover:bg-white transition-colors"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                {actionNote.trim() && (
                  <button
                    type="button"
                    disabled={isSubmittingAction}
                    onClick={() => handlePerformAction(activeModalItem, 'LOG_NOTE')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
                  >
                    Save Note
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmittingAction}
                  onClick={() => {
                    if (actionNote.trim()) {
                      handlePerformAction(
                        activeModalItem,
                        activeModalItem.isDone ? 'REOPEN' : 'MARK_DONE'
                      );
                    } else {
                      handleToggleDone(activeModalItem.id);
                      setActiveModalItem(null);
                    }
                  }}
                  className={`px-4 py-2 text-white rounded-lg font-medium text-xs shadow-sm transition-colors disabled:opacity-50 ${
                    activeModalItem.isDone
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
                  }`}
                >
                  {activeModalItem.isDone ? 'Reopen Follow-up' : 'Mark Follow-up Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Header: Title & Refresh Button */}
      <div className="flex flex-row justify-between items-center p-0 w-full h-[46px]">
        {/* Left: Icon & Titles */}
        <div className="flex flex-row items-center p-0 gap-3 h-[46px]">
          {/* Amber Icon Box: 44px x 44px */}
          <div className="box-border flex flex-row justify-center items-center p-0 w-[44px] h-[44px] bg-[#FFFBEB] border border-[rgba(253,230,138,0.8)] rounded-xl shrink-0">
            <svg
              className="w-6 h-6 text-[#F59E0B]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-4h2l-3-5v4H9z" fill="#F59E0B" stroke="none" />
            </svg>
          </div>

          {/* Titles */}
          <div className="flex flex-col items-start p-0 h-[46px] justify-center">
            <h1
              className="font-bold text-2xl leading-[30px] text-[#0F172A] m-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Follow-Up Queue
            </h1>
            <p
              className="font-normal text-xs leading-4 text-[#64748B] m-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Track pending actions across your business modules.
            </p>
          </div>
        </div>

        {/* Right: Timestamp & Refresh Button */}
        <div className="flex flex-row items-center p-0 gap-3 h-[30px]">
          <div className="flex flex-row items-center p-0 gap-1.5 h-4">
            <span
              className="font-normal text-xs leading-4 text-[#94A3B8]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Last Refreshed: {lastRefreshed}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Refresh timestamp"
              className="hover:text-slate-700 transition-colors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#64748B] stroke-[1.17] ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="box-border flex flex-row items-center px-3 py-1.5 gap-1.5 h-[30px] w-[90.98px] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)] justify-center"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#64748B] stroke-[1.17] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span
              className="font-semibold text-xs leading-4 text-[#334155] text-center"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Refresh
            </span>
          </button>
        </div>
      </div>

      {/* Error Banner if connection fails */}
      {errorMessage && (
        <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => handleResetData()}
                className="px-3 py-1 bg-white border border-red-300 hover:bg-red-100 text-red-700 rounded-lg font-medium text-xs transition-colors"
              >
                Reset Seed Data
              </button>
            )}
            <button
              type="button"
              onClick={() => loadData()}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-xs transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* 3 Summary KPI Cards: 86px height */}
      <div className="flex flex-col md:flex-row justify-center items-start p-0 gap-5 w-full min-h-[86px]">
        <PriorityCard
          level="high"
          title="High Priority"
          subtitle="Items that need immediate attention"
          count={highCount}
          icon={<AlertTriangle className="w-6 h-6 stroke-[2]" />}
          isActive={selectedFilter === 'high'}
          onClick={() => setSelectedFilter(selectedFilter === 'high' ? 'all' : 'high')}
        />
        <PriorityCard
          level="medium"
          title="Medium Priority"
          subtitle="Items due soon"
          count={mediumCount}
          icon={<Timer className="w-6 h-6 stroke-[2]" />}
          isActive={selectedFilter === 'medium'}
          onClick={() => setSelectedFilter(selectedFilter === 'medium' ? 'all' : 'medium')}
        />
        <PriorityCard
          level="low"
          title="Low Priority"
          subtitle="Items to keep on track"
          count={lowCount}
          icon={<RotateCcw className="w-6 h-6 stroke-[2]" />}
          isActive={selectedFilter === 'low'}
          onClick={() => setSelectedFilter(selectedFilter === 'low' ? 'all' : 'low')}
        />
      </div>

      {/* Follow-Up Queue Table Section */}
      <div className="box-border flex flex-col items-start p-0 w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Table Section Header: 69px height */}
        <div className="box-border flex flex-row items-center justify-between px-6 py-4 w-full h-[69px] border-b border-[#F1F5F9]">
          <div className="flex flex-row items-center gap-3.5">
            <div className="flex flex-row justify-center items-center w-9 h-9 bg-[#EFF6FF] rounded-xl shrink-0">
              <MenuIcon className="w-5 h-5 text-[#2563EB] stroke-[1.67]" />
            </div>
            <div className="flex flex-col items-start p-0">
              <h2
                className="font-bold text-sm leading-[18px] text-[#0F172A] m-0 flex items-center gap-2"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Follow-Up Queue
                {selectedFilter !== 'all' && (
                  <span className="font-normal text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span>Priority: {selectedFilter}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFilter('all');
                      }}
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="font-normal text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span>Search: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSearchClear?.();
                      }}
                      className="text-slate-500 hover:text-slate-800 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </h2>
              <p
                className="font-normal text-xs leading-4 text-[#64748B] m-0 mt-0.5"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Quick view of pending items from key modules. Click on a row or use the action button to take action.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="box-border flex flex-row items-center px-3 py-2 gap-1.5 h-[34px] w-[79px] bg-white border border-[#E2E8F0] rounded-lg hover:bg-slate-50 transition-colors shadow-sm justify-center"
            >
              <Upload className="w-4 h-4 text-[#6366F1] stroke-[1.33]" />
              <span
                className="font-medium text-xs leading-4 text-[#334155] text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Export
              </span>
            </button>
          </div>
        </div>

        {/* Table Responsive Wrapper: 1406.23px table width */}
        <div id="follow-up-table-scroll-container" className="w-full overflow-x-auto">
          <table
            style={{ width: '1406.23px', minWidth: '1406.23px', fontFamily: "'Inter', sans-serif" }}
            className="table-fixed text-left border-collapse"
          >
            {/* Column Widths Exact to Spec: 240.06 + 75.14 + 248.58 + 106.47 + 153.84 + 212.41 + 369.73 = 1406.23px */}
            <colgroup>
              <col style={{ width: '240.06px' }} />
              <col style={{ width: '75.14px' }} />
              <col style={{ width: '248.58px' }} />
              <col style={{ width: '106.47px' }} />
              <col style={{ width: '153.84px' }} />
              <col style={{ width: '212.41px' }} />
              <col style={{ width: '369.73px' }} />
            </colgroup>

            {/* Table Header Row: 46px height */}
            <thead>
              <tr className="box-border h-[46px] bg-[#FAFBFC] border-b border-[#F1F5F9]">
                <th
                  style={{ width: '240.06px' }}
                  className="py-3.5 pl-6 pr-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  MODULE
                </th>
                <th
                  style={{ width: '75.14px' }}
                  className="py-3.5 px-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-center select-none"
                >
                  COUNT
                </th>
                <th
                  style={{ width: '248.58px' }}
                  className="py-3.5 px-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  KEY INFORMATION
                </th>
                <th
                  style={{ width: '106.47px' }}
                  className="py-3.5 px-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  PRIORITY
                </th>
                <th
                  style={{ width: '153.84px' }}
                  className="py-3.5 px-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  FOLLOW-UP HEALTH
                </th>
                <th
                  style={{ width: '212.41px' }}
                  className="py-3.5 px-4 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  DAYS SINCE LAST FOLLOW-UP
                </th>
                <th
                  style={{ width: '369.73px' }}
                  className="py-3.5 pl-4 pr-6 font-bold text-[11px] leading-4 tracking-[0.55px] uppercase text-[#64748B] text-left select-none"
                >
                  ACTIONS
                </th>
              </tr>
            </thead>

            {/* Table Body Rows: 61px to 62px each */}
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                      <p className="font-semibold text-xs text-slate-500 m-0">
                        Loading live queue items from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-semibold text-sm text-slate-600 m-0">
                        No matching items found
                      </p>
                      <p className="text-xs text-slate-400 m-0">
                        {items.length === 0
                          ? 'The queue is currently empty.'
                          : 'Try adjusting your search query or priority filters.'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {(selectedFilter !== 'all' || searchQuery) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFilter('all');
                              onSearchClear?.();
                            }}
                            className="px-3 py-1.5 text-xs text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                          >
                            Clear all filters
                          </button>
                        )}
                        {import.meta.env.DEV && items.length === 0 && (
                          <button
                            type="button"
                            onClick={handleResetData}
                            className="px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg transition-colors"
                          >
                            Reset Demo Data
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isDone = Boolean(item.isDone);
                  const effectiveCountVariant =
                    item.countVariant ||
                    (item.priority === 'High'
                      ? 'red'
                      : item.priority === 'Medium'
                      ? 'amber'
                      : 'green');

                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setActionNote('');
                        setActiveModalItem(item);
                      }}
                      className={`box-border h-[61.5px] border-b border-[#F1F5F9] hover:bg-[#FAFBFC] transition-colors cursor-pointer ${
                        isDone ? 'bg-slate-50/60 opacity-60' : ''
                      }`}
                    >
                      {/* Module Column: 240.06px */}
                      <td
                        style={{ width: '240.06px' }}
                        className="py-3 pl-6 pr-4 whitespace-nowrap"
                      >
                        <div className="flex flex-row items-center gap-3">
                          <div
                            className={`flex justify-center items-center w-9 h-9 rounded-xl shrink-0 ${
                              item.iconBg || 'bg-[#EFF6FF]'
                            }`}
                          >
                            {renderModuleIcon(item.moduleCode, item.moduleName)}
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span
                              className="font-bold text-xs leading-4 text-[#0F172A] truncate"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {item.moduleName}
                            </span>
                            <span
                              className="font-normal text-[11px] leading-4 text-[#64748B] truncate"
                              style={{ fontFamily: "'Inter', sans-serif" }}
                            >
                              {item.moduleSub}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Count Column: 75.14px */}
                      <td
                        style={{ width: '75.14px' }}
                        className="py-3 px-4 text-center whitespace-nowrap"
                      >
                        <div className="flex justify-center items-center">
                          <span
                            className={`inline-flex items-center justify-center px-2.5 py-1 min-w-[28px] h-6 rounded-md font-bold text-xs leading-4 ${
                              effectiveCountVariant === 'red'
                                ? 'bg-[#FEF2F2] text-[#DC2626]'
                                : effectiveCountVariant === 'amber'
                                ? 'bg-[#FFFBEB] text-[#D97706]'
                                : 'bg-[#ECFDF5] text-[#059669]'
                            }`}
                          >
                            {item.count}
                          </span>
                        </div>
                      </td>

                      {/* Key Information Column: 248.58px */}
                      <td
                        style={{ width: '248.58px' }}
                        className="py-3.5 px-4 whitespace-nowrap"
                      >
                        <div className="flex flex-col items-start min-w-0">
                          <span
                            className="font-bold text-xs leading-[15px] text-[#0F172A] truncate max-w-full"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {item.keyInfoTitle}
                          </span>
                          <span
                            className="font-normal text-[11px] leading-4 text-[#64748B] truncate max-w-full"
                            style={{ fontFamily: "'Inter', sans-serif" }}
                          >
                            {item.keyInfoSub}
                          </span>
                        </div>
                      </td>

                      {/* Priority Column: 106.47px */}
                      <td
                        style={{ width: '106.47px' }}
                        className="py-3 px-4 whitespace-nowrap"
                      >
                        <PriorityBadge priority={item.priority} />
                      </td>

                      {/* Follow-up Health Column: 153.84px */}
                      <td
                        style={{ width: '153.84px' }}
                        className="py-3 px-4 whitespace-nowrap"
                      >
                        <HealthBadge status={item.health} />
                      </td>

                      {/* Days Since Last Follow-up Column: 212.41px */}
                      <td
                        style={{ width: '212.41px' }}
                        className="py-3 px-4 whitespace-nowrap"
                      >
                        <span
                          className={`font-medium text-xs leading-4 ${
                            item.daysColorRed ? 'text-[#DC2626]' : 'text-[#475569]'
                          }`}
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {item.daysSinceLastFollowUp}
                        </span>
                      </td>

                      {/* Actions Column: 369.73px */}
                      <td
                        style={{ width: '369.73px' }}
                        className="py-3 pl-4 pr-3 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-row items-center gap-2">
                          {/* Primary Action Button: 147px x 28px */}
                          <button
                            type="button"
                            onClick={() => handlePrimaryAction(item)}
                            style={{ width: '147px', height: '28px' }}
                            className={`flex flex-col justify-center items-center px-3 h-[28px] w-[147px] rounded-lg text-xs font-medium transition-all shadow-sm shrink-0 ${
                              isDone
                                ? 'bg-[#059669] hover:bg-[#047857] text-white'
                                : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                            }`}
                          >
                            <span className="truncate px-0.5">
                              {isDone ? 'Completed ✓' : item.primaryActionLabel}
                            </span>
                          </button>

                          {/* Secondary Action Button: 179.2px x 30px */}
                          {(() => {
                            const code = (item.moduleCode || '').toUpperCase();
                            const isRoutable = Boolean(MODULE_ROUTES[code]);
                            return (
                              <button
                                type="button"
                                disabled={!isRoutable}
                                onClick={() => handleSecondaryAction(item)}
                                title={isRoutable ? `Open in ${item.secondaryActionLabel}` : 'Module coming soon'}
                                style={{ width: '179.2px', height: '30px' }}
                                className={`box-border flex flex-row items-center justify-center px-3 h-[30px] w-[179.2px] gap-1.5 border rounded-lg text-xs font-medium transition-colors shrink-0 ${
                                  isRoutable
                                    ? 'border-[#BFDBFE] hover:bg-indigo-50/50 text-[#4F46E5] cursor-pointer'
                                    : 'border-slate-200 text-slate-400 opacity-60 cursor-not-allowed bg-slate-50'
                                }`}
                              >
                                <FileText className={`w-3.5 h-3.5 stroke-[1.17] shrink-0 ${isRoutable ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                                <span className="truncate">{item.secondaryActionLabel}</span>
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FollowUpQueuePage;
