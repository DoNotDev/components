// packages/components/src/atomic/Table/__tests__/DataTableSort.test.tsx

import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FR_LOCALE, render } from '../../../utils/__tests__/locale';
import { DataTable } from '../index';
import type { DataTableProps, TableColumn } from '../index';

type Row = {
  id: string;
  name: string;
  brandId: string;
  'offer.price': number;
};

const BRANDS: Record<string, string> = { b1: 'Zeta', b2: 'Éclat', b3: 'alpha' };

const ROWS: Row[] = [
  { id: 'r1', name: 'Crème', brandId: 'b1', 'offer.price': 20 },
  { id: 'r2', name: 'baume', brandId: 'b2', 'offer.price': 9.5 },
  { id: 'r3', name: 'Ampoule', brandId: 'b3', 'offer.price': 100 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
  {
    key: 'brandId',
    title: 'Brand',
    dataIndex: 'brandId',
    render: (value) => <span>{BRANDS[value as string]}</span>,
  },
  { key: 'offer.price', title: 'Price', dataIndex: 'offer.price' },
  {
    key: 'actions',
    title: 'Actions',
    sortable: false,
    render: () => <button type="button">Edit</button>,
  },
  { key: 'empty', title: 'Nothing' },
  { key: 'edit', title: 'Edit column', render: () => <button type="button">Edit</button> },
];

/** First cell text of each body row. */
const firstColumn = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.querySelector('td')?.textContent);

const renderTable = (props: Partial<DataTableProps<Row>> = {}) =>
  render(
    <DataTable<Row>
      data={ROWS}
      columns={COLUMNS}
      searchable={false}
      pagination={false}
      {...props}
    />,
    FR_LOCALE
  );

describe('DataTable sorting (no config)', () => {

  it('marks every column with dataIndex or render sortable, not opted-out or empty ones', () => {
    renderTable();
    const head = (title: string) => screen.getByText(title).closest('th');
    expect(head('Name')?.getAttribute('data-sortable')).toBe('true');
    expect(head('Brand')?.getAttribute('data-sortable')).toBe('true');
    expect(head('Price')?.getAttribute('data-sortable')).toBe('true');
    expect(head('Actions')?.hasAttribute('data-sortable')).toBe(false);
    expect(head('Nothing')?.hasAttribute('data-sortable')).toBe(false);
  });

  it('gives no sort affordance to a column with the same cell everywhere, and its click is inert', () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    const head = screen.getByText('Edit column').closest('th');
    expect(head?.hasAttribute('data-sortable')).toBe(false);
    expect(head?.querySelector('svg')).toBeNull();
    fireEvent.click(screen.getByText('Edit column'));
    expect(onSort).not.toHaveBeenCalled();
  });

  it('shows no sort arrow on a 1-row table', () => {
    renderTable({ data: ROWS.slice(0, 1) });
    expect(screen.getByText('Name').closest('th')?.hasAttribute('data-sortable')).toBe(false);
    expect(screen.getByText('Name').closest('th')?.querySelector('svg')).toBeNull();
  });

  it('sorts texts ignoring case and accents, then reverses on a second click', () => {
    const onSort = vi.fn();
    renderTable({ onSort });
    fireEvent.click(screen.getByText('Name'));
    expect(firstColumn()).toEqual(['Ampoule', 'baume', 'Crème']);
    expect(onSort).toHaveBeenLastCalledWith('name', 'asc');
    fireEvent.click(screen.getByText('Name'));
    expect(firstColumn()).toEqual(['Crème', 'baume', 'Ampoule']);
    expect(onSort).toHaveBeenLastCalledWith('name', 'desc');
  });

  it('sorts a reference column on the label it shows, not the id', () => {
    renderTable();
    fireEvent.click(screen.getByText('Brand'));
    // alpha (b3), Éclat (b2), Zeta (b1)
    expect(firstColumn()).toEqual(['Ampoule', 'baume', 'Crème']);
  });

  it('sorts a literal dotted dataIndex numerically', () => {
    renderTable();
    fireEvent.click(screen.getByText('Price'));
    // 9.5, 20, 100
    expect(firstColumn()).toEqual(['baume', 'Crème', 'Ampoule']);
  });

  it('does not sort an opted-out column, nor any column of a sortable={false} table', () => {
    const onSort = vi.fn();
    const { unmount } = renderTable({ onSort });
    fireEvent.click(screen.getByText('Actions'));
    expect(onSort).not.toHaveBeenCalled();
    unmount();
    renderTable({ onSort, sortable: false });
    fireEvent.click(screen.getByText('Name'));
    expect(onSort).not.toHaveBeenCalled();
    expect(firstColumn()).toEqual(['Crème', 'baume', 'Ampoule']);
  });
});
