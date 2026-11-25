// packages/components/src/atomic/Table/__tests__/DataTableLayout.test.tsx

import { fireEvent, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { render } from '../../../utils/__tests__/locale';
import { DataTable } from '../index';
import type { TableColumn } from '../index';

// Admin grid layout: empty row, pinned name column, phone stacking attributes,
// sort arrow only when sorted, skeleton = page size, toolbar and bottom bar slots.

type Row = { id: string; name: string; notes: string; qty: number };

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', notes: 'Long text', qty: 2 },
  { id: 'b', name: 'Beta', notes: 'Other', qty: 1 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', minWidth: 240, sticky: true },
  { key: 'notes', title: 'Notes', dataIndex: 'notes', lines: 2, hideOnPhone: true },
  { key: 'qty', title: 'Qty', dataIndex: 'qty', align: 'end', width: 72 },
];

describe('DataTable layout', () => {
  it('shows one full-width empty row, with custom content', () => {
    const { container, rerender } = render(
      <DataTable data={[]} columns={COLUMNS} searchable={false} />
    );
    const empty = container.querySelector('td.dndev-table-empty')!;
    expect(empty.getAttribute('colspan')).toBe('3');
    expect(empty.textContent).toBe('No data');
    rerender(
      <DataTable
        data={[]}
        columns={COLUMNS}
        searchable={false}
        emptyState={<button>Add one</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add one' })).toBeTruthy();
    // Not while loading
    rerender(<DataTable data={[]} columns={COLUMNS} searchable={false} loading />);
    expect(container.querySelector('td.dndev-table-empty')).toBeNull();
  });

  it('pins the sticky column after the utility columns and sizes columns', () => {
    const { container } = render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        searchable={false}
        selectable
        getRowId={(r) => r.id}
        getRowHref={(r) => `/r/${r.id}`}
        openLabel="Open"
      />
    );
    const [open, check, name, notes, qty] = Array.from(
      container.querySelectorAll<HTMLElement>('tbody tr:first-child td')
    );
    expect(open!.getAttribute('data-sticky')).toBe('true');
    expect(open!.style.insetInlineStart).toBe('calc(var(--table-row-height) * 0)');
    expect(check!.style.insetInlineStart).toBe('calc(var(--table-row-height) * 1)');
    expect(name!.getAttribute('data-sticky')).toBe('true');
    expect(name!.style.insetInlineStart).toBe('calc(var(--table-row-height) * 2)');
    expect(name!.style.minWidth).toBe('240px');
    expect(qty!.style.width).toBe('72px');
    expect(qty!.style.maxWidth).toBe('72px');
    expect(notes!.getAttribute('data-sticky')).toBeNull();
    // Long text: clamped to two lines
    expect(notes!.getAttribute('data-lines')).toBe('2');
    expect(notes!.querySelector('.dndev-table-cell-clamp')?.textContent).toBe('Long text');
    // Phones: label of each stacked line, hidden columns marked
    expect(name!.getAttribute('data-label')).toBe('Name');
    expect(notes!.getAttribute('data-phone')).toBe('hidden');
    expect(qty!.getAttribute('data-phone')).toBeNull();
    expect(container.querySelector('table')!.getAttribute('data-utilities')).toBe('2');
  });

  it('marks the checked rows (primary tint)', () => {
    const { container } = render(
      <DataTable data={ROWS} columns={COLUMNS} searchable={false} selectable getRowId={(r) => r.id} />
    );
    fireEvent.click(screen.getAllByRole('checkbox')[1]!);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0]!.getAttribute('data-selected')).toBe('true');
    expect(rows[1]!.getAttribute('data-selected')).toBeNull();
  });

  it('marks the sorted column (its arrow shows; others only on hover)', () => {
    render(<DataTable data={ROWS} columns={COLUMNS} searchable={false} />);
    const name = screen.getAllByRole('columnheader').find((th) => th.textContent === 'Name')!;
    expect(name.getAttribute('data-sorted')).toBeNull();
    expect(name.getAttribute('data-sortable')).toBe('true');
    fireEvent.click(name);
    expect(name.getAttribute('data-sorted')).toBe('true');
    expect(name.getAttribute('aria-sort')).toBe('ascending');
  });

  it('shows as many skeleton rows as the page size (25 by default)', () => {
    const { container, rerender } = render(
      <DataTable data={[]} columns={COLUMNS} searchable={false} loading />
    );
    expect(container.querySelectorAll('tbody tr.dndev-skeleton-row')).toHaveLength(25);
    rerender(<DataTable data={[]} columns={COLUMNS} searchable={false} loading pageSize={50} />);
    expect(container.querySelectorAll('tbody tr.dndev-skeleton-row')).toHaveLength(50);
    rerender(
      <DataTable data={[]} columns={COLUMNS} searchable={false} loading pagination={false} />
    );
    expect(container.querySelectorAll('tbody tr.dndev-skeleton-row')).toHaveLength(3);
  });

  it('paginates 25 rows per page by default', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
      notes: '',
      qty: i,
    }));
    const { container } = render(<DataTable data={many} columns={COLUMNS} searchable={false} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(25);
  });

  it('puts toolbar slots in one row with Export, and the action bar content in the bottom bar', () => {
    const { container } = render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        searchable={false}
        exportable
        toolbarStart={<button>Filters</button>}
        toolbarEnd={<button>Refresh</button>}
        actionBarContent={<span>1 unsaved change</span>}
      />
    );
    const toolbar = container.querySelector('.dndev-table-toolbar')!;
    expect(toolbar.textContent).toBe('FiltersExportRefresh');
    const pending = screen.getByText('1 unsaved change');
    expect(pending.closest('.dndev-action-bar')).toBeTruthy();
    expect(container.contains(pending)).toBe(false);
  });

  it('shows selection actions with the checked rows in the bottom bar', () => {
    const onDelete = vi.fn();
    render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        searchable={false}
        selectable
        getRowId={(r) => r.id}
        selectionActions={(rows) => (
          <button onClick={() => onDelete(rows.map((r) => r.id))}>Delete</button>
        )}
        editLabels={{ selected: '{{count}} checked', clear: 'Uncheck all' }}
      />
    );
    expect(screen.queryByRole('toolbar')).toBeNull();
    fireEvent.click(screen.getAllByRole('checkbox')[0]!); // all
    expect(screen.getByRole('toolbar', { name: '2 checked' })).toBeTruthy();
    // Not editable: no bulk field picker
    expect(screen.queryByRole('combobox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(['a', 'b']);
    fireEvent.click(screen.getByRole('button', { name: 'Uncheck all' }));
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('sets the native tooltip of a cut cell from its text', () => {
    const { container } = render(<DataTable data={ROWS} columns={COLUMNS} searchable={false} />);
    const cell = container.querySelector<HTMLElement>('tbody tr:first-child td')!;
    Object.defineProperty(cell, 'scrollWidth', { value: 300 });
    Object.defineProperty(cell, 'clientWidth', { value: 100 });
    fireEvent.pointerOver(cell);
    expect(cell.getAttribute('title')).toBe('Alpha');
  });
});
