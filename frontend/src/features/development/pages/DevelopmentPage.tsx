import React, { useState } from 'react';
import { DevelopmentPageHeader } from '../components/DevelopmentPageHeader';
import { DevelopmentKpiCards } from '../components/DevelopmentKpiCards';
import { DevelopmentFilterBar } from '../components/DevelopmentFilterBar';
import { DevelopmentTable } from '../components/DevelopmentTable';
import { DevelopmentPagination } from '../components/DevelopmentPagination';
import { AddDevelopmentModal } from '../components/AddDevelopmentModal';
import { ViewDevelopmentModal } from '../components/ViewDevelopmentModal';
import { EditDevelopmentModal } from '../components/EditDevelopmentModal';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { ToastNotification, ToastItem } from '../../../components/ui/ToastNotification';
import { useDevelopmentState } from '../hooks/useDevelopmentState';

export const DevelopmentPage: React.FC = () => {
  const {
    records,
    paginatedRecords,
    filteredRecords,
    kpis,
    lastUpdated,
    filters,
    sortField,
    sortOrder,
    activeFilterCount,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    isAddModalOpen,
    isViewModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    selectedRecord,
    toast,
    nextDevelopmentId,
    setIsAddModalOpen,
    setIsViewModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    handleSearchChange,
    handleProjectFilterChange,
    handleEnvironmentFilterChange,
    handleStatusFilterChange,
    handleReviewStatusFilterChange,
    handleClearFilters,
    handleSort,
    handlePageChange,
    handlePageSizeChange,
    handleAddRecord,
    handleEditRecord,
    handleDeleteRecord,
    handleUpdateCodeReviewStatus,
    handleUpdateStatus,
    handleRefresh,
    handleExport,
    openViewModal,
    openEditModal,
    openDeleteModal,
    showToast,
    closeToast,
  } = useDevelopmentState();

  // Convert toast state to ToastItem array for ToastNotification component
  const toasts: ToastItem[] = toast
    ? [
        {
          id: 'dev-toast',
          type: toast.type,
          title:
            toast.type === 'error'
              ? 'Action Failed'
              : toast.type === 'info'
              ? 'Information'
              : 'Success',
          message: toast.message,
          timestamp: 'Just now',
        },
      ]
    : [];

  return (
    <div
      className="w-full min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1600px] mx-auto space-y-5">
        {/* Page Header */}
        <DevelopmentPageHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          onAddDevelopment={() => setIsAddModalOpen(true)}
          lastUpdated={lastUpdated}
        />

        {/* 5 KPI Metric Cards */}
        <DevelopmentKpiCards kpis={kpis} />

        {/* Main Table Card (Search, Filter, Table, Pagination) */}
        <div className="bg-white rounded-2xl border border-[#DCE3ED] shadow-2xs overflow-hidden">
          {/* Filters Bar */}
          <DevelopmentFilterBar
            search={filters.search}
            onSearchChange={handleSearchChange}
            projectFilter={filters.project}
            onProjectFilterChange={handleProjectFilterChange}
            environmentFilter={filters.environment}
            onEnvironmentFilterChange={handleEnvironmentFilterChange}
            statusFilter={filters.status}
            onStatusFilterChange={handleStatusFilterChange}
            reviewStatusFilter={filters.reviewStatus}
            onReviewStatusFilterChange={handleReviewStatusFilterChange}
            onClearFilters={handleClearFilters}
            activeFilterCount={activeFilterCount}
          />

          {/* Table */}
          <DevelopmentTable
            records={paginatedRecords}
            onViewDetails={openViewModal}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onUpdateCodeReviewStatus={handleUpdateCodeReviewStatus}
            onUpdateStatus={handleUpdateStatus}
            onShowToast={showToast}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
            onIdClick={(type, id) => {
              // Quick view on development ID click
              if (type === 'dev') {
                const rec = records.find((r) => r.developmentId === id);
                if (rec) openViewModal(rec);
              }
            }}
          />

          {/* Pagination Footer */}
          <DevelopmentPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={totalElements}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {/* Add Development Modal */}
      <AddDevelopmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddRecord}
        nextId={nextDevelopmentId}
      />

      {/* View Development Details Modal */}
      <ViewDevelopmentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        record={selectedRecord}
        onEdit={(rec) => openEditModal(rec)}
      />

      {/* Edit Development Modal */}
      <EditDevelopmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        record={selectedRecord}
        onSave={handleEditRecord}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRecord}
        title="Delete Development Entry"
        itemIdentifier={selectedRecord?.developmentId}
        itemType="development record"
        message={`Are you sure you want to delete development record ${selectedRecord?.developmentId}? This will remove tracking for branch ${selectedRecord?.branch}.`}
      />

      {/* Toast Notification */}
      <ToastNotification toasts={toasts} onDismiss={closeToast} position="top-right" />
    </div>
  );
};

export default DevelopmentPage;

