const BASE_URL = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE_URL || '/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, data?: unknown, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

const GET_CACHE_TTL_MS = 20_000;
const MAX_CACHE_ENTRIES = 200;
const inFlightGetRequests = new Map<string, Promise<ApiResponse<unknown>>>();
const getResponseCache = new Map<string, { data: ApiResponse<unknown>; expiresAt: number }>();

function isTestEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
}

export function clearApiCache(): void {
  getResponseCache.clear();
}

export function clearAuthStorage(): void {
  clearApiCache();
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user_name');
  localStorage.removeItem('auth_user_username');
  localStorage.removeItem('auth_user_role');
  localStorage.removeItem('auth_user_email');
  localStorage.removeItem('auth_user_avatar');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user_name');
  sessionStorage.removeItem('auth_user_username');
  sessionStorage.removeItem('auth_user_role');
  sessionStorage.removeItem('auth_user_email');
  sessionStorage.removeItem('auth_user_avatar');
}

export function logoutSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('logged_out', 'true');
  }
  clearAuthStorage();
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname + window.location.search;
  if (window.location.pathname !== '/login') {
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = redirectUrl;
  }
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

interface RequestOptions extends RequestInit {
  isRetry?: boolean;
}

async function executeRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const normalizedEndpoint = endpoint.startsWith(BASE_URL)
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : normalizedEndpoint;

  const isAuthLogin = endpoint.includes('/auth/login');
  const token = getStoredAuthToken();

  const isTestEnv = isTestEnvironment();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: unknown) {
    const rawMsg = networkErr instanceof Error ? networkErr.message : String(networkErr);
    const message = `Cannot connect to server at ${url}: ${rawMsg}`;
    throw new ApiError(message, 0);
  }

  // Handle 401/403 Unauthorized or Forbidden on protected requests
  if ((response.status === 401 || response.status === 403) && !isAuthLogin) {
    clearAuthStorage();

    if (!isTestEnv) {
      redirectToLogin();
    }

    throw new ApiError(
      response.status === 403
        ? 'Access restricted to administrators'
        : 'Unauthorized: Please log in again.',
      response.status
    );
  }

  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && !isAuthLogin && response.ok) {
    clearApiCache();
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {
      success: true,
      message: 'Operation completed successfully',
      data: {} as T,
      status: 204,
    };
  }

  let responseData: any = null;
  try {
    responseData = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    const errorMsg = responseData?.message || `Request failed with status ${response.status}`;
    const fieldErrors = responseData?.fieldErrors || undefined;
    throw new ApiError(errorMsg, response.status, responseData, fieldErrors);
  }

  // Normalize ApiResponse envelope
  if (responseData && typeof responseData === 'object' && 'data' in responseData && 'success' in responseData) {
    return responseData as ApiResponse<T>;
  }

  return {
    success: true,
    message: 'Operation successful',
    data: responseData as T,
    status: response.status,
  };
}

export const apiClient = {
  clearCache: clearApiCache,

  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
    options?: { skipCache?: boolean }
  ): Promise<ApiResponse<T>> => {
    let query = '';
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        query = `?${queryString}`;
      }
    }

    const fullEndpoint = `${endpoint}${query}`;
    const shouldUseCacheAndDedup = !isTestEnvironment() && !options?.skipCache;

    if (shouldUseCacheAndDedup) {
      const cached = getResponseCache.get(fullEndpoint);
      if (cached) {
        if (cached.expiresAt > Date.now()) {
          return Promise.resolve(cached.data as ApiResponse<T>);
        }
        getResponseCache.delete(fullEndpoint);
      }

      const inFlight = inFlightGetRequests.get(fullEndpoint);
      if (inFlight) {
        return inFlight as Promise<ApiResponse<T>>;
      }
    }

    const requestPromise = executeRequest<T>(fullEndpoint, { method: 'GET' })
      .then((res) => {
        if (!isTestEnvironment()) {
          if (getResponseCache.size >= MAX_CACHE_ENTRIES) {
            const oldestKey = getResponseCache.keys().next().value;
            if (oldestKey !== undefined) {
              getResponseCache.delete(oldestKey);
            }
          }
          getResponseCache.set(fullEndpoint, {
            data: res as ApiResponse<unknown>,
            expiresAt: Date.now() + GET_CACHE_TTL_MS,
          });
        }
        return res;
      })
      .finally(() => {
        inFlightGetRequests.delete(fullEndpoint);
      });

    if (shouldUseCacheAndDedup) {
      inFlightGetRequests.set(fullEndpoint, requestPromise as Promise<ApiResponse<unknown>>);
    }

    return requestPromise;
  },

  post: <T>(endpoint: string, body?: unknown) =>
    executeRequest<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown) =>
    executeRequest<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    executeRequest<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    executeRequest<T>(endpoint, {
      method: 'DELETE',
    }),
};

// Adapter for any legacy or third-party call site expecting direct data return
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await executeRequest<T>(url, options);
  return res.data;
}
