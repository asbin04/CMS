import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

describe('Sidebar Component - Search & Rail interaction', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens search popup on hover when sidebar is collapsed', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    expect(searchBtn).toBeInTheDocument();

    // Hover at search icon
    fireEvent.mouseEnter(searchBtn);

    // Search popup dialog should now appear
    const searchDialog = screen.getByRole('dialog', { name: /navigation search/i });
    expect(searchDialog).toBeInTheDocument();
    expect(within(searchDialog).getByPlaceholderText(/search navigation/i)).toBeInTheDocument();
  });

  it('closes search popup on mouse leave after delay', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    fireEvent.mouseEnter(searchBtn);

    expect(screen.getByRole('dialog', { name: /navigation search/i })).toBeInTheDocument();

    // Mouse leave
    fireEvent.mouseLeave(searchBtn);

    // Fast forward timer past 220ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByRole('dialog', { name: /navigation search/i })).not.toBeInTheDocument();
  });

  it('clicking search button opens the side rail and triggers onToggleCollapse', () => {
    const handleToggleCollapse = vi.fn();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} onToggleCollapse={handleToggleCollapse} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });

    // Hover first (popup opens)
    fireEvent.mouseEnter(searchBtn);
    expect(screen.getByRole('dialog', { name: /navigation search/i })).toBeInTheDocument();

    // Now click the search button
    fireEvent.click(searchBtn);

    // Should call toggle collapse to open the side rail
    expect(handleToggleCollapse).toHaveBeenCalledTimes(1);

    // Search popup should be closed immediately
    expect(screen.queryByRole('dialog', { name: /navigation search/i })).not.toBeInTheDocument();
  });

  it('renders search palette with identical fixed width and row height in both empty and search states', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    fireEvent.mouseEnter(searchBtn);

    const dialog = screen.getByRole('dialog', { name: /navigation search/i });
    expect(dialog).toBeInTheDocument();
    // Verify panel width is fixed to 280px (matching the category panel width)
    expect(dialog).toHaveStyle({ width: '280px' });

    // In default empty state, the ALL MODULES header row is removed
    expect(within(dialog).queryByText(/all modules/i)).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/44 modules/i)).not.toBeInTheDocument();
    expect(within(dialog).getByText('ESC')).toBeInTheDocument();
    const defaultRows = within(dialog).getAllByRole('link');
    expect(defaultRows.length).toBeGreaterThan(0);
    // Every row has fixed 44px height matching the category panel
    expect(defaultRows[0]).toHaveStyle({ height: '44px' });

    // Type "em" in the search box
    const searchInput = within(dialog).getByPlaceholderText(/search navigation/i);
    fireEvent.change(searchInput, { target: { value: 'em' } });

    // In search state ("MATCHING RESULTS"):
    expect(within(dialog).getByText(/matching results/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/8 modules/i)).toBeInTheDocument();
    const searchRows = within(dialog).getAllByRole('link');
    expect(searchRows.length).toBe(8); // Matches 8 modules in screenshot
    // Panel width remains identical 280px
    expect(dialog).toHaveStyle({ width: '280px' });
    // Row height remains identical 44px matching the category panel
    expect(searchRows[0]).toHaveStyle({ height: '44px' });

    // Category badges have been removed from rows
    expect(within(dialog).queryByText('Sales & CRM')).not.toBeInTheDocument();
  });

  it('renders identical row heights and styles in both category flyout and search palette', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    // 1. Open category flyout (Management)
    const mgmtBtn = screen.getByRole('button', { name: 'Management' });
    fireEvent.mouseEnter(mgmtBtn);

    const categoryMenu = screen.getByRole('menu', { name: /management submenu/i });
    expect(categoryMenu).toBeInTheDocument();
    expect(categoryMenu).toHaveStyle({ width: '280px' });
    const categoryRows = within(categoryMenu).getAllByRole('link');
    expect(categoryRows[0]).toHaveStyle({ height: '44px', padding: '0 12px' });

    // Close category flyout
    fireEvent.mouseLeave(mgmtBtn);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // 2. Open search palette
    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    fireEvent.mouseEnter(searchBtn);

    const searchDialog = screen.getByRole('dialog', { name: /navigation search/i });
    expect(searchDialog).toBeInTheDocument();
    expect(searchDialog).toHaveStyle({ width: '280px' });
    const searchRows = within(searchDialog).getAllByRole('link');

    // Confirm identical height and padding
    expect(searchRows[0]).toHaveStyle({ height: '44px', padding: '0 12px' });
  });

  it('displays recent search history section and allows clearing it', () => {
    localStorage.setItem(
      'cms_recent_modules',
      JSON.stringify(['/sales/opportunities', '/sales/leads'])
    );

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    fireEvent.mouseEnter(searchBtn);

    const searchDialog = screen.getByRole('dialog', { name: /navigation search/i });
    expect(searchDialog).toBeInTheDocument();

    // Verify RECENT section header is present and ALL MODULES header is removed
    expect(within(searchDialog).getByText('RECENT')).toBeInTheDocument();
    expect(within(searchDialog).queryByText('ALL MODULES')).not.toBeInTheDocument();

    // Click "Clear" button
    const clearBtn = within(searchDialog).getByRole('button', { name: /clear recent searches/i });
    fireEvent.click(clearBtn);

    // RECENT header should disappear
    expect(within(searchDialog).queryByText('RECENT')).not.toBeInTheDocument();
    expect(localStorage.getItem('cms_recent_modules')).toBeNull();
  });

  it('records clicked module into recent history', () => {
    localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} />
      </MemoryRouter>
    );

    const searchBtn = screen.getByRole('button', { name: /search navigation/i });
    fireEvent.mouseEnter(searchBtn);

    const searchDialog = screen.getByRole('dialog', { name: /navigation search/i });
    expect(searchDialog).toBeInTheDocument();

    // Click on Admin Dashboard
    const ceoRow = within(searchDialog).getByRole('link', { name: /admin dashboard/i });
    fireEvent.click(ceoRow);

    // Verify localStorage has Admin Dashboard
    const stored = JSON.parse(localStorage.getItem('cms_recent_modules') || '[]');
    expect(stored).toContain('/management/ceo-dashboard');
  });
  it('renders Option 19 Half Circle toggle button on sidebar rail edge and toggles collapse', () => {
    const handleToggleCollapse = vi.fn();
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={true} onToggleCollapse={handleToggleCollapse} />
      </MemoryRouter>
    );

    const expandBtn = screen.getByRole('button', { name: /expand sidebar/i });
    expect(expandBtn).toBeInTheDocument();
    fireEvent.click(expandBtn);
    expect(handleToggleCollapse).toHaveBeenCalledTimes(1);
    unmount();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Sidebar isCollapsed={false} onToggleCollapse={handleToggleCollapse} />
      </MemoryRouter>
    );

    const collapseBtn = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(collapseBtn).toBeInTheDocument();
    fireEvent.click(collapseBtn);
    expect(handleToggleCollapse).toHaveBeenCalledTimes(2);
  });

  it('renders Log out button below Settings and logs out to /login', () => {
    localStorage.setItem('auth_token', 'test-token');
    sessionStorage.setItem('auth_user_name', 'Admin');

    render(
      <MemoryRouter initialEntries={['/settings']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="*" element={<Sidebar isCollapsed={false} />} />
        </Routes>
      </MemoryRouter>
    );

    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    const logoutBtn = screen.getByRole('button', { name: 'Log out' });
    expect(settingsLink).toBeInTheDocument();
    expect(logoutBtn).toBeInTheDocument();
    expect(
      Boolean(settingsLink.compareDocumentPosition(logoutBtn) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);

    fireEvent.click(logoutBtn);

    expect(sessionStorage.getItem('logged_out')).toBe('true');
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_user_name')).toBeNull();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});