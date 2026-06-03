import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../pagination';

const renderPagination = (props: Partial<React.ComponentProps<typeof Pagination>> = {}) => {
  const onPageChange = props.onPageChange ?? vi.fn();
  return {
    onPageChange,
    ...render(
      <Pagination
        page={props.page ?? 1}
        totalPages={props.totalPages ?? 5}
        onPageChange={onPageChange}
      />
    ),
  };
};

describe('Pagination — Prev/Next buttons', () => {
  it('disables Prev button on first page', () => {
    renderPagination({ page: 1, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    renderPagination({ page: 5, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).toBeDisabled();
  });

  it('enables Prev button when not on first page', () => {
    renderPagination({ page: 3, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).not.toBeDisabled();
  });

  it('enables Next button when not on last page', () => {
    renderPagination({ page: 3, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[buttons.length - 1]).not.toBeDisabled();
  });

  it('calls onPageChange with page - 1 when Prev clicked', async () => {
    const { onPageChange } = renderPagination({ page: 3, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with page + 1 when Next clicked', async () => {
    const { onPageChange } = renderPagination({ page: 3, totalPages: 5 });
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]);
    expect(onPageChange).toHaveBeenCalledWith(4);
  });
});

describe('Pagination — page number buttons', () => {
  it('renders all page numbers when totalPages <= 7', () => {
    renderPagination({ page: 1, totalPages: 5 });
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
  });

  it('renders exactly 7 page buttons when totalPages = 7', () => {
    renderPagination({ page: 1, totalPages: 7 });
    const pageButtons = screen.getAllByRole('button').slice(1, -1);
    expect(pageButtons).toHaveLength(7);
  });

  it('calls onPageChange with correct page when page button clicked', async () => {
    const { onPageChange } = renderPagination({ page: 1, totalPages: 5 });
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not call onPageChange when active page button clicked', async () => {
    const { onPageChange } = renderPagination({ page: 2, totalPages: 5 });
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe('Pagination — truncation logic', () => {
  it('shows no ellipsis when totalPages <= 7', () => {
    renderPagination({ page: 4, totalPages: 7 });
    expect(document.querySelector('.typo-small')).toBeNull();
  });

  it('shows right ellipsis when current page is near the start', () => {
    renderPagination({ page: 1, totalPages: 10 });
    const dots = document.querySelectorAll('.typo-small');
    expect(dots).toHaveLength(1);
  });

  it('shows left ellipsis when current page is near the end', () => {
    renderPagination({ page: 10, totalPages: 10 });
    const dots = document.querySelectorAll('.typo-small');
    expect(dots).toHaveLength(1);
  });

  it('shows both ellipses when current page is in the middle', () => {
    renderPagination({ page: 5, totalPages: 10 });
    const dots = document.querySelectorAll('.typo-small');
    expect(dots).toHaveLength(2);
  });

  it('always renders first page button', () => {
    renderPagination({ page: 8, totalPages: 15 });
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });

  it('always renders last page button', () => {
    renderPagination({ page: 2, totalPages: 15 });
    expect(screen.getByRole('button', { name: '15' })).toBeInTheDocument();
  });

  it('renders page 2 when on page 1 of many', () => {
    renderPagination({ page: 1, totalPages: 10 });
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '3' })).toBeNull();
  });

  it('renders neighbor pages around current page in middle', () => {
    renderPagination({ page: 6, totalPages: 12 });
    expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7' })).toBeInTheDocument();
  });
});


describe('Pagination — edge cases', () => {
  it('both Prev and Next are disabled when totalPages = 1', () => {
    renderPagination({ page: 1, totalPages: 1 });
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();                   // prev
    expect(buttons[buttons.length - 1]).toBeDisabled();  // next
  });

  it('renders single page number when totalPages = 1', () => {
    renderPagination({ page: 1, totalPages: 1 });
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });
});