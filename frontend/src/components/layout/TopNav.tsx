import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, UserCheck, Shield, FileText, TrendingUp, Bell } from 'lucide-react';
import { CalendarDateRangePicker } from '../ui/CalendarDateRangePicker';
import {
  notificationService,
  PortalNotification,
  NOTIFICATION_REFRESH_EVENT,
} from '../../services/notificationService';

function formatTimeAgo(isoString?: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function getNotifIcon(type?: string) {
  switch (type?.toUpperCase()) {
    case 'APPROVAL':
      return (
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
          <UserCheck className="w-3.5 h-3.5" />
        </div>
      );
    case 'INVOICE':
      return (
        <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
      );
    case 'FOLLOW_UP':
      return (
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
          <Clock className="w-3.5 h-3.5" />
        </div>
      );
    case 'PROPOSAL':
      return (
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
          <FileText className="w-3.5 h-3.5" />
        </div>
      );
    case 'LEAD':
    case 'OPPORTUNITY':
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
          <TrendingUp className="w-3.5 h-3.5" />
        </div>
      );
    case 'CONTRACT':
      return (
        <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
          <Shield className="w-3.5 h-3.5" />
        </div>
      );
    default:
      return (
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0 mt-0.5">
          <Bell className="w-3.5 h-3.5" />
        </div>
      );
  }
}

interface TopNavProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  selectedDateRange?: string;
  onDateRangeChange?: (range: string) => void;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  userAvatar?: string;
  onToggleMobileMenu?: () => void;
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery = '',
  onSearchChange,
  selectedDateRange = '',
  onDateRangeChange,
  userName = '—',
  userRole = '—',
  userAvatar = '',
  onToggleMobileMenu,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState<boolean>(false);

  const isStoppedRef = useRef(false);
  const backoffRef = useRef(15000);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLiveNotifications = async (isInitial = false) => {
    if (isStoppedRef.current) return;
    if (document.hidden) return;

    if (isInitial) {
      setIsLoadingNotifs(true);
    }

    try {
      const data = await notificationService.getNotifications(15);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount ?? 0);
      backoffRef.current = 15000;
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = err instanceof Error ? err.message : String(err);
      if (status === 401 || message.includes('401')) {
        isStoppedRef.current = true;
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        return;
      }
      backoffRef.current = Math.min(backoffRef.current * 1.5, 60000);
    } finally {
      if (isInitial) {
        setIsLoadingNotifs(false);
      }
      if (!isStoppedRef.current) {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = setTimeout(() => {
          fetchLiveNotifications(false);
        }, backoffRef.current);
      }
    }
  };

  useEffect(() => {
    setAvatarLoadError(false);
  }, [userAvatar]);

  useEffect(() => {
    isStoppedRef.current = false;
    backoffRef.current = 15000;
    fetchLiveNotifications(true);

    const handleVisibilityChange = () => {
      if (!document.hidden && !isStoppedRef.current) {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        fetchLiveNotifications(false);
      }
    };

    const handleRefresh = () => {
      if (!isStoppedRef.current) {
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
        fetchLiveNotifications(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);

    return () => {
      isStoppedRef.current = true;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(NOTIFICATION_REFRESH_EVENT, handleRefresh);
    };
  }, []);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateRanges = React.useMemo(() => {
    const list: string[] = [];
    if (selectedDateRange && selectedDateRange !== '—') {
      list.push(selectedDateRange);
    }
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const prevYear = currentYear - 1;
    list.push(`Apr ${currentYear} - Mar ${nextYear}`);
    list.push(`Apr ${prevYear} - Mar ${currentYear}`);
    list.push(`Jan ${currentYear} - Dec ${currentYear}`);
    list.push('Last 30 Days');
    list.push('This Quarter');
    return Array.from(new Set(list));
  }, [selectedDateRange]);

  return (
    <header
      className="px-3 sm:px-6"
      style={{
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '64px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        flex: 'none',
        order: 0,
        alignSelf: 'stretch',
        flexGrow: 0,
        zIndex: 10,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Left: Search Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '0px',
          gap: '10px',
          height: '34px',
          maxWidth: '672px',
          flex: '1 1 auto',
          minWidth: 0,
        }}
      >
        {/* Container - Search Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '0px',
            isolation: 'isolate',
            width: '100%',
            maxWidth: '448px',
            height: '34px',
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          {/* Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search anything (clients, projects, invoices, employees...)"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '8px 16px 9px 36px',
              width: '100%',
              height: '34px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              flex: 'none',
              order: 0,
              alignSelf: 'stretch',
              flexGrow: 0,
              zIndex: 0,
              fontFamily: "'Inter', sans-serif",
              fontStyle: 'normal',
              fontWeight: 400,
              fontSize: '12px',
              lineHeight: '15px',
              color: '#0F172A',
              outline: 'none',
            }}
            className="placeholder:text-[#94A3B8] focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
          />

          {/* Search Icon Container */}
          <div
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '0px 0px 0px 12px',
              position: 'absolute',
              width: '28px',
              left: '0px',
              top: '0px',
              bottom: '0px',
              flex: 'none',
              order: 1,
              flexGrow: 0,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            {/* akar-icons:search 16x16 */}
            <svg
              style={{ width: '16px', height: '16px' }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right: Actions & User Info */}
      <div
        className="flex flex-row items-center justify-end gap-2 sm:gap-4 shrink-0"
        style={{
          boxSizing: 'border-box',
          height: '36px',
          flex: 'none',
          order: 1,
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
        {/* Date Filter Dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={dateRef}>
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className="hover:bg-slate-100 transition-colors w-auto sm:w-[193.31px]"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '6px 10px',
              gap: '6px',
              height: '30px',
              background: '#F8FAFC',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              borderRadius: '8px',
              flex: 'none',
              order: 0,
              flexGrow: 0,
              cursor: 'pointer',
            }}
          >
            {/* SVG Calendar 14x14 */}
            <svg
              style={{ width: '14px', height: '14px', flexShrink: 0 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="1.16667"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>

            {/* Text container */}
            <div
              className="hidden sm:flex flex-col items-start"
              style={{
                boxSizing: 'border-box',
                padding: '0px',
                width: '121.31px',
                height: '16px',
                flex: 'none',
                order: 1,
                flexGrow: 0,
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  width: '121.31px',
                  height: '16px',
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#334155',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'left',
                }}
              >
                {selectedDateRange}
              </span>
            </div>

            {/* SVG:margin chevron */}
            <div
              className="hidden sm:flex flex-col items-start justify-center"
              style={{
                boxSizing: 'border-box',
                padding: '0px 0px 0px 4px',
                width: '16px',
                height: '12px',
                flex: 'none',
                order: 2,
                flexGrow: 0,
              }}
            >
              <svg
                style={{ width: '12px', height: '12px' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </button>

          {/* Date Picker Component */}
          <CalendarDateRangePicker
            value={selectedDateRange}
            onChange={(range) => {
              onDateRangeChange?.(range);
              setIsDateOpen(false);
            }}
            isOpen={isDateOpen}
            onClose={() => setIsDateOpen(false)}
            showPresets={false}
          />
        </div>

        {/* Button - Notification Bell */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notification Bell"
            className="hover:bg-slate-100 transition-colors"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              isolation: 'isolate',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              flex: 'none',
              order: 1,
              flexGrow: 0,
              position: 'relative',
            }}
          >
            {/* SVG Bell 20x20 */}
            <svg
              style={{ width: '20px', height: '20px', zIndex: 0 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748B"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {/* Background+Border Badge */}
            <div
              style={{
                boxSizing: 'border-box',
                display: unreadCount > 0 ? 'flex' : 'none',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0px 2px',
                position: 'absolute',
                minWidth: '14px',
                height: '14px',
                right: '6px',
                top: '4.5px',
                background: '#F43F5E',
                border: '2px solid #FFFFFF',
                borderRadius: '9999px',
                flex: 'none',
                order: 1,
                flexGrow: 0,
                zIndex: 1,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  minWidth: '5.81px',
                  height: '14px',
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: '9px',
                  lineHeight: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-1.5 w-84 bg-white border border-[#E2E8F0] rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-800">Notifications</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      unreadCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {unreadCount > 0 ? `${unreadCount} New` : 'All read'}
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await notificationService.markAllAsRead();
                        setUnreadCount(0);
                        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {isLoadingNotifs && notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications right now</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={async () => {
                        if (!notif.isRead) {
                          await notificationService.markAsRead(notif.id);
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                          );
                          setUnreadCount((prev) => Math.max(0, prev - 1));
                        }
                        if (notif.link) {
                          navigate(notif.link);
                        }
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 hover:bg-slate-50 flex gap-2.5 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {getNotifIcon(notif.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              !notif.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                            }`}
                          >
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                          {notif.detail}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 self-center" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="group hover:opacity-90 transition-opacity"
            style={{
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'nowrap',
              padding: '0px 4px 0px 8px',
              gap: '8px',
              width: 'auto',
              height: '32px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              userSelect: 'none',
              flex: 'none',
              order: 2,
              flexGrow: 0,
              flexShrink: 0,
            }}
          >
            {/* Background: Avatar Container */}
            <div
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                width: '32px',
                height: '32px',
                borderRadius: '9999px',
                flex: 'none',
                order: 0,
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              {/* Overlay+Shadow */}
              <div
                style={{
                  position: 'absolute',
                  width: '32px',
                  height: '32px',
                  left: '0px',
                  top: '0px',
                  boxShadow: '0px 0px 0px 2px #DBEAFE',
                  borderRadius: '9999px',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* image 117 */}
              <img
                src={(!avatarLoadError && userAvatar) ? userAvatar : '/avatar.jpg'}
                alt={userName && userName !== '—' ? userName : 'User'}
                onError={() => setAvatarLoadError(true)}
                style={{
                  boxSizing: 'border-box',
                  width: '32px',
                  height: '32px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  display: 'block',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                  zIndex: 1,
                }}
              />
            </div>

            {/* Container: Name & Role */}
            <div
              className="hidden sm:flex flex-col items-start justify-center"
              style={{
                boxSizing: 'border-box',
                padding: '0px',
                width: 'auto',
                minWidth: '0',
                maxWidth: '240px',
                height: '30px',
                flex: '0 0 auto',
                order: 1,
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              {/* Name Row */}
              <div
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0px',
                  width: 'auto',
                  maxWidth: '240px',
                  height: '15px',
                  flex: 'none',
                  order: 0,
                  flexGrow: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 600,
                    fontSize: '12px',
                    lineHeight: '15px',
                    display: 'block',
                    color: '#1E293B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '240px',
                  }}
                  title={userName && userName !== '—' ? userName : 'User'}
                >
                  {userName && userName !== '—' ? userName : 'User'}
                </span>
              </div>

              {/* Role Row */}
              <div
                style={{
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0px',
                  width: 'auto',
                  maxWidth: '240px',
                  height: '15px',
                  flex: 'none',
                  order: 1,
                  flexGrow: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 500,
                    fontSize: '10px',
                    lineHeight: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {userRole && userRole !== '—' ? userRole : 'Role'}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
