import React, { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService';
import {
  ExpenseItem,
  ExpenseKpis,
  ExpenseFilterOptions,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '../types/expenses';
import { ExpenseKpiCards } from '../components/ExpenseKpiCards';
import { ExpenseFilterBar } from '../components/ExpenseFilterBar';
import { ExpensesTable } from '../components/ExpensesTable';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { EditExpenseModal } from '../components/EditExpenseModal';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [kpis, setKpis] = useState<ExpenseKpis | null>(null);
  const [filterOptions, setFilterOptions] = useState<ExpenseFilterOptions>({
    categories: [],
    statuses: [],
    projects: [],
    months: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Status');
  const [project, setProject] = useState('All Projects');
  const [month, setMonth] = useState('All Months');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [lastUpdated, setLastUpdated] = useState('15 Oct 2026, 11:30 AM');
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      const data = await expenseService.getKpis();
      setKpis(data);
    } catch (err) {
      console.error('Failed to fetch expense KPIs:', err);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const data = await expenseService.getFilterOptions();
      setFilterOptions(data);
    } catch (err) {
      console.error('Failed to fetch expense filter options:', err);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expenseService.getExpenses({
        search,
        category,
        status,
        projectId: project,
        month,
      });
      setExpenses(data);
      const now = new Date();
      setLastUpdated(
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
          ', ' +
          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      setError(err?.message || 'Failed to load expense records from the database. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, status, project, month]);

  useEffect(() => {
    fetchKpis();
    fetchFilterOptions();
  }, [fetchKpis, fetchFilterOptions]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All Categories');
    setStatus('All Status');
    setProject('All Projects');
    setMonth('All Months');
  };

  const handleCreateExpense = async (payload: CreateExpensePayload) => {
    await expenseService.createExpense(payload);
    await fetchExpenses();
    await fetchKpis();
    await fetchFilterOptions();
  };

  const handleUpdateExpense = async (id: number, payload: UpdateExpensePayload) => {
    await expenseService.updateExpense(id, payload);
    await fetchExpenses();
    await fetchKpis();
  };

  const handleDeleteExpense = async (id: number) => {
    await expenseService.deleteExpense(id);
    await fetchExpenses();
    await fetchKpis();
  };

  const handleExport = () => {
    expenseService.exportToCsv(expenses);
  };

  return (
    <div
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '24px',
        gap: '24px',
        width: '100%',
        background: '#F8FAFC',
        minHeight: '100%',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Page Title & Top Actions Bar */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Left: Icon + Heading + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Badge Icon */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: '#EEF2FF',
              border: '1px solid #E0E7FF',
              borderRadius: '12px',
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          <div>
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '24px',
                lineHeight: '30px',
                color: '#0F172A',
                margin: 0,
              }}
            >
              Expenses
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#64748B',
                margin: '2px 0 0 0',
              }}
            >
              Track and manage company expenses, reimbursements and project-related costs.
            </p>
          </div>
        </div>

        {/* Right: Refresh + Export + Add Expense */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Refresh button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                fetchExpenses();
                fetchKpis();
              }}
              title="Refresh"
              style={{
                boxSizing: 'border-box',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              className="hover:bg-slate-50 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              gap: '8px',
              height: '34px',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            className="hover:bg-slate-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#334155',
              }}
            >
              Export
            </span>
          </button>

          {/* + Add Expense Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 16px',
              gap: '6px',
              height: '32px',
              background: '#4F46E5',
              boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
            }}
            className="hover:bg-indigo-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: '16px',
                color: '#FFFFFF',
              }}
            >
              Add Expense
            </span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            width: '100%',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            color: '#991B1B',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              fetchExpenses();
              fetchKpis();
              fetchFilterOptions();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Metrics Cards */}
      <ExpenseKpiCards kpis={kpis} isLoading={isLoading && !kpis} />

      {/* Unified Filter & Table Card Container */}
      <div
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* Filter Section */}
        <ExpenseFilterBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          status={status}
          onStatusChange={setStatus}
          project={project}
          onProjectChange={setProject}
          month={month}
          onMonthChange={setMonth}
          filterOptions={filterOptions}
          onClearFilters={handleClearFilters}
          isFiltersOpen={isFiltersOpen}
          onToggleFilters={() => setIsFiltersOpen((prev) => !prev)}
        />

        {/* Table Section */}
        <ExpensesTable
          expenses={expenses}
          isLoading={isLoading}
          onEdit={(exp) => setEditingExpense(exp)}
          onDelete={handleDeleteExpense}
        />
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateExpense}
      />

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingExpense}
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        onSubmit={handleUpdateExpense}
      />
    </div>
  );
};

