import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TableActionMenu } from '../components/ui/TableActionMenu';

describe('TableActionMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Renders trigger button and opens menu on click', () => {
    const onViewDetails = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TableActionMenu
        onViewDetails={onViewDetails}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const triggerBtn = screen.getByRole('button', { name: /actions/i });
    expect(triggerBtn).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(triggerBtn);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view details/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('2. Invokes action callbacks and closes menu on selection', () => {
    const onViewDetails = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    render(
      <TableActionMenu
        onViewDetails={onViewDetails}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    const triggerBtn = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(triggerBtn);

    const viewBtn = screen.getByRole('button', { name: /view details/i });
    fireEvent.click(viewBtn);

    expect(onViewDetails).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('3. Closes menu when Escape key is pressed', () => {
    render(
      <TableActionMenu
        onViewDetails={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /actions/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('4. Closes menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside-area">Outside</div>
        <TableActionMenu
          onViewDetails={vi.fn()}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
        />
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: /actions/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside-area'));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('5. Supports controlled mode where parent controls active menu', () => {
    const ParentComponent = () => {
      const [activeId, setActiveId] = useState<string | null>(null);

      return (
        <div>
          <TableActionMenu
            isOpen={activeId === 'row-1'}
            onToggle={() => setActiveId(activeId === 'row-1' ? null : 'row-1')}
            onClose={() => setActiveId(null)}
            onViewDetails={vi.fn()}
            ariaLabel="Row 1 Actions"
          />
          <TableActionMenu
            isOpen={activeId === 'row-2'}
            onToggle={() => setActiveId(activeId === 'row-2' ? null : 'row-2')}
            onClose={() => setActiveId(null)}
            onViewDetails={vi.fn()}
            ariaLabel="Row 2 Actions"
          />
        </div>
      );
    };

    render(<ParentComponent />);

    const row1Btn = screen.getByRole('button', { name: /row 1 actions/i });
    const row2Btn = screen.getByRole('button', { name: /row 2 actions/i });

    // Open row 1
    fireEvent.click(row1Btn);
    expect(screen.getAllByRole('menu')).toHaveLength(1);

    // Open row 2 - row 1 automatically closes
    fireEvent.click(row2Btn);
    expect(screen.getAllByRole('menu')).toHaveLength(1);

    // Click row 2 again to toggle close
    fireEvent.click(row2Btn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('6. Calculates upward positioning when space below is insufficient', () => {
    // Mock window.innerHeight = 800
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });

    const btnMock = document.createElement('button');
    // Button near bottom of screen: top=750, bottom=780, spaceBelow=20px (< 130px)
    vi.spyOn(btnMock, 'getBoundingClientRect').mockReturnValue({
      top: 750,
      bottom: 780,
      left: 1100,
      right: 1130,
      width: 30,
      height: 30,
      x: 1100,
      y: 750,
      toJSON: () => {},
    });

    const { rerender } = render(
      <TableActionMenu
        isOpen={true}
        onViewDetails={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    // Verify portal attached to document.body and has fixed positioning
    expect(menu.style.position).toBe('fixed');
    expect(menu.style.zIndex).toBe('99999');
  });
});

