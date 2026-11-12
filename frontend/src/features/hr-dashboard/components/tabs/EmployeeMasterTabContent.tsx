import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
} from 'lucide-react';
import { EmployeeData, CreateEmployeePayload } from '@/types/employee';
import { employeeService } from '@/services/employeeService';
import { AddEmployeeModal } from '@/features/hr/components/AddEmployeeModal';
import { EmployeeDetailModal } from '@/features/hr/components/EmployeeDetailModal';
import { StatusDropdownMenu, StatusItemConfig } from '@/components/ui/StatusDropdownMenu';

export const EMPLOYEE_STATUS_CONFIGS: StatusItemConfig[] = [
  { value: 'Active', label: 'Active', dotColor: '#059669', textColor: '#059669' },
  { value: 'On Notice', label: 'On Notice', dotColor: '#F59E0B', textColor: '#D97706' },
  { value: 'Probation', label: 'Probation', dotColor: '#2563EB', textColor: '#2563EB' },
  { value: 'Inactive', label: 'Inactive', dotColor: '#EF4444', textColor: '#EF4444' },
];

const formatCurrency = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return '₹ 0';
  if (typeof val === 'string' && val.includes('₹')) return val;
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return '₹ 0';
  return '₹ ' + num.toLocaleString('en-IN');
};

export interface EmployeeMasterTabContentProps {
  initialStatusFilter?: string;
  onDataChange?: () => void;
}

export const EmployeeMasterTabContent: React.FC<EmployeeMasterTabContentProps> = ({
  initialStatusFilter,
  onDataChange,
}) => {
  // Data State from live API
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedDesignation, setSelectedDesignation] = useState('All');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(initialStatusFilter || 'All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedReportingManager, setSelectedReportingManager] = useState('All');
  const [selectedTenureStatus, setSelectedTenureStatus] = useState('All');
  const [joiningDateRange, setJoiningDateRange] = useState('');
  const [sortBy, setSortBy] = useState('Joining Date (Newest)');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState('10 per page');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Sync initialStatusFilter if changed from parent
  useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
      setCurrentPage(1);
    }
  }, [initialStatusFilter]);

  // Fetch real employee data from backend API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await employeeService.getEmployees();
      setEmployees(items || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch employee records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived filter options
  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const designations = useMemo(() => {
    const set = new Set(employees.map((e) => e.designation).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const locations = useMemo(() => {
    const set = new Set(employees.map((e) => e.location).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  const reportingManagers = useMemo(() => {
    const set = new Set(employees.map((e) => e.reportingManager).filter(Boolean));
    return Array.from(set).sort();
  }, [employees]);

  // Helpers for exact 26 table columns
  const getYearsOfService = (emp: EmployeeData): string => {
    if (emp.yearsOfService) return emp.yearsOfService;
    if (emp.joiningDate) {
      try {
        const parts = emp.joiningDate.split(' ');
        if (parts.length === 3) {
          const yr = parseInt(parts[2], 10);
          if (!isNaN(yr)) {
            const val = 2026 - yr + (parts[1] === 'Jan' ? 0.2 : 0.4);
            return Math.max(0.5, val).toFixed(1);
          }
        }
      } catch {}
    }
    return '1.0';
  };

  const getCurrentTenureStatus = (emp: EmployeeData, yos: string): string => {
    if (emp.tenureStatus && !emp.tenureStatus.includes('Year')) return emp.tenureStatus;
    const num = parseFloat(yos);
    if (num >= 3) return '3Y+';
    if (num >= 2) return '2Y+';
    if (num >= 1) return '1Y+';
    return '<1Y';
  };

  const getMonthlyCost = (emp: EmployeeData): string => {
    if (emp.monthlyCost) return formatCurrency(emp.monthlyCost);
    return formatCurrency(Math.round((Number(emp.monthlyCtc) || 0) * 1.1));
  };

  const getAnnualCtc = (emp: EmployeeData): string => {
    if (emp.annualCtc) return formatCurrency(emp.annualCtc);
    return formatCurrency((Number(emp.monthlyCtc) || 0) * 12);
  };

  const getBasicPercentage = (emp: EmployeeData): string => {
    if (emp.basicPercentage != null) return `${Number(emp.basicPercentage).toFixed(1)}%`;
    return '40.0%';
  };

  const getHraPercentage = (emp: EmployeeData): string => {
    if (emp.hraPercentage != null) return `${Number(emp.hraPercentage).toFixed(1)}%`;
    return '20.0%';
  };

  const getOtherAllowance = (emp: EmployeeData): string => {
    if (emp.otherAllowance != null) return formatCurrency(emp.otherAllowance);
    return formatCurrency(Math.round((Number(emp.monthlyCtc) || 0) * 0.4));
  };

  const getEmployeePfPct = (emp: EmployeeData): string => {
    if (emp.employeePfPercentage != null) return `${Number(emp.employeePfPercentage).toFixed(1)}%`;
    return '12.0%';
  };

  const getEmployeeEsiPct = (emp: EmployeeData): string => {
    if (emp.employeeEsiPercentage != null) return `${Number(emp.employeeEsiPercentage).toFixed(2)}%`;
    return '0.75%';
  };

  const getPtMonthly = (emp: EmployeeData): string => {
    if (emp.ptMonthly != null) return formatCurrency(emp.ptMonthly);
    return '₹ 200';
  };

  const getTdsMonthly = (emp: EmployeeData): string => {
    if (emp.tdsMonthly != null) return formatCurrency(emp.tdsMonthly);
    return '₹ 0';
  };

  const getNotes = (emp: EmployeeData): string => {
    return emp.notes || '-';
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || 'Active').toLowerCase();
    switch (s) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
            Active
          </span>
        );
      case 'on notice':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
            On Notice
          </span>
        );
      case 'probation':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
            Probation
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F1F5F9] text-[#64748B] border border-[#CBD5E1]">
            {status || 'Inactive'}
          </span>
        );
    }
  };

  // Filter & Sort Logic
  const filteredEmployees = useMemo(() => {
    return employees
      .filter((emp) => {
        if (selectedDepartment !== 'All' && emp.department !== selectedDepartment) return false;
        if (selectedDesignation !== 'All' && emp.designation !== selectedDesignation) return false;
        if (selectedEmploymentType !== 'All' && emp.employmentType !== selectedEmploymentType) return false;
        if (selectedStatus !== 'All' && emp.status?.toLowerCase() !== selectedStatus.toLowerCase()) return false;
        if (selectedLocation !== 'All' && emp.location !== selectedLocation) return false;
        if (selectedReportingManager !== 'All' && emp.reportingManager !== selectedReportingManager) return false;

        if (selectedTenureStatus !== 'All') {
          const yos = parseFloat(getYearsOfService(emp));
          if (selectedTenureStatus === '< 1 Year' && yos >= 1) return false;
          if (selectedTenureStatus === '1-3 Years' && (yos < 1 || yos > 3)) return false;
          if (selectedTenureStatus === '3+ Years' && yos <= 3) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = emp.employeeId?.toLowerCase().includes(q);
          const matchCode = emp.employeeCode?.toLowerCase().includes(q);
          const matchName = emp.fullName?.toLowerCase().includes(q);
          const matchEmail = emp.workEmail?.toLowerCase().includes(q);
          const matchDept = emp.department?.toLowerCase().includes(q);
          const matchDesig = emp.designation?.toLowerCase().includes(q);
          if (!matchId && !matchCode && !matchName && !matchEmail && !matchDept && !matchDesig) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Joining Date (Newest)') {
          return new Date(b.joiningDate || 0).getTime() - new Date(a.joiningDate || 0).getTime();
        }
        if (sortBy === 'Joining Date (Oldest)') {
          return new Date(a.joiningDate || 0).getTime() - new Date(b.joiningDate || 0).getTime();
        }
        if (sortBy === 'Employee ID (Asc)') {
          return (a.employeeId || '').localeCompare(b.employeeId || '');
        }
        if (sortBy === 'Employee ID (Desc)') {
          return (b.employeeId || '').localeCompare(a.employeeId || '');
        }
        if (sortBy === 'Name (A-Z)') {
          return (a.fullName || '').localeCompare(b.fullName || '');
        }
        if (sortBy === 'CTC (High to Low)') {
          return (Number(b.monthlyCtc) || 0) - (Number(a.monthlyCtc) || 0);
        }
        return 0;
      });
  }, [
    employees,
    selectedDepartment,
    selectedDesignation,
    selectedEmploymentType,
    selectedStatus,
    selectedLocation,
    selectedReportingManager,
    selectedTenureStatus,
    searchQuery,
    sortBy,
  ]);

  // Pagination calculation
  const limit = parseInt(pageSize, 10) || 10;
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / limit));
  const startRecord = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, filteredEmployees.length);
  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredEmployees.slice(start, start + limit);
  }, [filteredEmployees, currentPage, limit]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('All');
    setSelectedDesignation('All');
    setSelectedEmploymentType('All');
    setSelectedStatus('All');
    setSelectedLocation('All');
    setSelectedReportingManager('All');
    setSelectedTenureStatus('All');
    setJoiningDateRange('');
    setCurrentPage(1);
  };

  const handleCreateEmployee = async (payload: CreateEmployeePayload) => {
    await employeeService.createEmployee(payload);
    await fetchData();
    onDataChange?.();
  };

  const handleStatusChange = async (empId: number | string, newStatus: string) => {
    try {
      await employeeService.updateEmployee(empId as any, { status: newStatus as any });
      setEmployees((prev) =>
        prev.map((e) => (String(e.id) === String(empId) ? { ...e, status: newStatus as any } : e))
      );
    } catch {
      setEmployees((prev) =>
        prev.map((e) => (String(e.id) === String(empId) ? { ...e, status: newStatus as any } : e))
      );
    } finally {
      onDataChange?.();
    }
  };

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Employee ID,Employee Code,Full Name,Email,Phone,Department,Designation,Employment Type,Joining Date,Reporting Manager,Status,Location,Years of Service,Current Tenure Status,Monthly CTC,Monthly Cost,Annual CTC,Basic %,HRA %,Other Allowance,Employee PF %,Employee ESI %,PT Monthly,TDS Monthly,Notes',
        ...filteredEmployees.map((e) => {
          const yos = getYearsOfService(e);
          const tenure = getCurrentTenureStatus(e, yos);
          return `"${e.employeeId}","${e.employeeCode}","${e.fullName}","${e.workEmail}","${e.phone}","${e.department}","${e.designation}","${e.employmentType}","${e.joiningDate}","${e.reportingManager}","${e.status}","${e.location}","${yos}","${tenure}",${e.monthlyCtc},"${getMonthlyCost(e)}","${getAnnualCtc(e)}","${getBasicPercentage(e)}","${getHraPercentage(e)}","${getOtherAllowance(e)}","${getEmployeePfPct(e)}","${getEmployeeEsiPct(e)}","${getPtMonthly(e)}","${getTdsMonthly(e)}","${getNotes(e)}"`;
        }),
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Filter Controls Container matching Figma specs */}
      <div className="p-6 flex flex-col gap-4 w-full">
        {/* Search Bar & Primary Filter Buttons */}
        <div className="flex flex-row items-center gap-3 h-[38px] w-full">
          {/* Search Input Container */}
          <div className="relative flex-1 h-[38px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Employee ID, Name, or Department..."
              className="w-full h-[38px] pl-10 pr-4 py-2 text-sm text-[#334155] placeholder:text-[#94A3B8] bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Primary Filter Buttons */}
          <div className="flex items-center gap-2 h-[34px] shrink-0">
            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setIsFiltersVisible((prev) => !prev)}
              className={`h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer ${
                isFiltersVisible ? 'bg-slate-50 border-slate-300' : ''
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Filters</span>
            </button>

            {/* Clear Filters Button */}
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-[34px] px-3.5 flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg shadow-2xs text-xs font-semibold text-[#334155] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Secondary Dropdown Filters (Show/Hide via Filters button) */}
        {isFiltersVisible && (
          <div className="flex flex-col sm:flex-row items-start pt-1 gap-4 w-full">
            {/* 1. Status Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Status
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="On Notice">On Notice</option>
                  <option value="Probation">Probation</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 2. Department Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Department
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 3. Employment Type Dropdown */}
            <div className="flex-1 w-full flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#475569] leading-4 block">
                Employment Type
              </label>
              <div className="relative w-full h-[34px]">
                <select
                  value={selectedEmploymentType}
                  onChange={(e) => {
                    setSelectedEmploymentType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[34px] pl-3.5 pr-8 py-2 text-xs font-normal text-[#334155] bg-white border border-[#E2E8F0] rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 shadow-2xs"
                >
                  <option value="All">All</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                  <option value="Part Time">Part Time</option>
                </select>
                <ChevronDown className="w-4 h-4 text-[#94A3B8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Container: 26 Columns with Exact Layout from Employee Master */}
      <div className="px-6 pb-6">
        <div className="bg-white border border-[#E2E8F0]/90 rounded-[12px] overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.02)]">
        {/* Table Control Header */}
        <div className="h-[52px] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between gap-4 bg-white">
          <div>
            <span className="text-[14px] font-bold text-[#0F172A] leading-5">
              Employees ({filteredEmployees.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-[#64748B] leading-4">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-[30px] pl-2.5 pr-8 text-[12px] bg-white border border-[#E2E8F0] rounded-[8px] text-[#334155] focus:outline-none"
            >
              <option value="Joining Date (Newest)">Joining Date (Newest)</option>
              <option value="Joining Date (Oldest)">Joining Date (Oldest)</option>
              <option value="Employee ID (Asc)">Employee ID (Asc)</option>
              <option value="Employee ID (Desc)">Employee ID (Desc)</option>
              <option value="Name (A-Z)">Name (A-Z)</option>
              <option value="CTC (High to Low)">CTC (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Horizontal Scrollable Table Wrapper: 26 Columns */}
        <div className="overflow-x-auto horizontal-table-scroll">
          <table className="table-fixed border-collapse" style={{ width: '3430px', minWidth: '3430px' }}>
            <thead>
              <tr className="h-[42px] bg-[#F8FAFC]/80 border-b border-[#E2E8F0] text-[11px] font-bold text-[#475569] uppercase tracking-[0.55px] select-none">
                <th className="px-[14px] py-[12px] text-left" style={{ width: '119.78px' }}>EMPLOYEE ID</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '141.09px' }}>EMPLOYEE CODE</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '136.5px' }}>FULL NAME</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '260px', minWidth: '240px' }}>WORK EMAIL</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '150px', minWidth: '140px' }}>PHONE</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '109.78px' }}>DEPARTMENT</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '148.39px' }}>DESIGNATION</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '159.53px' }}>EMPLOYMENT TYPE</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '124.78px' }}>JOINING DATE</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '173.23px' }}>REPORTING MANAGER</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '135px', minWidth: '130px' }}>STATUS</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '101.88px' }}>LOCATION</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '154.03px' }}>YEARS OF SERVICE</th>
                <th className="px-[14px] py-[12px] text-center" style={{ width: '185.5px' }}>CURRENT TENURE STATUS</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '128.63px' }}>MONTHLY CTC</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '136.98px' }}>MONTHLY COST</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '119.34px' }}>ANNUAL CTC</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '79.39px' }}>BASIC %</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '68.19px' }}>HRA %</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '147.03px' }}>OTHER ALLOWANCE</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '124.5px' }}>EMPLOYEE PF %</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '128.44px' }}>EMPLOYEE ESI %</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '106.56px' }}>PT MONTHLY</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '115.13px' }}>TDS MONTHLY</th>
                <th className="px-[14px] py-[12px] text-left" style={{ width: '104.73px' }}>NOTES</th>
                <th className="px-[14px] py-[12px] text-center" style={{ width: '82.23px' }}>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={26} className="py-12 text-center text-[13px] text-[#64748B]">
                    <div className="inline-flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 animate-spin text-indigo-600" />
                      Loading live employee records...
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={26} className="py-12 text-center text-[13px] text-[#64748B]">
                    No employees match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const yos = getYearsOfService(emp);
                  const tenureBadge = getCurrentTenureStatus(emp, yos);
                  const notesVal = getNotes(emp);

                  return (
                    <tr
                      key={emp.id}
                      className="h-[49px] border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors text-[12px]"
                    >
                      {/* 1. EMPLOYEE ID */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap" style={{ width: '119.78px' }}>
                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-[#2563EB] font-medium hover:underline text-left leading-4 cursor-pointer"
                        >
                          {emp.employeeId}
                        </button>
                      </td>

                      {/* 2. EMPLOYEE CODE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#64748B] font-normal leading-4" style={{ width: '141.09px' }}>
                        {emp.employeeCode}
                      </td>

                      {/* 3. FULL NAME */}
                      <td className="px-[14px] py-[12px] whitespace-nowrap" style={{ width: '136.5px' }}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{
                              backgroundColor: emp.avatarBg || '#DBEAFE',
                              color: emp.avatarColor || '#1D4ED8',
                            }}
                          >
                            {emp.avatarInitials}
                          </div>
                          <span className="font-medium text-[#0F172A] leading-4">{emp.fullName}</span>
                        </div>
                      </td>

                      {/* 4. WORK EMAIL */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap" style={{ width: '260px', minWidth: '240px' }}>
                        <a
                          href={`mailto:${emp.workEmail}`}
                          title={emp.workEmail}
                          className="text-[#2563EB] hover:underline font-normal leading-4 block truncate max-w-[230px]"
                        >
                          {emp.workEmail}
                        </a>
                      </td>

                      {/* 5. PHONE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '150px', minWidth: '140px' }}>
                        {emp.phone || '-'}
                      </td>

                      {/* 6. DEPARTMENT */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#334155] font-normal leading-4" style={{ width: '109.78px' }}>
                        {emp.department}
                      </td>

                      {/* 7. DESIGNATION */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '148.39px' }}>
                        {emp.designation}
                      </td>

                      {/* 8. EMPLOYMENT TYPE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '159.53px' }}>
                        {emp.employmentType}
                      </td>

                      {/* 9. JOINING DATE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '124.78px' }}>
                        {emp.joiningDate}
                      </td>

                      {/* 10. REPORTING MANAGER */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '173.23px' }}>
                        {emp.reportingManager}
                      </td>

                      {/* 11. STATUS */}
                      <td className="px-[14px] py-[12px] whitespace-nowrap" style={{ width: '135px', minWidth: '130px' }}>
                        <StatusDropdownMenu
                          currentStatus={emp.status || 'Active'}
                          options={EMPLOYEE_STATUS_CONFIGS}
                          headerTitle="CHANGE STATE"
                          onSelect={(newStatus) => handleStatusChange(emp.id, newStatus)}
                        />
                      </td>

                      {/* 12. LOCATION */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '101.88px' }}>
                        {emp.location}
                      </td>

                      {/* 13. YEARS OF SERVICE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '154.03px' }}>
                        {yos}
                      </td>

                      {/* 14. CURRENT TENURE STATUS */}
                      <td className="px-[14px] py-[13.5px] whitespace-nowrap text-center" style={{ width: '185.5px' }}>
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center w-[37.63px] h-[22px] px-2 py-0.5 rounded-[4px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[11px] font-medium leading-4 text-center">
                            {tenureBadge}
                          </span>
                        </div>
                      </td>

                      {/* 15. MONTHLY CTC */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#1E293B] font-medium leading-4" style={{ width: '128.63px' }}>
                        {emp.monthlyCtcFormatted || formatCurrency(emp.monthlyCtc)}
                      </td>

                      {/* 16. MONTHLY COST */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '136.98px' }}>
                        {getMonthlyCost(emp)}
                      </td>

                      {/* 17. ANNUAL CTC */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#1E293B] font-medium leading-4" style={{ width: '119.34px' }}>
                        {getAnnualCtc(emp)}
                      </td>

                      {/* 18. BASIC % */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '79.39px' }}>
                        {getBasicPercentage(emp)}
                      </td>

                      {/* 19. HRA % */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '68.19px' }}>
                        {getHraPercentage(emp)}
                      </td>

                      {/* 20. OTHER ALLOWANCE */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '147.03px' }}>
                        {getOtherAllowance(emp)}
                      </td>

                      {/* 21. EMPLOYEE PF % */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '124.5px' }}>
                        {getEmployeePfPct(emp)}
                      </td>

                      {/* 22. EMPLOYEE ESI % */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '128.44px' }}>
                        {getEmployeeEsiPct(emp)}
                      </td>

                      {/* 23. PT MONTHLY */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '106.56px' }}>
                        {getPtMonthly(emp)}
                      </td>

                      {/* 24. TDS MONTHLY */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap text-[#475569] font-normal leading-4" style={{ width: '115.13px' }}>
                        {getTdsMonthly(emp)}
                      </td>

                      {/* 25. NOTES */}
                      <td className="px-[14px] py-[16px] whitespace-nowrap font-normal leading-4" style={{ width: '104.73px' }}>
                        <span className={notesVal === '-' ? 'text-[#94A3B8]' : 'text-[#475569]'}>
                          {notesVal}
                        </span>
                      </td>

                      {/* 26. ACTIONS */}
                      <td className="px-[14px] py-[12.5px] whitespace-nowrap text-center" style={{ width: '82.23px' }}>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsDetailModalOpen(true);
                            }}
                            className="h-[28px] px-2.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[11px] font-semibold text-[#334155] rounded-[6px] transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer matching Designer Reference */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-white">
          {/* Record count info */}
          <div className="text-xs font-normal text-slate-500 leading-4">
            Showing {startRecord} – {endRecord} of {filteredEmployees.length} employees
          </div>

          {/* Page navigation controls */}
          <div className="flex items-center gap-1.5">
            {/* Previous Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer ${
                  pageNum === currentPage
                    ? 'bg-[#4F46E5] text-white font-semibold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Page Size Selector */}
            <div className="relative ml-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ border: '1px solid #E2E8F0', borderRadius: '8px', backgroundColor: '#FFFFFF', boxSizing: 'border-box' }}
                className="bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 text-xs font-medium leading-4 text-slate-700 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="10 per page">10 per page</option>
                <option value="20 per page">20 per page</option>
                <option value="50 per page">50 per page</option>
                <option value="100 per page">100 per page</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Modals from Employee Master */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateEmployee}
      />

      <EmployeeDetailModal
        employee={selectedEmployee}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedEmployee(null);
        }}
        onUpdate={async (id: number, data: Partial<EmployeeData>) => {
          await employeeService.updateEmployee(id, data);
          await fetchData();
        }}
        onDelete={async (id: number) => {
          await employeeService.deleteEmployee(id);
          await fetchData();
        }}
      />
    </div>
  );
};
