import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Layers,
  RefreshCw,
  Plus,
  Search,
  Filter,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  MoreVertical,

  CheckCircle2,
  Clock,
  TrendingUp,
  X,
  Trash2,
  User,
} from 'lucide-react';
import { moduleEngineService, ModuleRecord, ModuleSummary } from '@/services/moduleEngineService';

interface ModulePlaceholderProps {
  title?: string;
  category?: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, category }) => {
  const location = useLocation();

  // Determine module key from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const moduleKey = pathSegments[pathSegments.length - 1] || 'dashboard';

  const displayTitle =
    title ||
    moduleKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const displayCategory =
    category ||
    pathSegments[0]?.toUpperCase() ||
    'MODULE';

  // Data states
  const [records, setRecords] = useState<ModuleRecord[]>([]);
  const [summary, setSummary] = useState<ModuleSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Live Synced');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('8 per page');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ModuleRecord | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newStatus, setNewStatus] = useState('Active');
  const [newPriority] = useState('Normal');
  const [newValue, setNewValue] = useState('');

  // Fetch live data from backend
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recs, sum] = await Promise.all([
        moduleEngineService.getModuleRecords(moduleKey).catch(() => []),
        moduleEngineService.getModuleSummary(moduleKey).catch(() => null),
      ]);
      setRecords(recs || []);
      if (sum) {
        setSummary(sum);
      }
      const now = new Date();
      setLastUpdated(
        `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedPriority('All');
    setCurrentPage(1);
  };

  // Filter option sets
  const categories = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.category) s.add(r.category);
    });
    return Array.from(s).sort();
  }, [records]);

  const statuses = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.status) s.add(r.status);
    });
    return Array.from(s).sort();
  }, [records]);

  const priorities = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.priority) s.add(r.priority);
    });
    return Array.from(s).sort();
  }, [records]);

  // Active filter count
  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (selectedCategory !== 'All') c++;
    if (selectedStatus !== 'All') c++;
    if (selectedPriority !== 'All') c++;
    if (searchQuery.trim()) c++;
    return c;
  }, [selectedCategory, selectedStatus, selectedPriority, searchQuery]);

  // Filtered & sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        if (selectedCategory !== 'All' && r.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
        if (selectedStatus !== 'All' && r.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
        if (selectedPriority !== 'All' && r.priority?.toLowerCase() !== selectedPriority.toLowerCase()) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchCode = r.code?.toLowerCase().includes(q);
          const matchTitle = r.title?.toLowerCase().includes(q);
          const matchSub = r.subtitle?.toLowerCase().includes(q);
          const matchCat = r.category?.toLowerCase().includes(q);
          const matchAssignee = r.assignee?.toLowerCase().includes(q);
          if (!matchCode && !matchTitle && !matchSub && !matchCat && !matchAssignee) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Title (A-Z)') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'Code (Asc)') {
          return (a.code || '').localeCompare(b.code || '');
        }
        return 0;
      });
  }, [records, selectedCategory, selectedStatus, selectedPriority, searchQuery, sortBy]);

  // Pagination
  const limit = parseInt(pageSize, 10) || 8;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / limit));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredRecords.slice(start, start + limit);
  }, [filteredRecords, currentPage, limit]);

  // Handle Add Record
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await moduleEngineService.createRecord(moduleKey, {
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || 'Custom Added Entry',
        category: newCategory,
        status: newStatus,
        priority: newPriority,
        value: newValue || '1',
      });
      setIsAddModalOpen(false);
      setNewTitle('');
      setNewSubtitle('');
      await fetchData();
    } catch (err) {
      // Failed to create record
    }
  };

  // Handle Delete
  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await moduleEngineService.deleteRecord(moduleKey, id);
        setSelectedRecord(null);
        await fetchData();
      } catch (err) {
        // Failed to delete record
      }
    }
  };

  // Export CSV
  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'ID/Code,Title,Subtitle,Category,Status,Priority,Assignee,Value,Date',
        ...filteredRecords.map(
          (r) =>
            `"${r.code || r.id}","${r.title || ''}","${r.subtitle || ''}","${r.category || ''}","${r.status || ''}","${r.priority || ''}","${r.assignee || ''}","${r.value || ''}","${r.date || ''}"`
        ),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${moduleKey}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (['active', 'approved', 'completed', 'paid', 'present', 'passed', 'released', 'success'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
          {status}
        </span>
      );
    }
    if (['pending', 'in progress', 'notice period', 'open', 'scheduled', 'submitted', 'review', 'in review'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
          {status}
        </span>
      );
    }
    if (['sent', 'allocated', 'draft', 'positive'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
        {status}
      </span>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Page Title & Top Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">
                {displayCategory}
              </div>
              <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">{displayTitle}</h1>
              <p className="text-[12px] text-[#64748B]">
                Live enterprise records connected to PostgreSQL database with real-time analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh live data"
              className="w-8 h-8 rounded-[6px] border border-[#E2E8F0] bg-white text-[#64748B] flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#64748B] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="h-8 px-3.5 rounded-[6px] border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#334155] flex items-center gap-1.5 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#64748B]" />
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 px-3.5 rounded-[6px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[12px] font-medium flex items-center gap-1 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record
            </button>
          </div>
        </div>

        {/* Section - KPICards (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
            <div className="w-11 h-11 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748B]">
                {summary?.primaryLabel || 'Total Records'}
              </p>
              <p className="text-[22px] font-bold text-[#0F172A] leading-tight mt-0.5">
                {summary?.total ?? records.length}
              </p>
              <p className="text-[11px] mt-0.5 flex items-center gap-1">
                <span className="text-[#10B981] font-semibold">
                  {summary?.trend ? summary.trend.split(' ')[0] + ' ' + summary.trend.split(' ')[1] : '↑ 12%'}
                </span>
                <span className="text-[#94A3B8]">vs last month</span>
              </p>
            </div>
          </div>

          {/* Card 2: Active */}
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
            <div className="w-11 h-11 rounded-[8px] bg-[#ECFDF5] flex items-center justify-center text-[#059669] flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748B]">
                {summary?.activeLabel || 'Active Items'}
              </p>
              <p className="text-[22px] font-bold text-[#0F172A] leading-tight mt-0.5">
                {summary?.active ?? records.filter((r) => ['active', 'approved', 'completed', 'present'].includes((r.status || '').toLowerCase())).length}
              </p>
              <p className="text-[11px] mt-0.5 flex items-center gap-1">
                <span className="text-[#10B981] font-semibold">↑ 8%</span>
                <span className="text-[#94A3B8]">vs last month</span>
              </p>
            </div>
          </div>

          {/* Card 3: Secondary */}
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
            <div className="w-11 h-11 rounded-[8px] bg-[#FFF7ED] flex items-center justify-center text-[#EA580C] flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748B]">
                {summary?.secondaryLabel || 'Pending Review'}
              </p>
              <p className="text-[22px] font-bold text-[#0F172A] leading-tight mt-0.5">
                {summary?.secondary ?? Math.max(1, records.length - (summary?.active || 0))}
              </p>
              <p className="text-[11px] mt-0.5 flex items-center gap-1">
                <span className="text-[#EF4444] font-semibold">↓ 5%</span>
                <span className="text-[#94A3B8]">vs last month</span>
              </p>
            </div>
          </div>

          {/* Card 4: Volume / Value */}
          <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 flex items-center gap-3.5 shadow-[0px_1px_2px_rgba(0,0,0,0.03)]">
            <div className="w-11 h-11 rounded-[8px] bg-[#FAF5FF] flex items-center justify-center text-[#9333EA] flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#64748B]">Total Value / Output</p>
              <p className="text-[22px] font-bold text-[#0F172A] leading-tight mt-0.5">
                {summary?.metricValFormatted || '100%'}
              </p>
              <p className="text-[11px] mt-0.5 flex items-center gap-1">
                <span className="text-[#10B981] font-semibold">↑ 14%</span>
                <span className="text-[#94A3B8]">vs last month</span>
              </p>
            </div>
          </div>
        </div>

        {/* Section - FilterContainer */}
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] p-4 shadow-[0px_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#3B82F6] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={`Search ${displayTitle.toLowerCase()} by ID, title, category, assignee...`}
                className="w-full h-[34px] pl-9 pr-3 text-[12px] border border-[#E2E8F0] rounded-[8px] bg-[#F8FAFC] text-[#334155] placeholder:text-[#94A3B8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="h-[34px] px-3.5 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] text-[#4F46E5] text-[12px] font-medium flex items-center gap-1.5 hover:bg-blue-50 transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters{activeFiltersCount > 0 ? ` (${activeFiltersCount})` : ''}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFiltersOpen ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={handleClearFilters}
                className="h-[34px] px-2.5 text-[#4F46E5] text-[12px] font-medium flex items-center gap-1 hover:underline transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          </div>

          {isFiltersOpen && (
            <div className="pt-2 border-t border-[#F1F5F9] grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#64748B] mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2.5 text-[12px] border border-[#E2E8F0] rounded-[6px] bg-white text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748B] mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2.5 text-[12px] border border-[#E2E8F0] rounded-[6px] bg-white text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#64748B] mb-1">Priority / Type</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => {
                    setSelectedPriority(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-8 px-2.5 text-[12px] border border-[#E2E8F0] rounded-[6px] bg-white text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="All">All Priorities</option>
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section - TableContainer */}
        <div className="bg-white rounded-[10px] border border-[#E2E8F0] shadow-[0px_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between flex-wrap gap-3 bg-white">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#0F172A]">
                {displayTitle}{filteredRecords.length > 0 ? ` (${filteredRecords.length})` : ''}
              </span>
              <Info className="w-3.5 h-3.5 text-[#4F46E5] cursor-pointer" />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#64748B]">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2.5 text-[12px] border border-[#E2E8F0] rounded-[6px] bg-white text-[#334155] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Newest">Newest First</option>
                <option value="Title (A-Z)">Title (A-Z)</option>
                <option value="Code (Asc)">Code (Asc)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ minWidth: '100%' }}>
              <thead>
                <tr className="bg-[#F8FAFC]/80 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px]">
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '130px' }}>
                    <div className="flex items-center gap-1">
                      <span>ID / CODE</span>
                      <span className="text-[#94A3B8]">⇅</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ minWidth: '220px' }}>
                    <span>TITLE & DESCRIPTION</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '150px' }}>
                    <span>CATEGORY</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '120px' }}>
                    <span>STATUS</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '120px' }}>
                    <span>PRIORITY</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '160px' }}>
                    <span>ASSIGNEE / OWNER</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '140px' }}>
                    <span>VALUE / AMOUNT</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap" style={{ width: '130px' }}>
                    <span>DATE</span>
                  </th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center" style={{ width: '80px' }}>
                    <span>ACTIONS</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[13px] text-[#64748B]">
                      <div className="inline-flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                        Loading live records from database...
                      </div>
                    </td>
                  </tr>
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-[13px] text-[#64748B]">
                      No records found in this module.
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-[#F8FAFC] transition-colors text-[12px] group"
                    >
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="text-[#2563EB] font-medium hover:underline text-left font-mono"
                        >
                          {rec.code || rec.id}
                        </button>
                      </td>

                      <td className="py-3 px-3.5">
                        <div>
                          <p className="font-semibold text-[#0F172A]">{rec.title}</p>
                          {rec.subtitle && (
                            <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                              {rec.subtitle}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[#475569]">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {rec.category || 'Standard'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {getStatusBadge(rec.status)}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[#475569]">
                        {rec.priority || 'Normal'}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[#475569]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#94A3B8]" />
                          <span>{rec.assignee || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#0F172A]">
                        {rec.value || '-'}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-[#64748B]">
                        {rec.date || 'Recent'}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="w-7 h-7 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 inline-flex items-center justify-center transition-colors"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 bg-white text-[12px] text-[#64748B]">
            <div>
              Showing <span className="font-semibold text-slate-800">{filteredRecords.length === 0 ? 0 : (currentPage - 1) * limit + 1}</span> –{' '}
              <span className="font-semibold text-slate-800">{Math.min(currentPage * limit, filteredRecords.length)}</span> of{' '}
              <span className="font-semibold text-slate-800">{filteredRecords.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-7 h-7 rounded border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded text-[12px] font-medium transition-colors ${
                      currentPage === pg
                        ? 'bg-[#4F46E5] text-white'
                        : 'border border-[#E2E8F0] text-[#334155] hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-7 h-7 rounded border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-7 px-2 border border-[#E2E8F0] rounded text-[12px] text-[#334155] bg-white focus:outline-none"
              >
                <option value="8 per page">8 per page</option>
                <option value="10 per page">10 per page</option>
                <option value="25 per page">25 per page</option>
                <option value="50 per page">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-[15px] font-semibold text-slate-800">Add New Record to {displayTitle}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q2 Operations Strategy"
                  className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Subtitle / Description</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Assigned to engineering lead"
                  className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Numeric Value / Amount</label>
                <input
                  type="number"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full h-9 px-3 text-[13px] border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 text-[13px] text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-600">{selectedRecord.code || selectedRecord.id}</span>
                <h2 className="text-[16px] font-bold text-slate-800">{selectedRecord.title}</h2>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDelete(selectedRecord.id)}
                  className="w-8 h-8 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedRecord(null)} className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Category</span>
                  <p className="text-[13px] font-semibold text-slate-800">{selectedRecord.category}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedRecord.status)}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Assignee / Owner</span>
                  <p className="text-[13px] font-semibold text-slate-800">{selectedRecord.assignee || 'Akshit Ujjain'}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Value</span>
                  <p className="text-[13px] font-semibold text-slate-800">{selectedRecord.value || '-'}</p>
                </div>
              </div>
              {selectedRecord.subtitle && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Description / Details</span>
                  <p className="text-[13px] text-slate-700 mt-0.5">{selectedRecord.subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
