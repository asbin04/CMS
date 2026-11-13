import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { NavSection, NavItem } from '../../types/navigation';
import { navigationSections } from '../../config/navigation';

export const FLYOUT_PANEL_WIDTH = 280;

export const recordRecentModule = (path: string) => {
  try {
    const stored = localStorage.getItem('cms_recent_modules');
    const prev: string[] = stored ? JSON.parse(stored) : [];
    const next = [path, ...prev.filter((p) => p !== path)].slice(0, 5);
    localStorage.setItem('cms_recent_modules', JSON.stringify(next));
  } catch {
    // ignore
  }
};

export interface PaletteRowProps {
  item: NavItem;
  isActive: boolean;
  onSelect: () => void;
}

export const PaletteRow: React.FC<PaletteRowProps> = ({
  item,
  isActive,
  onSelect,
}) => {
  const ItemIcon = item.icon;

  const handleClick = () => {
    recordRecentModule(item.path);
    onSelect();
  };

  return (
    <NavLink
      key={item.id}
      to={item.path}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        height: '44px',
        minHeight: '44px',
        maxHeight: '44px',
        padding: '0 12px',
        borderRadius: '12px',
        textDecoration: 'none',
        boxSizing: 'border-box',
        transition: 'all 0.12s ease',
        backgroundColor: isActive ? '#14224A' : 'transparent',
        color: isActive ? '#FFFFFF' : '#8E9EB8',
        fontWeight: isActive ? 700 : 500,
        fontSize: '14.5px',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        userSelect: 'none',
        minWidth: 0,
        width: '100%',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.color = '#FFFFFF';
          const svg = e.currentTarget.querySelector('svg');
          if (svg) svg.style.color = '#FFFFFF';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#8E9EB8';
          const svg = e.currentTarget.querySelector('svg');
          if (svg) svg.style.color = '#5E7092';
        }
      }}
    >
      {/* Active left indicator pill */}
      {isActive && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '8px',
            bottom: '8px',
            width: '3.5px',
            backgroundColor: '#6366F1',
            borderRadius: '0 3px 3px 0',
          }}
        />
      )}
      <ItemIcon
        size={18}
        strokeWidth={isActive ? 2.2 : 1.8}
        color={isActive ? '#38BDF8' : '#5E7092'}
        style={{ flexShrink: 0, transition: 'color 0.12s ease' }}
      />
      <span
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flex: 1,
          minWidth: 0,
          fontSize: '14.5px',
          fontWeight: isActive ? 700 : 500,
        }}
      >
        {item.label}
      </span>
    </NavLink>
  );
};

interface FlyoutPortalProps {
  section: NavSection | null;
  anchorRect: DOMRect | null;
  isOpen: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  currentPath: string;
}

export const FlyoutPortal: React.FC<FlyoutPortalProps> = ({
  section,
  anchorRect,
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
  currentPath,
}) => {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useLayoutEffect(() => {
    if (flyoutRef.current) {
      setMeasuredHeight(flyoutRef.current.offsetHeight);
    }
  }, [isOpen, section]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !section || !anchorRect) {
    return null;
  }

  // Calculate position to avoid overflowing viewport vertically
  const flyoutWidth = FLYOUT_PANEL_WIDTH;
  const padding = 16;
  const effectiveHeight = measuredHeight || (90 + section.items.length * 48);

  let top = anchorRect.top;
  if (top + effectiveHeight > window.innerHeight - padding) {
    top = Math.max(padding, window.innerHeight - effectiveHeight - padding);
  }

  const left = Math.max(anchorRect.right + 10, 72);
  const SectionIcon = section.icon;

  return createPortal(
    <div
      ref={flyoutRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${flyoutWidth}px`,
        maxHeight: `calc(100vh - ${padding * 2}px)`,
        backgroundColor: '#0E1734',
        border: '1px solid #1C2B54',
        borderRadius: '20px',
        boxShadow:
          '0 24px 38px 3px rgba(0, 0, 0, 0.5), 0 9px 46px 8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        padding: '16px 14px 12px 14px',
        boxSizing: 'border-box',
        animation: 'flyoutIn 0.15s ease-out',
      }}
      role="menu"
      aria-label={`${section.title} submenu`}
    >
      {/* Hover bridge to keep flyout open during transition from anchor */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-20px',
          width: '20px',
          backgroundColor: 'transparent',
        }}
        aria-hidden="true"
      />
      {/* Category Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 2px 14px 2px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: '#5046E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(80, 70, 229, 0.3)',
          }}
        >
          <SectionIcon size={20} color="#FFFFFF" strokeWidth={2.2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.2px',
              lineHeight: '20px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {section.title}
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#5E7092',
              marginTop: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            {section.items.length} {section.items.length === 1 ? 'module' : 'modules'}
          </span>
        </div>
      </div>

      {/* Submenu Items List */}
      <div
        className="search-flyout-scrollable"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 0 0 0',
          gap: '3px',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          minHeight: 0,
          maxHeight: 'calc(100vh - 120px)',
          scrollbarGutter: 'stable',
        }}
      >
        {section.items.map((item: NavItem) => (
          <PaletteRow
            key={item.id}
            item={item}
            isActive={
              currentPath === item.path ||
              (item.path === '/management/ceo-dashboard' &&
                (currentPath === '/' || currentPath === ''))
            }
            onSelect={onClose}
          />
        ))}
      </div>
    </div>,
    document.body
  );
};

export interface SearchFlyoutPortalProps {
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  currentPath: string;
}

export const SearchFlyoutPortal: React.FC<SearchFlyoutPortalProps> = ({
  isOpen,
  anchorRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
  currentPath,
}) => {
  const flyoutRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        clearTimeout(timer);
      };
    } else {
      setSearchQuery('');
    }
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen, onClose]);

  const [recentPaths, setRecentPaths] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('cms_recent_modules');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem('cms_recent_modules');
        setRecentPaths(stored ? JSON.parse(stored) : []);
      } catch {
        setRecentPaths([]);
      }
    }
  }, [isOpen]);

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      localStorage.removeItem('cms_recent_modules');
      setRecentPaths([]);
    } catch {
      // ignore
    }
  };

  const allItemsMap = useMemo(() => {
    const map = new Map<string, NavItem>();
    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        map.set(item.path, item);
      });
    });
    return map;
  }, []);

  const recentItems = useMemo(() => {
    return recentPaths
      .map((path) => allItemsMap.get(path))
      .filter((item): item is NavItem => Boolean(item));
  }, [recentPaths, allItemsMap]);

  const handleSelect = (path: string) => {
    recordRecentModule(path);
    setRecentPaths((prev) => [path, ...prev.filter((p) => p !== path)].slice(0, 5));
    onClose();
  };

  const matchingItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const results: Array<{ item: NavItem; sectionTitle: string }> = [];

    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        if (!q || item.label.toLowerCase().includes(q) || section.title.toLowerCase().includes(q)) {
          results.push({ item, sectionTitle: section.title });
        }
      });
    });

    return results;
  }, [searchQuery]);

  useLayoutEffect(() => {
    if (flyoutRef.current) {
      setMeasuredHeight(flyoutRef.current.offsetHeight);
    }
  }, [isOpen, searchQuery, matchingItems.length, recentItems.length]);

  if (!isOpen || !anchorRect) {
    return null;
  }

  const flyoutWidth = FLYOUT_PANEL_WIDTH;
  const padding = 16;
  const totalItemCount = searchQuery.trim() ? matchingItems.length : recentItems.length;
  const effectiveHeight = measuredHeight || Math.min(520, 110 + totalItemCount * 47);

  let top = anchorRect.top;
  if (top + effectiveHeight > window.innerHeight - padding) {
    top = Math.max(padding, window.innerHeight - effectiveHeight - padding);
  }

  const left = Math.max(anchorRect.right + 10, 72);

  const isItemActive = (path: string) => {
    return (
      currentPath === path ||
      (path === '/management/ceo-dashboard' &&
        (currentPath === '/' || currentPath === ''))
    );
  };

  return createPortal(
    <div
      ref={flyoutRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${flyoutWidth}px`,
        minWidth: `${flyoutWidth}px`,
        maxWidth: `${flyoutWidth}px`,
        maxHeight: `min(520px, calc(100vh - ${padding * 2}px))`,
        backgroundColor: '#0E1734',
        border: '1px solid #1C2B54',
        borderRadius: '20px',
        boxShadow:
          '0 24px 38px 3px rgba(0, 0, 0, 0.5), 0 9px 46px 8px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
        padding: '16px 14px 12px 14px',
        boxSizing: 'border-box',
        animation: 'flyoutIn 0.15s ease-out',
      }}
      role="dialog"
      aria-label="Navigation Search"
    >
      {/* Hover bridge to keep search flyout open during transition from anchor */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '-20px',
          width: '20px',
          backgroundColor: 'transparent',
        }}
        aria-hidden="true"
      />
      {/* Search Input Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 2px 12px 2px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxSizing: 'border-box',
        }}
      >
        <Search size={18} color="#6B7C9E" strokeWidth={2.2} style={{ flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search navigation..."
          aria-label="Search navigation input"
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '13.5px',
            fontFamily: "'Inter', sans-serif",
          }}
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
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
            <X size={15} strokeWidth={2} />
          </button>
        ) : (
          <span
            style={{
              fontSize: '10.5px',
              color: '#7184A6',
              padding: '2px 6px',
              borderRadius: '5px',
              backgroundColor: '#162347',
              border: '1px solid #233560',
              fontWeight: 600,
              flexShrink: 0,
              letterSpacing: '0.3px',
              lineHeight: '14px',
            }}
          >
            ESC
          </span>
        )}
      </div>

      {/* Results List */}
      {(searchQuery.trim() || recentItems.length > 0) && (
      <div
        className="search-flyout-scrollable"
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 0 0 0',
          gap: '3px',
          overflowY: 'auto',
          overflowX: 'hidden',
          maxHeight: '380px',
          scrollbarGutter: 'stable',
          boxSizing: 'border-box',
        }}
      >
        {searchQuery ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2px 12px 6px 12px',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: '#50617F',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  fontWeight: 700,
                }}
              >
                MATCHING RESULTS
              </span>
              <span style={{ fontSize: '11.5px', color: '#50617F', fontWeight: 500 }}>
                {matchingItems.length} {matchingItems.length === 1 ? 'module' : 'modules'}
              </span>
            </div>

            {matchingItems.length === 0 ? (
              <div
                style={{
                  padding: '36px 12px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Search size={20} color="#475569" strokeWidth={1.5} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#94A3B8' }}>
                  No modules found
                </span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  No navigation matches &ldquo;{searchQuery}&rdquo;
                </span>
              </div>
            ) : (
              matchingItems.map(({ item }) => (
                <PaletteRow
                  key={item.id}
                  item={item}
                  isActive={isItemActive(item.path)}
                  onSelect={() => handleSelect(item.path)}
                />
              ))
            )}
          </>
        ) : (
          <>
            {recentItems.length > 0 && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '2px 12px 6px 12px',
                    boxSizing: 'border-box',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#50617F',
                      textTransform: 'uppercase',
                      letterSpacing: '0.8px',
                      fontWeight: 700,
                    }}
                  >
                    RECENT
                  </span>
                  <button
                    type="button"
                    onClick={handleClearRecent}
                    aria-label="Clear recent searches"
                    style={{
                      fontSize: '11px',
                      color: '#50617F',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 500,
                      letterSpacing: '0.2px',
                      transition: 'color 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#94A3B8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#50617F';
                    }}
                  >
                    Clear
                  </button>
                </div>
                {recentItems.map((item) => (
                  <PaletteRow
                    key={`recent-${item.id}`}
                    item={item}
                    isActive={isItemActive(item.path)}
                    onSelect={() => handleSelect(item.path)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
      )}
    </div>,
    document.body
  );
};
