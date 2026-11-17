import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TablePagination } from '@/components/ui/TablePagination';

describe('TablePagination Component', () => {
  it('renders correctly with 0 items', () => {
    render(
      <TablePagination
        currentPage={1}
        totalItems={0}
        pageSize={10}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Showing 0 – 0 of 0 requests')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeDisabled();
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
  });

  it('renders correct range and page numbers matching design spec', () => {
    render(
      <TablePagination
        currentPage={1}
        totalItems={26}
        pageSize={5}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Showing 1 – 5 of 26 requests')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
    expect(screen.getByLabelText('Next page')).toBeEnabled();

    // 26 items / 5 per page = 6 pages, window shows 1 to 5
    expect(screen.getByLabelText('Page 1')).toHaveClass('bg-[#4F46E5]');
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking page number and navigation buttons', () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        currentPage={2}
        totalItems={26}
        pageSize={5}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getByText('Showing 6 – 10 of 26 requests')).toBeInTheDocument();

    // Click previous
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    // Click next
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    // Click page 4
    fireEvent.click(screen.getByLabelText('Page 4'));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('triggers onPageSizeChange when selecting different page size', () => {
    const onPageSizeChange = vi.fn();
    render(
      <TablePagination
        currentPage={1}
        totalItems={26}
        pageSize={10}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    );

    const select = screen.getByLabelText('Rows per page');
    expect(select).toHaveValue('10');

    fireEvent.change(select, { target: { value: '20' } });
    expect(onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('supports custom itemLabel', () => {
    render(
      <TablePagination
        currentPage={1}
        totalItems={12}
        pageSize={10}
        onPageChange={vi.fn()}
        itemLabel="tasks"
      />
    );

    expect(screen.getByText('Showing 1 – 10 of 12 tasks')).toBeInTheDocument();
  });
});

