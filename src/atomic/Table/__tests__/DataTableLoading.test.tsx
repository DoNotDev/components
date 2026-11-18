// packages/components/src/atomic/Table/__tests__/DataTableLoading.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from '../index';
import type { TableColumn } from '../index';
import type { TablePendingChanges } from '../editing';

type Row = {
  name: string;
  missing: string[];
  meta: { id: string; label: string };
  price: number;
  note: string | null;
};

const ROWS: Row[] = [
  { name: 'Alpha', missing: ['image'], meta: { id: 'a', label: 'First' }, price: 12.5, note: null },
  { name: 'Beta', missing: [], meta: { id: 'b', label: 'Second' }, price: 20, note: 'Ready' },
];

// Like a business price helper, this deliberately requires a real number.
const toCents = (price: number) => Math.round(Number(price.toFixed(2)) * 100);

const MODES = [
  { editable: false, navigation: 'href' },
  { editable: false, navigation: 'open' },
  { editable: true, navigation: 'href' },
  { editable: true, navigation: 'open' },
];

describe('DataTable loading slots', () => {
  it.each(MODES)('isolates loading through data transitions ($editable, $navigation)', ({ editable, navigation }) => {
    const nameRender = vi.fn((_value: unknown, row: Row) => row.name.toUpperCase());
    const missingRender = vi.fn((_value: unknown, row: Row) => String(row.missing.length));
    const nestedRender = vi.fn((_value: unknown, row: Row) => row.meta.label.toUpperCase());
    const priceRender = vi.fn((_value: unknown, row: Row) => String(toCents(row.price)));
    const noteRender = vi.fn((value: unknown, row: Row) => value === null ? `No note: ${row.meta.label}` : String(value));
    const onAction = vi.fn((row: Row) => row.meta.id.toUpperCase());
    const actionRender = vi.fn((_value: unknown, row: Row) => (
      <button onClick={() => onAction(row)}>Inspect {row.name}</button>
    ));
    const columns: TableColumn<Row>[] = [
      { key: 'name', title: 'Name', dataIndex: 'name', width: 160, align: 'start', edit: { type: 'text' }, render: nameRender },
      { key: 'missing', title: 'Missing', dataIndex: 'missing', align: 'center', render: missingRender },
      { key: 'meta', title: 'Details', dataIndex: 'meta', render: nestedRender },
      { key: 'price', title: 'Price', dataIndex: 'price', align: 'end', render: priceRender },
      { key: 'note', title: 'Note', dataIndex: 'note', render: noteRender },
      { key: 'action', title: 'Action', render: actionRender },
    ];
    const getRowId = vi.fn((row: Row) => row.meta.id.toUpperCase());
    const getRowHref = vi.fn((row: Row) => `/items/${row.meta.id}`);
    const onRowOpen = vi.fn((row: Row) => row.missing.length);
    const onRowClick = vi.fn((row: Row) => row.meta.label.toUpperCase());
    const onSelect = vi.fn((rows: Row[]) => rows.map((row) => row.meta.id.toUpperCase()));
    const onPendingChange = vi.fn((_changes: TablePendingChanges) => {});
    const callbacks = [nameRender, missingRender, nestedRender, priceRender, noteRender, actionRender, onAction, getRowId, getRowHref, onRowOpen, onRowClick, onSelect, onPendingChange];
    const view = (loading: boolean, data: Row[]) => (
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        editable={editable}
        selectable
        getRowId={getRowId}
        getRowHref={getRowHref}
        onRowOpen={navigation === 'open' ? onRowOpen : undefined}
        openLabel="Open record"
        pendingChanges={{}}
        onPendingChange={onPendingChange}
        onRowClick={onRowClick}
        onSelect={onSelect}
        searchable={false}
        pagination={false}
      />
    );
    const { container, rerender } = render(view(true, []));

    const assertLoading = () => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(3);
      rows.forEach((row, index) => {
        expect(row.classList.contains('dndev-skeleton-row')).toBe(true);
        expect(row.classList.contains('dndev-cursor-pointer')).toBe(false);
        const cells = row.querySelectorAll('td');
        expect(cells).toHaveLength(columns.length + 2);
        expect(cells[0].childElementCount).toBe(0);
        expect(cells[1].querySelector<HTMLElement>('.dndev-skeleton')?.style.width).toBe('var(--icon-md)');
        columns.forEach((column, colIndex) => {
          const cell = cells[colIndex + 2];
          expect(cell.getAttribute('data-align')).toBe(column.align ?? null);
          expect(cell.hasAttribute('data-editable')).toBe(false);
          const skeleton = cell.querySelector<HTMLElement>('.dndev-skeleton-pulse');
          expect(skeleton?.getAttribute('aria-hidden')).toBe('true');
          expect(skeleton?.style.width).toBe(index % 2 === 0 ? '80%' : '60%');
          fireEvent.click(cell);
          fireEvent.blur(cell);
          fireEvent.paste(cell, { clipboardData: { getData: () => 'Changed\t42' } });
        });
        fireEvent.click(row);
      });
      const header = screen.getByRole('checkbox', { name: 'Select all rows' });
      expect(header.hasAttribute('disabled')).toBe(true);
      fireEvent.click(header);
      fireEvent.keyDown(container.querySelector('.dndev-table-edit-scope')!, { key: 'z', ctrlKey: true });
      expect(screen.getAllByRole('checkbox')).toHaveLength(1);
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.queryByRole('button', { name: 'Open record' })).toBeNull();
      expect(screen.queryByRole('toolbar')).toBeNull();
      expect(screen.queryByText('No note: First')).toBeNull();
      callbacks.forEach((callback) => expect(callback).not.toHaveBeenCalled());
    };
    assertLoading();

    rerender(view(false, ROWS));
    expect(container.querySelectorAll('.dndev-skeleton')).toHaveLength(0);
    expect(screen.getByText('No note: First')).toBeTruthy();
    expect(screen.getByText('1250')).toBeTruthy();
    for (const [index, row] of ROWS.entries()) {
      for (const [callback, value] of [
        [missingRender, row.missing],
        [nestedRender, row.meta],
        [priceRender, row.price],
        [noteRender, row.note],
        [actionRender, null],
      ] as const) {
        expect(callback).toHaveBeenCalledWith(value, row, index);
        expect(callback.mock.calls[index][1]).toBe(row);
        expect(callback.mock.calls[index][0]).toBe(value);
      }
    }
    if (editable) {
      expect(nameRender).not.toHaveBeenCalled();
      const editor = screen.getAllByRole('textbox', { name: 'Name' })[0];
      fireEvent.change(editor, { target: { value: 'Changed' } });
      fireEvent.blur(editor);
      expect(onPendingChange).toHaveBeenLastCalledWith({ A: { name: 'Changed' } });
    } else {
      expect(nameRender).toHaveBeenCalledWith(ROWS[0].name, ROWS[0], 0);
    }

    fireEvent.click(screen.getByText('No note: First'));
    if (editable) expect(onRowClick).not.toHaveBeenCalled();
    else expect(onRowClick).toHaveBeenLastCalledWith(ROWS[0]);
    onRowClick.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect Alpha' }));
    expect(onAction).toHaveBeenCalledWith(ROWS[0]);
    expect(onRowClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(onSelect).toHaveBeenLastCalledWith([ROWS[0]]);
    if (navigation === 'open') {
      fireEvent.click(screen.getAllByRole('button', { name: 'Open record' })[0]);
      expect(onRowOpen).toHaveBeenCalledWith(ROWS[0]);
      expect(getRowHref).not.toHaveBeenCalled();
    } else {
      expect(screen.getAllByRole('link', { name: 'Open record' })[0].getAttribute('href')).toBe('/items/a');
      expect(getRowHref).toHaveBeenCalledWith(ROWS[0]);
    }

    // Refetch retains stale records and selection, but neither can reach callbacks.
    callbacks.forEach((callback) => callback.mockClear());
    rerender(view(true, ROWS));
    assertLoading();

    rerender(view(false, []));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(0);
    expect(container.querySelectorAll('.dndev-skeleton')).toHaveLength(0);
    callbacks.forEach((callback) => expect(callback).not.toHaveBeenCalled());
  });

  it('keeps ordinary cells, widths and alignments without selection or navigation', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'name', title: 'Name', dataIndex: 'name', width: 160, align: 'start' },
      { key: 'price', title: 'Price', dataIndex: 'price', align: 'end' },
      { key: 'note', title: 'Note', dataIndex: 'note' },
    ];
    const view = (loading: boolean) => (
      <DataTable data={ROWS} columns={columns} loading={loading} searchable={false} pagination={false} />
    );
    const { container, rerender } = render(view(true));
    expect(container.querySelectorAll('tbody tr')).toHaveLength(3);
    expect(container.querySelectorAll('tbody td')).toHaveLength(9);
    expect(container.querySelectorAll('.dndev-skeleton')).toHaveLength(9);
    expect(container.querySelector('th')?.style.width).toBe('160px');
    expect(screen.queryByText('Alpha')).toBeNull();
    rerender(view(false));
    const cells = container.querySelectorAll('tbody tr:first-child td');
    expect(Array.from(cells, (cell) => cell.textContent)).toEqual(['Alpha', '12.5', '']);
    expect(cells[0].getAttribute('data-align')).toBe('start');
    expect(cells[1].getAttribute('data-align')).toBe('end');
    expect(container.querySelectorAll('.dndev-skeleton')).toHaveLength(0);
  });
});
