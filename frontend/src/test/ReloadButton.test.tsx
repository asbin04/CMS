import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReloadButton } from '../components/ui/ReloadButton';

describe('ReloadButton', () => {
  it('renders with default accessible label and invokes onClick', () => {
    const onClick = vi.fn();
    render(<ReloadButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and spins the icon while refreshing', () => {
    const onClick = vi.fn();
    const { container } = render(
      <ReloadButton onClick={onClick} isRefreshing title="Refresh queue" />
    );

    const button = screen.getByRole('button', { name: 'Refresh queue' });
    expect(button).toBeDisabled();
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });
});

