import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SingleDatePicker } from '../components/ui/SingleDatePicker';

describe('SingleDatePicker Component', () => {
  it('does not render when isOpen is false', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(
      <SingleDatePicker
        value=""
        onChange={onChange}
        isOpen={false}
        onClose={onClose}
      />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders with compact dimensions and correct typography when isOpen is true', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(
      <SingleDatePicker
        value="2026-11-15"
        onChange={onChange}
        isOpen={true}
        onClose={onClose}
      />
    );

    const dialog = screen.getByRole('dialog', { name: /Calendar Date Picker/i });
    expect(dialog).toBeInTheDocument();

    // Verify compact container classes
    expect(dialog.className).toContain('w-[276px]');
    expect(dialog.className).toContain('p-3.5');
    expect(dialog.className).toContain('rounded-2xl');

    // Verify month & year header with compact text
    const headerTitle = screen.getByText(/November 2026/i);
    expect(headerTitle).toBeInTheDocument();
    expect(headerTitle.className).toContain('text-[14px]');

    // Verify weekday labels
    const suLabel = screen.getByText('Su');
    expect(suLabel).toBeInTheDocument();
    expect(suLabel.parentElement?.className).toContain('text-[11px]');

    // Verify date button compact size
    const dayBtn = screen.getByRole('button', { name: '15' });
    expect(dayBtn).toBeInTheDocument();
    expect(dayBtn.className).toContain('w-8');
    expect(dayBtn.className).toContain('h-8');
    expect(dayBtn.className).toContain('rounded-lg');
    expect(dayBtn.className).toContain('text-[12px]');
    // Date 15 is selected
    expect(dayBtn.className).toContain('bg-[#4F46E5]');
  });

  it('allows selecting a date immediately, calling onChange and onClose', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(
      <SingleDatePicker
        value=""
        onChange={onChange}
        isOpen={true}
        onClose={onClose}
      />
    );

    const day10 = screen.getByRole('button', { name: '10' });
    fireEvent.click(day10);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-10$/));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates previous and next month correctly', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(
      <SingleDatePicker
        value="2026-11-15"
        onChange={onChange}
        isOpen={true}
        onClose={onClose}
      />
    );

    expect(screen.getByText('November 2026')).toBeInTheDocument();

    const prevBtn = screen.getByLabelText('Previous month');
    fireEvent.click(prevBtn);
    expect(screen.getByText('October 2026')).toBeInTheDocument();

    const nextBtn = screen.getByLabelText('Next month');
    fireEvent.click(nextBtn); // Back to November 2026
    expect(screen.getByText('November 2026')).toBeInTheDocument();

    fireEvent.click(nextBtn); // To December 2026
    expect(screen.getByText('December 2026')).toBeInTheDocument();
  });
});

