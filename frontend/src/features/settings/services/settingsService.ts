import { apiClient } from '../../../services/api/apiClient';
import { API_ENDPOINTS } from '../../../services/api/apiEndpoints';
import { ThemeMode } from '../../../utils/theme';
import {
  ChangePasswordPayload,
  LoginHistoryItem,
  NotificationSettings,
  UpdateMfaPayload,
  UpdateProfilePayload,
  UserSessionItem,
  UserSettingsPayload,
} from '../types/settings';

export const settingsService = {
  getSettings: async (options?: { skipCache?: boolean }): Promise<UserSettingsPayload> => {
    const response = await apiClient.get<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.BASE,
      undefined,
      options
    );
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<UserSettingsPayload> => {
    const response = await apiClient.put<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.PROFILE,
      payload
    );
    return response.data;
  },

  changePassword: async (payload: ChangePasswordPayload): Promise<UserSettingsPayload> => {
    const response = await apiClient.put<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.PASSWORD,
      payload
    );
    return response.data;
  },

  updateMfa: async (payload: UpdateMfaPayload): Promise<UserSettingsPayload> => {
    const response = await apiClient.put<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.MFA,
      payload
    );
    return response.data;
  },

  getSessions: async (): Promise<UserSessionItem[]> => {
    const response = await apiClient.get<UserSessionItem[]>(
      API_ENDPOINTS.SETTINGS.SESSIONS,
      undefined,
      { skipCache: true }
    );
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<UserSessionItem[]> => {
    const response = await apiClient.post<UserSessionItem[]>(
      API_ENDPOINTS.SETTINGS.REVOKE_SESSION(sessionId)
    );
    return response.data;
  },

  revokeOtherSessions: async (): Promise<UserSessionItem[]> => {
    const response = await apiClient.post<UserSessionItem[]>(
      API_ENDPOINTS.SETTINGS.REVOKE_OTHER_SESSIONS
    );
    return response.data;
  },

  getLoginHistory: async (): Promise<LoginHistoryItem[]> => {
    const response = await apiClient.get<LoginHistoryItem[]>(
      API_ENDPOINTS.SETTINGS.LOGIN_HISTORY,
      undefined,
      { skipCache: true }
    );
    return response.data;
  },

  updateNotifications: async (payload: NotificationSettings): Promise<UserSettingsPayload> => {
    const response = await apiClient.put<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.NOTIFICATIONS,
      payload
    );
    return response.data;
  },

  updateAppearance: async (theme: ThemeMode): Promise<UserSettingsPayload> => {
    const response = await apiClient.put<UserSettingsPayload>(
      API_ENDPOINTS.SETTINGS.APPEARANCE,
      { theme }
    );
    return response.data;
  },
};

