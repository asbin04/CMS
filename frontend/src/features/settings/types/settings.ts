import { ThemeMode } from '../../../utils/theme';

export interface UserProfileSettings {
  username: string;
  displayName: string;
  role: string;
  department: string | null;
  employeeId: string | null;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  avatarUrl?: string | null;
}

export interface UserSecuritySettings {
  passwordChangedAt: string | null;
  mfaEnabled: boolean;
  mfaMethod: string;
  activeSessionCount: number;
  lastLoginAt: string | null;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  taskApprovalAlerts: boolean;
  marketingUpdates: boolean;
}

export interface AppearanceSettings {
  theme: ThemeMode;
}

export interface UserSettingsPayload {
  profile: UserProfileSettings;
  security: UserSecuritySettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}

export interface UpdateProfilePayload {
  displayName: string;
  email: string;
  phone: string;
  department: string;
  employeeId: string;
  jobTitle: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateMfaPayload {
  enabled: boolean;
  method?: string;
}

export interface UserSessionItem {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string | null;
  current: boolean;
  active: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface LoginHistoryItem {
  id: string;
  eventType: string;
  status: string;
  deviceName: string | null;
  browser: string | null;
  ipAddress: string | null;
  details: string | null;
  occurredAt: string;
}

