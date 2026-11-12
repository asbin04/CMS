import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { StatusDropdownMenu, StatusItemConfig } from '../components/ui/StatusDropdownMenu';

const TEST_OPTIONS: StatusItemConfig[] = [
  { value: 'Active', label: 'Active', dotColor: '#10B981', textColor: '#047857' },
  { value: 'On Notice', label: 'On Notice', dotColor: '#F59E0B', textColor: '#B45309' },
  { value: 'Probation', label: 'Probation', dotColor: '#3B82F6', textColor: '#2563EB' },
  { value: 'Inactive', label: 'Inactive', dotColor: '#EF4444', textColor: '#DC2626' },
];

describe('StatusDropdownMenu', () => {
  it('renders trigger button with current status label', () => {
    render(
      <StatusDropdownMenu
        currentStatus="Active"
        options={TEST_OPTIONS}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
  });

  it('toggles dropdown and invokes onSelect', () => {
    const handleSelect = vi.fn();
    render(
      <StatusDropdownMenu
        currentStatus="Active"
        options={TEST_OPTIONS}
        onSelect={handleSelect}
      />
    );

    const trigger = screen.getByRole('button', { name: /active/i });
    fireEvent.click(trigger);

    expect(screen.getByText('CHANGE STATE')).toBeInTheDocument();
    expect(screen.getByText('On Notice')).toBeInTheDocument();

    fireEvent.click(screen.getByText('On Notice'));
    expect(handleSelect).toHaveBeenCalledWith('On Notice');
  });
});

