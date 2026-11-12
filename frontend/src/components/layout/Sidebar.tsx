import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, X, ChevronsDownUp, ChevronsUpDown, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { navigationSections, footerNavigationItems } from '../../config/navigation';
import { NavSection, NavItem } from '../../types/navigation';
import { colors } from '../../constants/theme';
import { logoutSession } from '../../services/api/apiClient';
import { FlyoutPortal, SearchFlyoutPortal } from './FlyoutPortal';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed: controlledCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutSession();
    onCloseMobile?.();
    navigate('/login', { replace: true });
  };

  // Internal state if not controlled externally (starts collapsed by default)
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  const [menuSearch, setMenuSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const expandedSearchInputRef = useRef<HTMLInputElement>(null);

  // Category flyout portal state for collapsed rail mode
  const [flyoutSection, setFlyoutSection] = useState<NavSection | null>(null);
  const [flyoutAnchorRect, setFlyoutAnchorRect] = useState<DOMRect | null>(null);
  const flyoutCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Search flyout portal state for collapsed rail mode
  const [isSearchFlyoutOpen, setIsSearchFlyoutOpen] = useState(false);
  const [searchAnchorRect, setSearchAnchorRect] = useState<DOMRect | null>(null);
  const searchCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const openSearchFlyout = (e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    if (searchCloseTimerRef.current) {
      clearTimeout(searchCloseTimerRef.current);
      searchCloseTimerRef.current = null;
    }
    closeFlyoutImmediate();
    const rect = e.currentTarget.getBoundingClientRect();
    setSearchAnchorRect(rect);
    setIsSearchFlyoutOpen(true);
  };

  const scheduleCloseSearchFlyout = () => {
    if (searchCloseTimerRef.current) {
      clearTimeout(searchCloseTimerRef.current);
    }
    searchCloseTimerRef.current = setTimeout(() => {
      setIsSearchFlyoutOpen(false);
      setSearchAnchorRect(null);
    }, 220);
  };

  const cancelCloseSearchFlyout = () => {
    if (searchCloseTimerRef.current) {
      clearTimeout(searchCloseTimerRef.current);
      searchCloseTimerRef.current = null;
    }
  };

  const closeSearchFlyoutImmediate = () => {
    if (searchCloseTimerRef.current) {
      clearTimeout(searchCloseTimerRef.current);
      searchCloseTimerRef.current = null;
    }
    setIsSearchFlyoutOpen(false);
    setSearchAnchorRect(null);
  };

  const openFlyout = (section: NavSection, e: React.MouseEvent<HTMLElement>) => {
    if (!isCollapsed) return;
    closeSearchFlyoutImmediate();
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyoutAnchorRect(rect);
    setFlyoutSection(section);
  };

  const scheduleCloseFlyout = () => {
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
    }
    flyoutCloseTimerRef.current = setTimeout(() => {
      setFlyoutSection(null);
      setFlyoutAnchorRect(null);
    }, 150);
  };

  const cancelCloseFlyout = () => {
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
  };

  const closeFlyoutImmediate = () => {
    if (flyoutCloseTimerRef.current) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
    setFlyoutSection(null);
    setFlyoutAnchorRect(null);
  };

  const handleToggleCollapse = () => {
    closeFlyoutImmediate();
    closeSearchFlyoutImmediate();
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed((prev) => !prev);
    }
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar rail
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleToggleCollapse]);

  // Management expanded by default; other sections collapsed by default
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationSections.forEach((section) => {
      initial[section.id] = section.defaultExpanded ?? false;
    });
    return initial;
  });

  // Automatically expand the section containing the active route
  useEffect(() => {
    const activeSection = navigationSections.find((section) =>
      section.items.some(
        (item) =>
          item.path === location.pathname ||
          (item.path === '/management/ceo-dashboard' &&
            (location.pathname === '/' || location.pathname === ''))
      )
    );

    if (activeSection) {
      setExpandedSections((prev) => ({
        ...prev,
        [activeSection.id]: true,
      }));
    }
  }, [location.pathname]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const areAnyExpanded = useMemo(() => {
    return Object.values(expandedSections).some(Boolean);
  }, [expandedSections]);

  const toggleAllSections = () => {
    setExpandedSections((prev) => {
      const anyOpen = Object.values(prev).some(Boolean);
      const next: Record<string, boolean> = {};
      navigationSections.forEach((section) => {
        next[section.id] = !anyOpen;
      });
      return next;
    });
  };

  const isCurrentActive = (path: string) => {
    if (
      path === '/management/ceo-dashboard' &&
      (location.pathname === '/' || location.pathname === '')
    ) {
      return true;
    }
    if (path === '/hr/attendance' && (location.pathname === '/attendance' || location.pathname === '/hr/attendance')) {
      return true;
    }
    if (path === '/clients/list' && (location.pathname === '/clients' || location.pathname === '/clients/list')) {
      return true;
    }
    if (path === '/finance/payments' && (location.pathname === '/payments' || location.pathname === '/finance/payments')) {
      return true;
    }
    return location.pathname === path;
  };

  const isSectionActive = (section: NavSection) => {
    return section.items.some(
      (item) =>
        item.path === location.pathname ||
        (item.path === '/management/ceo-dashboard' &&
          (location.pathname === '/' || location.pathname === '')) ||
        (item.path === '/hr/attendance' &&
          (location.pathname === '/attendance' || location.pathname.startsWith('/hr/attendance'))) ||
        (item.path === '/clients/list' &&
          (location.pathname === '/clients' || location.pathname.startsWith('/clients'))) ||
        (item.path === '/finance/payments' &&
          (location.pathname === '/payments' || location.pathname.startsWith('/finance/payments')))
    );
  };

  // Filter navigation sections based on menu search query
  const filteredSections = useMemo(() => {
    const query = menuSearch.toLowerCase().trim();
    if (!query) return navigationSections;

    return navigationSections
      .map((section) => {
        const sectionMatches = section.title.toLowerCase().includes(query);
        const matchingItems = section.items.filter((item) =>
          item.label.toLowerCase().includes(query)
        );

        if (sectionMatches) {
          return section;
        }

        if (matchingItems.length > 0) {
          return {
            ...section,
            items: matchingItems,
          };
        }

        return null;
      })
      .filter((section): section is NavSection => section !== null);
  }, [menuSearch]);

  // Filter footer navigation items based on search query
  const filteredFooterItems = useMemo(() => {
    const query = menuSearch.toLowerCase().trim();
    if (!query) return footerNavigationItems;

    return footerNavigationItems.filter((item) =>
      item.label.toLowerCase().includes(query)
    );
  }, [menuSearch]);

  const hasNoResults = filteredSections.length === 0 && filteredFooterItems.length === 0;

  const sidebarWidth = isCollapsed && !isMobileOpen ? '68px' : '260px';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar-rail-transition fixed inset-y-0 left-0 z-50 md:relative md:z-30 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
        style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          maxWidth: sidebarWidth,
          height: '100vh',
          backgroundColor: colors.sidebarBg,
          borderRight: `1px solid ${colors.sidebarBorderRight}`,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          userSelect: 'none',
          flexShrink: 0,
          overflow: 'visible',
          fontFamily: "'Inter', sans-serif",
        }}
        aria-label="Aside - Main Sidebar Navigation"
      >

        {/* Brand Header */}
        <div
          style={{
            width: '100%',
            height: '64px',
            minHeight: '64px',
            maxHeight: '64px',
            borderBottom: `1px solid ${colors.sidebarHeaderBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box',
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <NavLink
            to="/management/ceo-dashboard"
            onClick={() => onCloseMobile?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              outline: 'none',
              width: '100%',
              height: '36px',
              position: 'relative',
            }}
            aria-label="Kalpanaaa Software Solutions"
          >
            {/* Full Logo - Expanded state */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '223px',
                height: '36px',
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'scale(0.88) translateX(-15px)' : 'scale(1) translateX(0)',
                pointerEvents: isCollapsed ? 'none' : 'auto',
                transition:
                  'opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <img
                src="/kalpanaaa-logo.png"
                alt="KALPANAAA SOFTWARE SOLUTIONS"
                style={{
                  width: '223px',
                  height: '36px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>

            {/* Emblem - Rail state */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                opacity: isCollapsed ? 1 : 0,
                transform: isCollapsed ? 'scale(1)' : 'scale(0.85)',
                pointerEvents: isCollapsed ? 'auto' : 'none',
                transition:
                  'opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <img
                src="/kalpanaaa-emblem.png"
                alt="KALPANAAA Emblem"
                style={{
                  width: '36px',
                  height: '36px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          </NavLink>
          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Top Sidebar Search Bar */}
        <div
          style={{
            width: '100%',
            height: '61px',
            minHeight: '61px',
            maxHeight: '61px',
            boxSizing: 'border-box',
            borderBottom: `1px solid ${colors.sidebarHeaderBorder}`,
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Expanded Search View */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '12px 13px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-12px)' : 'translateX(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transition:
                'opacity 0.2s ease, transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
            role="search"
          >
            {/* Search Input Box */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                minWidth: 0,
                height: '36px',
                backgroundColor: '#101C38',
                border: `1px solid ${isSearchFocused ? '#4F46E5' : '#1A294E'}`,
                borderRadius: '8px',
                padding: '0 10px',
                boxSizing: 'border-box',
                boxShadow: isSearchFocused ? '0 0 0 2px rgba(79, 70, 229, 0.25)' : 'none',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <Search
                size={15}
                strokeWidth={2}
                color={isSearchFocused ? '#818CF8' : '#8A99B5'}
                style={{ flexShrink: 0, marginRight: '8px', transition: 'color 0.15s ease' }}
              />
              <input
                ref={expandedSearchInputRef}
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setMenuSearch('');
                  }
                }}
                placeholder="Search navigation..."
                aria-label="Search navigation menu"
                tabIndex={isCollapsed ? -1 : 0}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              {menuSearch && (
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  aria-label="Clear menu search"
                  tabIndex={isCollapsed ? -1 : 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: '#8A99B5',
                    borderRadius: '4px',
                    outline: 'none',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#8A99B5';
                  }}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Sub-category Collapse / Expand Toggle Button */}
            <button
              type="button"
              onClick={toggleAllSections}
              tabIndex={isCollapsed ? -1 : 0}
              aria-label={areAnyExpanded ? 'Collapse all sub-categories' : 'Expand all sub-categories'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#101C38',
                border: '1px solid #1A294E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: areAnyExpanded ? '#CAD5E8' : '#8A99B5',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
                padding: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#152755';
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = '#4F46E5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#101C38';
                e.currentTarget.style.color = areAnyExpanded ? '#CAD5E8' : '#8A99B5';
                e.currentTarget.style.borderColor = '#1A294E';
              }}
            >
              {areAnyExpanded ? (
                <ChevronsDownUp size={16} strokeWidth={2} />
              ) : (
                <ChevronsUpDown size={16} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Collapsed Rail Search Button */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isCollapsed ? 1 : 0,
              transform: isCollapsed ? 'scale(1)' : 'scale(0.85)',
              pointerEvents: isCollapsed ? 'auto' : 'none',
              transition:
                'opacity 0.2s ease, transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                closeSearchFlyoutImmediate();
                if (isCollapsed) {
                  handleToggleCollapse();
                  setTimeout(() => {
                    expandedSearchInputRef.current?.focus();
                  }, 120);
                }
              }}
              onMouseEnter={(e) => {
                openSearchFlyout(e);
              }}
              onMouseLeave={() => {
                scheduleCloseSearchFlyout();
              }}
              tabIndex={isCollapsed ? 0 : -1}
              aria-label="Search navigation"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: isSearchFlyoutOpen ? '#152755' : '#101C38',
                border: `1px solid ${isSearchFlyoutOpen ? '#3B82F6' : '#1A294E'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSearchFlyoutOpen ? '#FFFFFF' : '#8A99B5',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Search size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Menu */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Collapsed Rail View: Centered Section Icons with Flyout Portals */}
          <div
            className="sidebar-scrollable"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '68px',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              boxSizing: 'border-box',
              opacity: isCollapsed ? 1 : 0,
              pointerEvents: isCollapsed ? 'auto' : 'none',
              transform: isCollapsed ? 'translateX(0)' : 'translateX(-8px)',
              transition:
                'opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
            aria-hidden={!isCollapsed}
          >
            {navigationSections.map((section: NavSection) => {
              const isActive = isSectionActive(section);
              const SectionIcon = section.icon;

              return (
                <div
                  key={section.id}
                  onMouseEnter={(e) => openFlyout(section, e)}
                  onMouseLeave={scheduleCloseFlyout}
                  style={{ position: 'relative' }}
                >
                  <button
                    type="button"
                    onClick={(e) => openFlyout(section, e)}
                    tabIndex={isCollapsed ? 0 : -1}
                    aria-label={section.title}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? colors.secondaryBrand : 'transparent',
                      border: 'none',
                      color: isActive ? '#FFFFFF' : '#8A99B5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#FFFFFF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#8A99B5';
                      }
                    }}
                  >
                    <SectionIcon size={19} strokeWidth={isActive ? 2.3 : 1.9} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Expanded Full Accordion Menu */}
          <div
            className="sidebar-scrollable"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '260px',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '16px 11px 16px 13px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '16px',
              boxSizing: 'border-box',
              opacity: isCollapsed ? 0 : 1,
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transform: isCollapsed ? 'translateX(-12px)' : 'translateX(0)',
              transition:
                'opacity 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
            aria-hidden={isCollapsed}
          >
            {hasNoResults ? (
              <div
                style={{
                  padding: '32px 12px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  boxSizing: 'border-box',
                }}
              >
                <Search size={22} color="#475569" strokeWidth={1.5} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8' }}>
                  No results found
                </span>
                <span style={{ fontSize: '11.5px', color: '#64748B', lineHeight: '16px' }}>
                  No navigation matches &ldquo;{menuSearch}&rdquo;
                </span>
                <button
                  type="button"
                  onClick={() => setMenuSearch('')}
                  style={{
                    marginTop: '6px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    color: '#818CF8',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Clear search
                </button>
              </div>
            ) : (
              filteredSections.map((section: NavSection) => {
                const isExpanded = menuSearch.trim()
                  ? true
                  : (expandedSections[section.id] ?? false);
                const isActive = isSectionActive(section);
                const SectionIcon = section.icon;

                return (
                  <div
                    key={section.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '235px',
                      boxSizing: 'border-box',
                      marginBottom: isExpanded ? '12px' : '0px',
                    }}
                  >
                    {/* Dynamic Section Header */}
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        tabIndex={isCollapsed ? -1 : 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          height: '44px',
                          padding: '0 14px',
                          borderRadius: '12px',
                          backgroundColor: colors.secondaryBrand,
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'background-color 0.12s ease',
                          marginBottom: isExpanded ? '8px' : '0px',
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4338CA';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.secondaryBrand;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <SectionIcon size={18} strokeWidth={2.2} color="#FFFFFF" />
                          <span
                            style={{ fontSize: '14.5px', fontWeight: 600, letterSpacing: '0.1px' }}
                          >
                            {section.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={17} strokeWidth={2.2} color="#FFFFFF" />
                        ) : (
                          <ChevronDown size={17} strokeWidth={2.2} color="#FFFFFF" />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        tabIndex={isCollapsed ? -1 : 0}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          height: '44px',
                          padding: '0 14px',
                          borderRadius: '12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#CAD5E8',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          transition: 'background-color 0.12s ease, color 0.12s ease',
                          marginBottom: isExpanded ? '6px' : '0px',
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#CAD5E8';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                          <SectionIcon size={18} strokeWidth={1.9} color="#8A99B5" />
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              letterSpacing: '0.1px',
                            }}
                          >
                            {section.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={16} strokeWidth={2} style={{ color: '#8A99B5' }} />
                        ) : (
                          <ChevronDown size={16} strokeWidth={2} style={{ color: '#8A99B5' }} />
                        )}
                      </button>
                    )}

                    {/* Submenu Items */}
                    <div className={`sidebar-accordion-wrapper ${isExpanded ? 'expanded' : 'collapsed'}`}>
                      <div className="sidebar-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                        {section.items.map((item: NavItem) => {
                          const active = isCurrentActive(item.path);
                          const ItemIcon = item.icon;

                          return (
                            <NavLink
                              key={item.id}
                              to={item.path}
                              onClick={() => onCloseMobile?.()}
                              tabIndex={isCollapsed ? -1 : 0}
                              className={`sidebar-nav-item ${active ? 'active' : ''}`}
                            >
                              <span className="sidebar-item-icon">
                                <ItemIcon
                                  size={18}
                                  strokeWidth={active ? 2.1 : 1.8}
                                  color={active ? '#93C5FD' : '#8A99B5'}
                                />
                              </span>
                              <span className="sidebar-item-label">{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Anchored Bottom Footer */}
        <div
          style={{
            width: '100%',
            height: '110px',
            minHeight: '110px',
            maxHeight: '110px',
            borderTop: `1px solid ${colors.sidebarHeaderBorder}`,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: colors.sidebarBg,
            flexShrink: 0,
            boxSizing: 'border-box',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Rail Footer Icons */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '68px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isCollapsed ? 1 : 0,
              pointerEvents: isCollapsed ? 'auto' : 'none',
              transform: isCollapsed ? 'translateX(0)' : 'translateX(-8px)',
              transition:
                'opacity 0.22s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
            aria-hidden={!isCollapsed}
          >
            {footerNavigationItems.map((item: NavItem) => {
              const active = isCurrentActive(item.path);
              const FooterIcon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  aria-label={item.label}
                  tabIndex={isCollapsed ? 0 : -1}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    backgroundColor: active ? colors.sidebarActivePill : 'transparent',
                    color: active ? '#FFFFFF' : '#8A99B5',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#8A99B5';
                    }
                  }}
                >
                  <FooterIcon
                    size={17}
                    strokeWidth={1.9}
                    color={active ? '#60A5FA' : '#7E8DA6'}
                  />
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              tabIndex={isCollapsed ? 0 : -1}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: '#8A99B5',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8A99B5';
              }}
            >
              <LogOut size={17} strokeWidth={1.9} color="#7E8DA6" />
            </button>
          </div>

          {/* Expanded Footer Items */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '260px',
              height: '100%',
              padding: '14px 13px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '4px',
              boxSizing: 'border-box',
              opacity: isCollapsed ? 0 : 1,
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transform: isCollapsed ? 'translateX(-12px)' : 'translateX(0)',
              transition:
                'opacity 0.2s cubic-bezier(0.2, 0, 0, 1), transform 0.28s cubic-bezier(0.2, 0, 0, 1)',
            }}
            aria-hidden={isCollapsed}
          >
            {filteredFooterItems.map((item: NavItem) => {
              const active = isCurrentActive(item.path);
              const FooterIcon = item.icon;

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => onCloseMobile?.()}
                  tabIndex={isCollapsed ? -1 : 0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    height: '36px',
                    padding: '0 14px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '13.5px',
                    fontFamily: "'Inter', sans-serif",
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                    backgroundColor: active ? colors.sidebarActivePill : 'transparent',
                    color: active ? '#FFFFFF' : '#8A99B5',
                    fontWeight: active ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#8A99B5';
                    }
                  }}
                >
                  <FooterIcon
                    size={16}
                    strokeWidth={1.8}
                    color={active ? '#60A5FA' : '#7E8DA6'}
                  />
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
            <button
              type="button"
              onClick={handleLogout}
              tabIndex={isCollapsed ? -1 : 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                height: '36px',
                padding: '0 14px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#8A99B5',
                fontSize: '13.5px',
                fontWeight: 400,
                fontFamily: "'Inter', sans-serif",
                textAlign: 'left',
                cursor: 'pointer',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8A99B5';
              }}
            >
              <LogOut size={16} strokeWidth={1.8} color="#7E8DA6" />
              <span
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Log out
              </span>
            </button>
          </div>
        </div>

        {/* Option 19: Half Circle Sidebar Rail Toggle */}
        <button
          type="button"
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          style={{
            position: 'absolute',
            top: '16px',
            right: isCollapsed ? '0px' : '-14px',
            width: '14px',
            height: '32px',
            backgroundColor: '#0F172A',
            border: '1px solid #1E293B',
            borderRight: isCollapsed ? 'none' : '1px solid #1E293B',
            borderLeft: isCollapsed ? '1px solid #1E293B' : 'none',
            borderTopLeftRadius: isCollapsed ? '9999px' : '0px',
            borderBottomLeftRadius: isCollapsed ? '9999px' : '0px',
            borderTopRightRadius: isCollapsed ? '0px' : '9999px',
            borderBottomRightRadius: isCollapsed ? '0px' : '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: isCollapsed ? '-2px 0 6px rgba(0, 0, 0, 0.25)' : '2px 0 6px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.22s cubic-bezier(0.2, 0, 0, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1E293B';
            e.currentTarget.style.borderColor = '#4F46E5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0F172A';
            e.currentTarget.style.borderColor = '#1E293B';
          }}
        >
          {isCollapsed ? (
            <ChevronLeft
              size={11}
              strokeWidth={2.8}
              color="#FFFFFF"
              style={{ marginLeft: '1px' }}
            />
          ) : (
            <ChevronRight
              size={11}
              strokeWidth={2.8}
              color="#FFFFFF"
              style={{ marginRight: '1px' }}
            />
          )}
        </button>
      </aside>

      {/* Floating Submenu Flyout Portal for Collapsed Rail Mode */}
      <FlyoutPortal
        section={flyoutSection}
        anchorRect={flyoutAnchorRect}
        isOpen={Boolean(isCollapsed && flyoutSection && flyoutAnchorRect)}
        onClose={closeFlyoutImmediate}
        onMouseEnter={cancelCloseFlyout}
        onMouseLeave={scheduleCloseFlyout}
        currentPath={location.pathname}
      />

      {/* Floating Search Flyout Portal for Collapsed Rail Mode */}
      <SearchFlyoutPortal
        isOpen={Boolean(isCollapsed && isSearchFlyoutOpen && searchAnchorRect)}
        anchorRect={searchAnchorRect}
        onClose={closeSearchFlyoutImmediate}
        onMouseEnter={cancelCloseSearchFlyout}
        onMouseLeave={scheduleCloseSearchFlyout}
        currentPath={location.pathname}
      />
    </>
  );
};

export default Sidebar;
