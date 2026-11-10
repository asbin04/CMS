import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/apiClient';
import { dashboardService } from '../../services/dashboardService';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export interface AppLayoutContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchClear: () => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
}

export const AppLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('—');
  const [userName, setUserName] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('auth_user_name') : null) || '—';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('auth_user_role') : null) || '—';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('auth_user_email') : null) || '—';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuthUser = () => {
      const storedName = localStorage.getItem('auth_user_name');
      const storedRole = localStorage.getItem('auth_user_role');
      const storedEmail = localStorage.getItem('auth_user_email');
      if (storedName) setUserName(storedName);
      if (storedRole) setUserRole(storedRole);
      if (storedEmail) setUserEmail(storedEmail);
    };

    syncAuthUser();
    window.addEventListener('auth_user_changed', syncAuthUser);
    window.addEventListener('storage', syncAuthUser);

    dashboardService.getDashboardData()
      .then((data) => {
        if (data.settings?.active_date_range) setDateRange(data.settings.active_date_range);
        const storedName = localStorage.getItem('auth_user_name');
        const storedRole = localStorage.getItem('auth_user_role');
        if (!storedName && data.settings?.user_name) setUserName(data.settings.user_name);
        if (!storedRole && data.settings?.user_role) setUserRole(data.settings.user_role);
      })
      .catch(() => { });

    return () => {
      window.removeEventListener('auth_user_changed', syncAuthUser);
      window.removeEventListener('storage', syncAuthUser);
    };
  }, []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Side rail defaults to expanded; toggles and persists preference in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('cms_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cms_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
      }}
    >
      {/* CMS Main Sidebar with Collapsible Rail & Responsive Mobile Drawer */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area: Header pinned at top, Main scrolling */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#F8FAFC',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDateRange={dateRange}
          onDateRangeChange={setDateRange}
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          onToggleSidebar={toggleSidebar}
        />
        <main
          style={{
            flex: 1,
            width: '100%',
            minWidth: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Outlet
            context={{
              searchQuery,
              setSearchQuery,
              onSearchClear: () => setSearchQuery(''),
              dateRange,
              setDateRange,
              isEditModalOpen,
              setIsEditModalOpen,
              isSidebarCollapsed,
            }}
          />
        </main>
      </div>
    </div>
  );
};
