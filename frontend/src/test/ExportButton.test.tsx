import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportButton } from '../components/ui/ExportButton';

describe('ExportButton', () => {
  it('renders with default label "Export" and invokes onClick', () => {
    const onClick = vi.fn();
    render(<ExportButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Export' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom label and disables button when disabled prop is set', () => {
    const onClick = vi.fn();
    render(<ExportButton onClick={onClick} disabled label="Export Report" title="Download Report" />);

    const button = screen.getByRole('button', { name: 'Export Report' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
