import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationModal } from '../components/ui/DeleteConfirmationModal';

describe('DeleteConfirmationModal Component', () => {
  it('1. Does not render when isOpen is false', () => {
    render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('2. Renders title, item identifier, and warning text when isOpen is true', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Timesheet"
        itemIdentifier="TS-202610-099"
        itemType="timesheet entry"
        warningText="This action cannot be undone."
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /delete timesheet/i })).toBeInTheDocument();
    expect(screen.getByText('TS-202610-099')).toBeInTheDocument();
    expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
  });

  it('3. Clicking Cancel triggers onClose and not onConfirm', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('4. Clicking Close (X) button triggers onClose', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('5. Pressing Escape key triggers onClose', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('6. Clicking Delete confirm button triggers onConfirm and onClose', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

