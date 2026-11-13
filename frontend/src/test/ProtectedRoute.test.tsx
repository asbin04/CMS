import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { apiClient, ApiError } from '../services/api/apiClient';

function createJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects to login when no token is present', () => {
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when JWT role is not ADMIN', () => {
    const nonAdminToken = createJwt({
      sub: 'user@example.com',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('auth_token', nonAdminToken);

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('redirects to login when JWT is expired', () => {
    const expiredToken = createJwt({
      sub: 'asbin.t.s@kalpanaaa.in',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) - 60,
    });
    localStorage.setItem('auth_token', expiredToken);

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('allows access when valid ADMIN JWT is verified by /auth/me', async () => {
    const validAdminToken = createJwt({
      sub: 'asbin.t.s@kalpanaaa.in',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('auth_token', validAdminToken);
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      message: 'OK',
      data: { role: 'ADMIN' },
    });

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login if /auth/me rejects with 403', async () => {
    const validAdminToken = createJwt({
      sub: 'asbin.t.s@kalpanaaa.in',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    localStorage.setItem('auth_token', validAdminToken);
    vi.spyOn(apiClient, 'get').mockRejectedValue(new ApiError('Access restricted to administrators', 403));

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});

