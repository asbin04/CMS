import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastNotification, ToastItem } from '../components/ui/ToastNotification';

describe('ToastNotification Component', () => {
  const mockToasts: ToastItem[] = [
    {
      id: 'toast-1',
      type: 'success',
      title: 'Theme updated',
      message: 'Display theme set to dark.',
    },
  ];

  it('renders below the navbar at top-20 (80px from top) by default', () => {
    render(<ToastNotification toasts={mockToasts} onDismiss={vi.fn()} />);

    const region = screen.getByRole('region', { name: /notifications/i });
    expect(region).toBeInTheDocument();
    expect(region.className).toContain('top-20');
    expect(region.className).toContain('right-6');
    expect(region.className).not.toContain('top-6');
  });

  it('renders at bottom-6 when position is bottom-right', () => {
    render(
      <ToastNotification
        toasts={mockToasts}
        onDismiss={vi.fn()}
        position="bottom-right"
      />
    );

    const region = screen.getByRole('region', { name: /notifications/i });
    expect(region.className).toContain('bottom-6');
    expect(region.className).toContain('right-6');
  });

  it('renders toast content and triggers onDismiss when close button is clicked', () => {
    const handleDismiss = vi.fn();
    render(<ToastNotification toasts={mockToasts} onDismiss={handleDismiss} />);

    expect(screen.getByText('Theme updated')).toBeInTheDocument();
    expect(screen.getByText('Display theme set to dark.')).toBeInTheDocument();

    const dismissBtn = screen.getByTitle('Dismiss notification');
    fireEvent.click(dismissBtn);

    expect(handleDismiss).toHaveBeenCalledWith('toast-1');
  });

  it('renders nothing when toasts array is empty', () => {
    const { container } = render(
      <ToastNotification toasts={[]} onDismiss={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
