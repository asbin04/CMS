import React, { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Building2,
  Mail,
  Phone,
  Lock,
  Shield,
  Monitor,
  Clock,
  Bell,
  ClipboardList,
  Megaphone,
  SunMoon,
} from 'lucide-react';
import { ToastNotification, useToast } from '../../../components/ui/ToastNotification';
import { applyThemePreference, ThemeMode } from '../../../utils/theme';
import { settingsService } from '../services/settingsService';
import {
  ChangePasswordPayload,
  LoginHistoryItem,
  NotificationSettings,
  UpdateMfaPayload,
  UpdateProfilePayload,
  UserSessionItem,
  UserSettingsPayload,
} from '../types/settings';
import {
  ActiveSessionsModal,
  ChangePasswordModal,
  EditProfileModal,
  getInitials,
  LoginHistoryModal,
  ManageMfaModal,
} from '../components/SettingsModals';

function formatShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso?: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return null;
  const datePart = parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

export const SettingsPage: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();

  const [settings, setSettings] = useState<UserSettingsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isManageMfaOpen, setIsManageMfaOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isLoginHistoryOpen, setIsLoginHistoryOpen] = useState(false);

  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [savingNotifKey, setSavingNotifKey] = useState<keyof NotificationSettings | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const syncAuthStorageFromSettings = useCallback((updated: UserSettingsPayload) => {
    if (typeof window === 'undefined') return;
    if (updated.profile.displayName) {
      localStorage.setItem('auth_user_name', updated.profile.displayName);
    }
    if (updated.profile.email) {
      localStorage.setItem('auth_user_email', updated.profile.email);
    }
    if (updated.profile.avatarUrl) {
      localStorage.setItem('auth_user_avatar', updated.profile.avatarUrl);
    } else {
      localStorage.removeItem('auth_user_avatar');
    }
    window.dispatchEvent(new Event('auth_user_changed'));
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await settingsService.getSettings({ skipCache: true });
      setSettings(data);
      setAvatarLoadError(false);
      syncAuthStorageFromSettings(data);
      if (data.appearance?.theme) {
        applyThemePreference(data.appearance.theme);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to load settings from the server.'
      );
    } finally {
      setLoading(false);
    }
  }, [syncAuthStorageFromSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveProfile = async (payload: UpdateProfilePayload) => {
    const updated = await settingsService.updateProfile(payload);
    setSettings(updated);
    setAvatarLoadError(false);
    syncAuthStorageFromSettings(updated);
    addToast('success', 'Profile updated', 'Your profile details have been saved.');
  };

  const handleChangePassword = async (payload: ChangePasswordPayload) => {
    const updated = await settingsService.changePassword(payload);
    setSettings(updated);
    addToast('success', 'Password changed', 'Your account password was updated successfully.');
  };

  const handleSaveMfa = async (payload: UpdateMfaPayload) => {
    const updated = await settingsService.updateMfa(payload);
    setSettings(updated);
    addToast(
      'success',
      payload.enabled ? 'MFA enabled' : 'MFA disabled',
      payload.enabled
        ? `Two-factor protection active via ${updated.security.mfaMethod}.`
        : 'Multi-factor authentication has been disabled.'
    );
  };

  const handleOpenSessions = async () => {
    setIsSessionsOpen(true);
    setSessionsLoading(true);
    try {
      const list = await settingsService.getSessions();
      setSessions(list);
    } catch (err) {
      addToast(
        'error',
        'Failed to load sessions',
        err instanceof Error ? err.message : 'Could not fetch active sessions.'
      );
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const remaining = await settingsService.revokeSession(sessionId);
      setSessions(remaining);
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              security: { ...prev.security, activeSessionCount: remaining.length },
            }
          : prev
      );
      addToast('success', 'Session revoked', 'The selected device session was signed out.');
    } catch (err) {
      addToast(
        'error',
        'Revocation failed',
        err instanceof Error ? err.message : 'Unable to revoke session.'
      );
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const remaining = await settingsService.revokeOtherSessions();
      setSessions(remaining);
      setSettings((prev) =>
        prev
          ? {
              ...prev,
              security: { ...prev.security, activeSessionCount: remaining.length },
            }
          : prev
      );
      addToast('success', 'Other sessions signed out', 'Only your current session remains active.');
    } catch (err) {
      addToast(
        'error',
        'Operation failed',
        err instanceof Error ? err.message : 'Unable to sign out other sessions.'
      );
    }
  };

  const handleOpenLoginHistory = async () => {
    setIsLoginHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const list = await settingsService.getLoginHistory();
      setLoginHistory(list);
    } catch (err) {
      addToast(
        'error',
        'Failed to load login history',
        err instanceof Error ? err.message : 'Could not fetch security history.'
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleNotification = async (key: keyof NotificationSettings) => {
    if (!settings || savingNotifKey) return;
    const previous = settings.notifications;
    const next: NotificationSettings = {
      ...previous,
      [key]: !previous[key],
    };

    setSettings({ ...settings, notifications: next });
    setSavingNotifKey(key);
    try {
      const updated = await settingsService.updateNotifications(next);
      setSettings(updated);
    } catch (err) {
      setSettings((curr) => (curr ? { ...curr, notifications: previous } : curr));
      addToast(
        'error',
        'Update failed',
        err instanceof Error ? err.message : 'Could not save notification preference.'
      );
    } finally {
      setSavingNotifKey(null);
    }
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    if (!settings) return;
    const prevTheme = settings.appearance.theme;
    setSettings({
      ...settings,
      appearance: { theme },
    });
    applyThemePreference(theme);

    try {
      const updated = await settingsService.updateAppearance(theme);
      setSettings(updated);
      addToast('success', 'Theme updated', `Display theme set to ${theme}.`);
    } catch (err) {
      setSettings((curr) =>
        curr ? { ...curr, appearance: { theme: prevTheme } } : curr
      );
      applyThemePreference(prevTheme);
      addToast(
        'error',
        'Theme update failed',
        err instanceof Error ? err.message : 'Could not save theme preference.'
      );
    }
  };

  const profile = settings?.profile;
  const security = settings?.security;
  const notifications = settings?.notifications;
  const currentTheme: ThemeMode = settings?.appearance?.theme || 'light';

  const displayName = profile?.displayName || (loading ? 'Loading...' : '—');
  const initials = profile?.displayName ? getInitials(profile.displayName) : '--';
  const roleLabel = profile?.role || '—';
  const department = profile?.department || '—';
  const email = profile?.email || '—';
  const phone = profile?.phone || '—';

  const passwordChangedLabel = formatShortDate(security?.passwordChangedAt);
  const lastLoginLabel = formatDateTime(security?.lastLoginAt);
  const activeSessionsCount = security?.activeSessionCount ?? 0;

  const notificationItems: {
    key: keyof NotificationSettings;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      subtitle: 'Receive important updates via email.',
      icon: <Mail size={16} strokeWidth={1.35} className="text-[#94A3B8]" />,
    },
    {
      key: 'inAppNotifications',
      title: 'In-App Notifications',
      subtitle: 'Get real-time notifications within the application.',
      icon: <Bell size={16} strokeWidth={1.35} className="text-[#94A3B8]" />,
    },
    {
      key: 'taskApprovalAlerts',
      title: 'Task & Approval Alerts',
      subtitle: 'Notify me about task assignments and approval requests.',
      icon: <ClipboardList size={16} strokeWidth={1.35} className="text-[#94A3B8]" />,
    },
    {
      key: 'marketingUpdates',
      title: 'Marketing & Product Updates',
      subtitle: 'Receive product updates, new features and announcements.',
      icon: <Megaphone size={16} strokeWidth={1.35} className="text-[#94A3B8]" />,
    },
  ];

  const themeOptions: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <div
      className="flex flex-col items-start p-[24px] gap-[24px] w-full max-w-[1280px] mx-auto"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <ToastNotification toasts={toasts} onDismiss={removeToast} />

      {/* Breadcrumbs & Heading */}
      <div className="flex flex-col items-start gap-[2px] w-full">
        <h1 className="text-[24px] font-bold leading-[32px] tracking-[-0.6px] text-[#0B132B]">
          Settings
        </h1>
        <p className="text-[12px] font-normal leading-[16px] text-[#64748B]">
          Manage your profile, account preferences, security settings and more.
        </p>
      </div>

      {errorMessage && (
        <div className="w-full rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[12px] font-medium text-rose-700">{errorMessage}</p>
          <button
            type="button"
            onClick={fetchSettings}
            className="px-3 h-7 rounded bg-white border border-rose-200 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section - Main Profile Card */}
      <section
        aria-label="Profile Summary"
        className="relative w-full box-border bg-white border border-[rgba(226,232,240,0.7)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[16px] px-[28px] pt-[36px] pb-[28px]"
      >
        {/* Edit Profile Button */}
        <div className="flex justify-end mb-4 md:mb-0 md:block md:absolute md:right-[25px] md:top-[33px] z-10">
          <button
            type="button"
            disabled={!settings}
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-[8px] h-[32px] px-[16px] py-[8px] bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] text-[12px] font-semibold leading-[16px] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Pencil size={14} strokeWidth={1.6} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Grid Container: Identity Column + Contact Details Column */}
        <div className="grid grid-cols-1 md:grid-cols-[283px_minmax(0,1fr)] gap-[32px] items-start w-full">
          {/* Left Sub-card: Avatar & Key Identity Metadata */}
          <div className="box-border flex flex-col items-center justify-center p-[24px] min-h-[224px] bg-[#F8FAFF] border border-[#F1F5F9] rounded-[16px] w-full">
            {/* Large Avatar */}
            <div className="pb-[12px]">
              {profile?.avatarUrl && !avatarLoadError ? (
                <img
                  src={profile.avatarUrl}
                  alt={displayName}
                  onError={() => setAvatarLoadError(true)}
                  className="w-[96px] h-[96px] rounded-full object-cover shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] border border-[#E2E8F0] bg-white"
                />
              ) : (
                <div className="w-[96px] h-[96px] rounded-full bg-[#2563EB] shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)] flex items-center justify-center">
                  <span className="text-[24px] font-bold leading-[32px] tracking-[1.2px] text-white select-none">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Heading 2 - Name */}
            <h2 className="text-[20px] font-bold leading-[28px] text-center text-[#0F172A]">
              {displayName}
            </h2>

            {/* Role Badge */}
            <div className="pt-[6px]">
              <span className="inline-flex items-center justify-center px-[14px] py-[2px] min-h-[21px] bg-[#EDE9FE] rounded-full text-[11px] font-bold leading-[16px] tracking-[0.275px] text-[#4338CA] uppercase">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Right Column: Contact Details List */}
          <div className="flex flex-col justify-center items-start pt-[8px] md:pr-[140px] w-full">
            {/* Email Address Row */}
            <div className="flex flex-row items-center pb-[14px] gap-[16px] w-full">
              <div className="w-[40px] h-[40px] rounded-[12px] bg-[#F0F3FF] flex items-center justify-center shrink-0">
                <Mail size={20} strokeWidth={1.5} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[11px] font-medium leading-[17px] text-[#64748B]">
                  Email Address
                </span>
                <span className="text-[14px] font-medium leading-[20px] text-[#0F172A] break-all">
                  {email}
                </span>
              </div>
            </div>

            {/* Phone Number Row */}
            <div className="flex flex-row items-center py-[14px] gap-[16px] w-full border-t border-[#F1F5F9]">
              <div className="w-[40px] h-[40px] rounded-[12px] bg-[#F0F3FF] flex items-center justify-center shrink-0">
                <Phone size={20} strokeWidth={1.5} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[11px] font-medium leading-[17px] text-[#64748B]">
                  Phone Number
                </span>
                <span className="text-[14px] font-medium leading-[20px] text-[#0F172A] tabular-nums">
                  {phone}
                </span>
              </div>
            </div>

            {/* Department Row */}
            <div className="flex flex-row items-center pt-[14px] gap-[16px] w-full border-t border-[#F1F5F9]">
              <div className="w-[40px] h-[40px] rounded-[12px] bg-[#F0F3FF] flex items-center justify-center shrink-0">
                <Building2 size={20} strokeWidth={1.5} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-[11px] font-medium leading-[17px] text-[#64748B]">
                  Department
                </span>
                <span className="text-[14px] font-medium leading-[20px] text-[#0F172A] truncate">
                  {department}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AccountAndSecuritySection */}
      <section
        aria-label="Account & Security"
        className="w-full box-border bg-white border border-[rgba(226,232,240,0.9)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[24px] flex flex-col"
      >
        <div className="w-full pb-[16px] border-b border-[#F1F5F9]">
          <h2 className="text-[16px] font-bold leading-[24px] text-[#0F172A]">
            Account &amp; Security
          </h2>
          <p className="text-[12px] font-normal leading-[16px] text-[#64748B]">
            Manage your account security and access settings.
          </p>
        </div>

        <div className="flex flex-col w-full">
          {/* Password Item */}
          <div className="flex flex-row items-center justify-between gap-4 py-[14px] w-full">
            <div className="flex flex-row items-center gap-[14px] min-w-0">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Lock size={16} strokeWidth={1.4} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                  Password
                </span>
                <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                  Update your account password regularly.
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-[16px] shrink-0">
              <span className="hidden sm:inline text-[11px] font-normal leading-[16px] text-[#64748B] tabular-nums">
                {passwordChangedLabel ? `Last changed on ${passwordChangedLabel}` : 'Never changed'}
              </span>
              <button
                type="button"
                disabled={!settings}
                onClick={() => setIsChangePasswordOpen(true)}
                className="box-border inline-flex items-center justify-center h-[26px] px-[12px] py-[4px] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] rounded-[4px] text-[12px] font-semibold leading-[16px] text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-50"
              >
                Change
              </button>
            </div>
          </div>

          {/* Multi-Factor Authentication Item */}
          <div className="flex flex-row items-center justify-between gap-4 py-[14px] w-full border-t border-[#F1F5F9]">
            <div className="flex flex-row items-center gap-[14px] min-w-0">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Shield size={16} strokeWidth={1.4} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                  Multi-Factor Authentication
                </span>
                <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                  Add an extra layer of security to your account.
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-[16px] shrink-0">
              {security?.mfaEnabled ? (
                <span className="box-border inline-flex items-center gap-[6px] h-[22px] px-[8px] py-[2px] bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-[10px] font-semibold leading-[16px] text-[#059669]">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#10B981]" />
                  <span>Enabled</span>
                </span>
              ) : (
                <span className="box-border inline-flex items-center gap-[6px] h-[22px] px-[8px] py-[2px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-[10px] font-semibold leading-[16px] text-[#64748B]">
                  <span className="w-[6px] h-[6px] rounded-full bg-[#94A3B8]" />
                  <span>Disabled</span>
                </span>
              )}
              <button
                type="button"
                disabled={!settings}
                onClick={() => setIsManageMfaOpen(true)}
                className="box-border inline-flex items-center justify-center h-[26px] px-[12px] py-[4px] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] rounded-[4px] text-[12px] font-semibold leading-[16px] text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-50"
              >
                Manage
              </button>
            </div>
          </div>

          {/* Active Sessions Item */}
          <div className="flex flex-row items-center justify-between gap-4 py-[14px] w-full border-t border-[#F1F5F9]">
            <div className="flex flex-row items-center gap-[14px] min-w-0">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Monitor size={16} strokeWidth={1.4} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                  Active Sessions
                </span>
                <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                  Manage your active sessions across devices.
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-[16px] shrink-0">
              <span className="hidden sm:inline text-[11px] font-normal leading-[16px] text-[#64748B] tabular-nums">
                {activeSessionsCount} {activeSessionsCount === 1 ? 'active session' : 'active sessions'}
              </span>
              <button
                type="button"
                disabled={!settings}
                onClick={handleOpenSessions}
                className="box-border inline-flex items-center justify-center h-[26px] px-[12px] py-[4px] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] rounded-[4px] text-[12px] font-semibold leading-[16px] text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>

          {/* Login History Item */}
          <div className="flex flex-row items-center justify-between gap-4 py-[14px] w-full border-t border-[#F1F5F9]">
            <div className="flex flex-row items-center gap-[14px] min-w-0">
              <div className="w-[32px] h-[32px] rounded-[8px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Clock size={16} strokeWidth={1.4} className="text-[#4F46E5]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                  Login History
                </span>
                <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                  View your recent login activity and security events.
                </span>
              </div>
            </div>
            <div className="flex flex-row items-center gap-[16px] shrink-0">
              <span className="hidden sm:inline text-[11px] font-normal leading-[16px] text-[#64748B] tabular-nums">
                {lastLoginLabel ? `Last login: ${lastLoginLabel}` : 'No logins recorded'}
              </span>
              <button
                type="button"
                disabled={!settings}
                onClick={handleOpenLoginHistory}
                className="box-border inline-flex items-center justify-center h-[26px] px-[12px] py-[4px] bg-[#F8FAFC] hover:bg-[#EFF6FF] border border-[#E2E8F0] rounded-[4px] text-[12px] font-semibold leading-[16px] text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NotificationsSection */}
      <section
        aria-label="Notifications"
        className="w-full box-border bg-white border border-[rgba(226,232,240,0.9)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[24px] flex flex-col gap-[4px]"
      >
        <div className="w-full pb-[12px] border-b border-[#F1F5F9]">
          <h2 className="text-[16px] font-bold leading-[24px] text-[#0F172A]">
            Notifications
          </h2>
          <p className="text-[12px] font-normal leading-[16px] text-[#64748B]">
            Manage how you receive notifications.
          </p>
        </div>

        <div className="flex flex-col w-full">
          {notificationItems.map((item, idx) => {
            const enabled = notifications ? notifications[item.key] : false;
            return (
              <div
                key={item.key}
                className={`flex flex-row items-center justify-between gap-4 py-[12px] w-full ${
                  idx > 0 ? 'border-t border-[#F1F5F9]' : ''
                }`}
              >
                <div className="flex flex-row items-center gap-[14px] min-w-0">
                  <div className="w-[16px] h-[16px] flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                      {item.title}
                    </span>
                    <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={item.title}
                  disabled={!settings || savingNotifKey === item.key}
                  onClick={() => handleToggleNotification(item.key)}
                  className="relative inline-flex items-center shrink-0 w-[36px] h-[20px] rounded-full transition-colors cursor-pointer disabled:opacity-60"
                  style={{ backgroundColor: enabled ? '#4F46E5' : '#E2E8F0' }}
                >
                  <span
                    className="inline-block w-[16px] h-[16px] rounded-full bg-white transition-transform"
                    style={{
                      transform: enabled ? 'translateX(18px)' : 'translateX(2px)',
                      border: enabled ? '1px solid #FFFFFF' : '1px solid #D1D5DB',
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* AppearanceSection */}
      <section
        aria-label="Appearance"
        className="w-full box-border bg-white border border-[rgba(226,232,240,0.9)] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-[12px] p-[24px] flex flex-col gap-[12px]"
      >
        <div className="w-full pb-[12px] border-b border-[#F1F5F9]">
          <h2 className="text-[16px] font-bold leading-[24px] text-[#0F172A]">
            Appearance
          </h2>
          <p className="text-[12px] font-normal leading-[16px] text-[#64748B]">
            Customize the appearance of your workspace.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
          <div className="flex flex-row items-center gap-[14px] min-w-0">
            <div className="w-[28px] h-[28px] rounded-[8px] bg-[#F8FAFC] flex items-center justify-center shrink-0">
              <SunMoon size={16} strokeWidth={1.5} className="text-[#475569]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold leading-[16px] text-[#1E293B]">
                Theme
              </span>
              <span className="text-[11px] font-normal leading-[16px] text-[#94A3B8]">
                Choose your preferred display theme.
              </span>
            </div>
          </div>

          <div
            role="radiogroup"
            aria-label="Display theme"
            className="flex flex-row items-center gap-[20px] shrink-0"
          >
            {themeOptions.map((option) => {
              const selected = currentTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!settings}
                  onClick={() => handleThemeChange(option.value)}
                  className="inline-flex items-center gap-[6px] cursor-pointer disabled:opacity-60"
                >
                  {selected ? (
                    <span className="w-[16px] h-[16px] rounded-[14px] bg-[#4F46E5] flex items-center justify-center">
                      <span className="w-[6px] h-[6px] rounded-full bg-white" />
                    </span>
                  ) : (
                    <span className="box-border w-[14px] h-[14px] rounded-[14px] bg-white border border-[#6B7280]" />
                  )}
                  <span className="text-[12px] font-normal leading-[16px] text-[#334155]">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modals */}
      {isEditProfileOpen && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      {isChangePasswordOpen && (
        <ChangePasswordModal
          onClose={() => setIsChangePasswordOpen(false)}
          onSubmit={handleChangePassword}
        />
      )}

      {isManageMfaOpen && security && (
        <ManageMfaModal
          enabled={security.mfaEnabled}
          method={security.mfaMethod}
          onClose={() => setIsManageMfaOpen(false)}
          onSave={handleSaveMfa}
        />
      )}

      {isSessionsOpen && (
        <ActiveSessionsModal
          sessions={sessions}
          loading={sessionsLoading}
          onClose={() => setIsSessionsOpen(false)}
          onRevokeSession={handleRevokeSession}
          onRevokeOthers={handleRevokeOtherSessions}
        />
      )}

      {isLoginHistoryOpen && (
        <LoginHistoryModal
          items={loginHistory}
          loading={historyLoading}
          onClose={() => setIsLoginHistoryOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingsPage;

