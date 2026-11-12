import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { settingsService } from '../features/settings/services/settingsService';
import { UserSettingsPayload } from '../features/settings/types/settings';
import { AppRouter } from '../app/router';
import { footerNavigationItems } from '../config/navigation';

const mockSettings: UserSettingsPayload = {
  profile: {
    username: 'akshit.ujjain@kalpanaaasoftwaresolutions.in',
    displayName: 'Akshit Ujjain',
    role: 'CEO',
    department: 'Management',
    employeeId: 'KSS0001',
    email: 'akshit.ujjain@kalpanaaasoftwaresolutions.in',
    phone: '+91 98765 43210',
    jobTitle: 'CEO',
  },
  security: {
    passwordChangedAt: '2026-08-12T10:00:00Z',
    mfaEnabled: true,
    mfaMethod: 'Authenticator App',
    activeSessionCount: 3,
    lastLoginAt: '2026-10-12T05:54:00Z',
  },
  notifications: {
    emailNotifications: true,
    inAppNotifications: true,
    taskApprovalAlerts: true,
    marketingUpdates: false,
  },
  appearance: {
    theme: 'light',
  },
};

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.classList.remove('dark');
  });

  it('renders exact Figma headings, profile details, security section, notification switches, and theme radios', async () => {
    vi.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
      expect(screen.getByText('Akshit Ujjain')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Manage your profile, account preferences, security settings and more.')
    ).toBeInTheDocument();
    expect(screen.getByText('AU')).toBeInTheDocument();
    expect(screen.getByText('Management')).toBeInTheDocument();
    expect(screen.queryByText('EMPLOYEE ID')).not.toBeInTheDocument();
    expect(screen.queryByText('Job Title')).not.toBeInTheDocument();
    expect(screen.getByText('akshit.ujjain@kalpanaaasoftwaresolutions.in')).toBeInTheDocument();
    expect(screen.getByText('+91 98765 43210')).toBeInTheDocument();

    // Account & Security
    expect(screen.getByText('Account & Security')).toBeInTheDocument();
    expect(screen.getByText(/Last changed on 12 Aug 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('3 active sessions')).toBeInTheDocument();
    expect(screen.getByText(/Last login:/i)).toBeInTheDocument();

    // Notifications switches
    expect(screen.getByRole('switch', { name: 'Email Notifications' })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('switch', { name: 'Marketing & Product Updates' })).toHaveAttribute(
      'aria-checked',
      'false'
    );

    // Appearance radios
    expect(screen.getByRole('radio', { name: 'Light' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('radio', { name: 'System' })).toHaveAttribute('aria-checked', 'false');
  });

  it('supports editing profile, toggling notifications, opening security modals, and switching theme', async () => {
    vi.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);
    const updateProfileSpy = vi.spyOn(settingsService, 'updateProfile').mockResolvedValue({
      ...mockSettings,
      profile: {
        ...mockSettings.profile,
        displayName: 'Akshit Sharma',
      },
    });
    const updateNotifSpy = vi.spyOn(settingsService, 'updateNotifications').mockResolvedValue({
      ...mockSettings,
      notifications: {
        ...mockSettings.notifications,
        marketingUpdates: true,
      },
    });
    const updateAppearanceSpy = vi.spyOn(settingsService, 'updateAppearance').mockResolvedValue({
      ...mockSettings,
      appearance: { theme: 'dark' },
    });
    const getSessionsSpy = vi.spyOn(settingsService, 'getSessions').mockResolvedValue([
      {
        id: 'sess-1',
        deviceName: 'Windows PC',
        browser: 'Microsoft Edge',
        ipAddress: '127.0.0.1',
        location: 'Current Workspace Session',
        current: true,
        active: true,
        createdAt: '2026-11-11T12:00:00Z',
        lastActiveAt: '2026-11-11T12:15:00Z',
      },
    ]);

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Akshit Ujjain')).toBeInTheDocument();
    });

    // Edit Profile modal
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(screen.queryByPlaceholderText('e.g. CEO')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('e.g. KSS0001')).not.toBeInTheDocument();
    const emailInput = screen.getByLabelText('Email Address');
    const deptInput = screen.getByLabelText('Department');
    expect(emailInput).toBeDisabled();
    expect(emailInput).toHaveAttribute('readonly');
    expect(deptInput).toBeDisabled();
    expect(deptInput).toHaveAttribute('readonly');
    const nameInput = screen.getByPlaceholderText('Enter full name');
    fireEvent.change(nameInput, { target: { value: 'Akshit Sharma' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledTimes(1);
      expect(updateProfileSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Akshit Sharma',
          email: 'akshit.ujjain@kalpanaaasoftwaresolutions.in',
          department: 'Management',
        })
      );
      expect(screen.getByText('Akshit Sharma')).toBeInTheDocument();
    });

    // Toggle notification
    fireEvent.click(screen.getByRole('switch', { name: 'Marketing & Product Updates' }));
    await waitFor(() => {
      expect(updateNotifSpy).toHaveBeenCalledWith({
        emailNotifications: true,
        inAppNotifications: true,
        taskApprovalAlerts: true,
        marketingUpdates: true,
      });
    });

    // Open Active Sessions modal
    const viewButtons = screen.getAllByRole('button', { name: 'View' });
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
      expect(getSessionsSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Windows PC · Microsoft Edge/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    // Switch theme to Dark
    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    await waitFor(() => {
      expect(updateAppearanceSpy).toHaveBeenCalledWith('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('mounts SettingsPage at /settings route instead of ModulePlaceholder', async () => {
    localStorage.setItem('auth_token', 'test-token');
    vi.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(
      await screen.findByRole('heading', { name: 'Settings' }, { timeout: 5000 })
    ).toBeInTheDocument();
    expect(screen.getByText('Account & Security')).toBeInTheDocument();
  });

  it('supports uploading, validating, and removing a profile picture in Edit Profile modal', async () => {
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    vi.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);
    const updateProfileSpy = vi
      .spyOn(settingsService, 'updateProfile')
      .mockResolvedValueOnce({
        ...mockSettings,
        profile: {
          ...mockSettings.profile,
          avatarUrl: sampleDataUrl,
        },
      })
      .mockResolvedValueOnce({
        ...mockSettings,
        profile: {
          ...mockSettings.profile,
          avatarUrl: null,
        },
      });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Akshit Ujjain')).toBeInTheDocument();
    });

    // Open Edit Profile modal
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    const fileInput = screen.getByLabelText('Upload profile picture') as HTMLInputElement;

    // Reject unsupported file type (e.g. SVG)
    const svgFile = new File(['<svg></svg>'], 'avatar.svg', { type: 'image/svg+xml' });
    fireEvent.change(fileInput, { target: { files: [svgFile] } });
    expect(
      await screen.findByText('Please select a PNG, JPG, WEBP, or GIF image.')
    ).toBeInTheDocument();
    expect(updateProfileSpy).not.toHaveBeenCalled();

    // Upload valid PNG file
    const pngBytes = Uint8Array.from(atob(sampleDataUrl.split(',')[1]), (c) => c.charCodeAt(0));
    const pngFile = new File([pngBytes], 'avatar.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [pngFile] } });

    await waitFor(() => {
      expect(screen.getByAltText('Akshit Ujjain')).toHaveAttribute(
        'src',
        expect.stringMatching(/^data:image\/png;base64,/)
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledTimes(1);
      expect(updateProfileSpy.mock.calls[0][0].avatarUrl).toMatch(/^data:image\/png;base64,/);
      expect(localStorage.getItem('auth_user_avatar')).toBe(sampleDataUrl);
      expect(screen.getByAltText('Akshit Ujjain')).toHaveAttribute('src', sampleDataUrl);
    });

    // Reopen Edit Profile and remove the custom profile picture
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledTimes(2);
      expect(updateProfileSpy.mock.calls[1][0].avatarUrl).toBe('');
      expect(localStorage.getItem('auth_user_avatar')).toBeNull();
      expect(screen.queryByAltText('Akshit Ujjain')).not.toBeInTheDocument();
      expect(screen.getByText('AU')).toBeInTheDocument();
    });
  });

  it('restricts phone number to 10 numeric digits and allows choosing country code from dropdown', async () => {
    vi.spyOn(settingsService, 'getSettings').mockResolvedValue(mockSettings);
    const updateProfileSpy = vi.spyOn(settingsService, 'updateProfile').mockResolvedValue({
      ...mockSettings,
      profile: {
        ...mockSettings.profile,
        phone: '+1 4155551234',
      },
    });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Akshit Ujjain')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));

    const countrySelect = screen.getByLabelText('Country code') as HTMLSelectElement;
    const phoneInput = screen.getByLabelText('Phone Number') as HTMLInputElement;

    expect(countrySelect.value).toBe('IN');
    expect(countrySelect.selectedOptions[0]?.textContent).toBe('+91');
    expect(countrySelect.options.length).toBeGreaterThan(150);
    expect(phoneInput.value).toBe('9876543210');

    // Change country code to United States (+1)
    fireEvent.change(countrySelect, { target: { value: 'US' } });
    expect(countrySelect.value).toBe('US');

    // Strip letters and block submitting fewer than 10 digits
    fireEvent.change(phoneInput, { target: { value: 'abc12345' } });
    expect(phoneInput.value).toBe('12345');

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));
    expect(
      await screen.findByText('Phone number must be exactly 10 digits.')
    ).toBeInTheDocument();
    expect(updateProfileSpy).not.toHaveBeenCalled();

    // Strip non-digits and cap at 10 digits
    fireEvent.change(phoneInput, { target: { value: '415-555-1234999' } });
    expect(phoneInput.value).toBe('4155551234');

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(updateProfileSpy).toHaveBeenCalledTimes(1);
      expect(updateProfileSpy.mock.calls[0][0].phone).toBe('+1 4155551234');
    });
  });

  it('excludes Help & Support from footer navigation while keeping Settings', () => {
    expect(
      footerNavigationItems.some(
        (item) => item.id === 'help-support' || item.path === '/help-support'
      )
    ).toBe(false);
    expect(footerNavigationItems.some((item) => item.path === '/settings')).toBe(true);
  });
});

