import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { apiClient } from '@/services/api/apiClient';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders exact Figma design elements (headings, inputs, badge, button)', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Headings and labels
    expect(screen.getByRole('heading', { name: /sign in with email/i })).toBeInTheDocument();
    expect(
      screen.getByText(/make a new doc to bring your words, data, and teams together\. for free/i)
    ).toBeInTheDocument();

    // Logos
    expect(screen.getByAltText('KALPANAAA SOFTWARE SOLUTIONS')).toBeInTheDocument();
    expect(screen.getByAltText('KALPANAAA Emblem')).toBeInTheDocument();

    // Inputs
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Checkbox and links
    expect(screen.getByText('Remember Me')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password\?/i })).toBeInTheDocument();

    // Action button
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByRole('button', { name: /toggle password visibility/i });
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('password');
  });

  it('toggles Remember Me checkbox', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });

  it('displays validation error if email or password is empty', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/please enter your email or username/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'asbin.t.s@kalpanaaa.in' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
  });

  it.each([
    { email: 'asbin.t.s@kalpanaaa.in', name: 'Asbin T S' },
    { email: 'founder@kalpanaaasoftwaresolutions.in', name: 'Gaurav Kumar Tripathi' },
    { email: 'akshit.ujjain@kalpanaaasoftwaresolutions.in', name: 'Akshit Ujjain' },
  ])('submits login for $email, stores credentials, and redirects to dashboard', async ({ email, name }) => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      message: 'Authentication successful',
      data: {
        token: `mock-jwt-token-${email}`,
        username: email,
        role: 'ADMIN',
        name,
        email,
      },
    } as any);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'Admin123' } });

    const submitBtn = screen.getByRole('button', { name: /^login$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: email,
        password: 'Admin123',
      });
      expect(localStorage.getItem('auth_token')).toBe(`mock-jwt-token-${email}`);
      expect(localStorage.getItem('auth_user_name')).toBe(name);
      expect(localStorage.getItem('auth_user_role')).toBe('ADMIN');
      expect(mockNavigate).toHaveBeenCalledWith('/management/ceo-dashboard', { replace: true });
    });
  });

  it('displays error message when login fails with 401', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValueOnce(new Error('Request failed with status code 401'));

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});

