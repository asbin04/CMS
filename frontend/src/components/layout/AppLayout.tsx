import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { settingsService } from '../../features/settings/services/settingsService';
import { apiClient } from '../../services/api/apiClient';
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
  const currentYear = new Date().getFullYear();
  const defaultFiscalYear = `Apr ${currentYear} - Mar ${currentYear + 1}`;
  const [dateRange, setDateRange] = useState<string>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cms_active_date_range') : null;
    return (stored && stored !== 'Apr 2024 - Mar 2025' && stored !== '—') ? stored : '';
  });
  const [userName, setUserName] = useState<string>('—');
  const [userRole, setUserRole] = useState<string>('—');
  const [userEmail, setUserEmail] = useState<string>('—');
  const [userAvatar, setUserAvatar] = useState<string>(() => {
    return (typeof window !== 'undefined' ? localStorage.getItem('auth_user_avatar') : null) || '';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const syncAuthUser = () => {
      const storedAvatar = localStorage.getItem('auth_user_avatar');
      setUserAvatar(storedAvatar || '');
    };

    syncAuthUser();
    window.addEventListener('auth_user_changed', syncAuthUser);
    window.addEventListener('storage', syncAuthUser);

    apiClient
      .get<{ username: string; name: string; role: string; email: string }>('/auth/me', undefined, { skipCache: true })
      .then((res) => {
        const me = res?.data;
        if (!me) return;
        const verifiedName = me.name || me.username || '—';
        const verifiedRole = me.role || '—';
        const verifiedEmail = me.email || '—';
        setUserName(verifiedName);
        setUserRole(verifiedRole);
        setUserEmail(verifiedEmail);
        try {
          if (verifiedName !== '—') localStorage.setItem('auth_user_name', verifiedName);
          if (verifiedRole !== '—') localStorage.setItem('auth_user_role', verifiedRole);
          if (verifiedEmail !== '—') localStorage.setItem('auth_user_email', verifiedEmail);
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => { });

    settingsService.getSettings()
      .then((settingsData) => {
        const avatar = settingsData?.profile?.avatarUrl || '';
        setUserAvatar(avatar);
        try {
          if (avatar) {
            localStorage.setItem('auth_user_avatar', avatar);
          } else {
            localStorage.removeItem('auth_user_avatar');
          }
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => { });

    dashboardService.getDashboardData()
      .then((data) => {
        if (data.settings?.active_date_range && data.settings.active_date_range !== 'Apr 2024 - Mar 2025' && data.settings.active_date_range !== '—') {
          setDateRange(data.settings.active_date_range);
          try {
            localStorage.setItem('cms_active_date_range', data.settings.active_date_range);
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch(() => { });

    return () => {
      window.removeEventListener('auth_user_changed', syncAuthUser);
      window.removeEventListener('storage', syncAuthUser);
    };
  }, []);

  const location = useLocation();

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Responsive tablet sidebar auto-collapse
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth >= 768 && window.innerWidth < 1024) {
          setIsSidebarCollapsed(true);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Side rail defaults to expanded; toggles and persists preference in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && window.innerWidth >= 768) {
      return true;
    }
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
        width: '100%',
        maxWidth: '100%',
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
          onDateRangeChange={(newRange) => {
            setDateRange(newRange);
            try {
              localStorage.setItem('cms_active_date_range', newRange);
            } catch {
              // ignore storage errors
            }
          }}
          userName={userName}
          userRole={userRole}
          userEmail={userEmail}
          userAvatar={userAvatar}
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
          <React.Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading...</div>}>
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
          </React.Suspense>
        </main>
      </div>
    </div>
  );
};
