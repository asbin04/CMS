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

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user_name');
  localStorage.removeItem('auth_user_role');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user_name');
  sessionStorage.removeItem('auth_user_role');
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname + window.location.search;
  if (window.location.pathname !== '/login') {
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    window.location.href = redirectUrl;
  }
}

let devTokenPromise: Promise<string | null> | null = null;

async function acquireDevToken(): Promise<string | null> {
  try {
    const preferredUsername =
      (typeof window !== 'undefined' ? localStorage.getItem('auth_user_username') : null) ||
      'akshit.ujjain';
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: preferredUsername, password: 'password123' }),
    });
    if (authRes.ok) {
      const resData = await authRes.json();
      const jwt = resData?.data?.token;
      if (jwt) {
        localStorage.setItem('auth_token', jwt);
        if (resData?.data?.username) {
          localStorage.setItem('auth_user_name', resData.data.name || resData.data.username);
          localStorage.setItem('auth_user_username', resData.data.username);
        }
        if (resData?.data?.role) {
          localStorage.setItem('auth_user_role', resData.data.role);
        }
        return jwt;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
}

interface RequestOptions extends RequestInit {
  isRetry?: boolean;
}

interface CustomRequestInit extends RequestInit {
  _isRetry?: boolean;
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
  let token = getStoredAuthToken();

  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

  // In dev browser sessions without token, if not logged out and not /auth/login, try acquiring dev token
  if (!token && import.meta.env.DEV && !isTestEnv && !isAuthLogin) {
    token = await acquireDevToken();
  }

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

  // Handle 401/403 Unauthorized
  if (response.status === 401 || response.status === 403) {
    clearAuthStorage();

    // Never loop: retry at most once, and never retry /auth/login
    if (!options.isRetry && !isAuthLogin && import.meta.env.DEV && !isTestEnv && sessionStorage.getItem('logged_out') !== 'true') {
      const freshToken = await acquireDevToken();
      if (freshToken) {
        return executeRequest<T>(endpoint, {
          ...options,
          isRetry: true,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${freshToken}`,
          },
        });
      }
    }

    // Otherwise redirect to /login
    if (!isAuthLogin && !isTestEnv) {
      redirectToLogin();
    }

    throw new ApiError('Unauthorized: Please log in again.', 401);
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
  get: <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>) => {
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
    return executeRequest<T>(`${endpoint}${query}`, { method: 'GET' });
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
