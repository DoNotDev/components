// packages/components/src/atomic/Table/__tests__/DataTableCellErrors.test.tsx

import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';

import { render } from '../../../utils/__tests__/locale';
import { DataTable } from '../index';
import type { TableColumn, TablePendingChanges } from '../index';

// cellErrors: cells breaking a rule are marked invalid with their message, which is
// never printed in the row (Tooltip + visually hidden text). An invalid typed value
// keeps its editor open (AG Grid block mode); Esc restores the value it had.

type Row = { id: string; name: string; price: number | null; note: string };

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', price: null, note: 'x' },
  { id: 'b', name: 'Beta', price: 20, note: 'y' },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', edit: { type: 'text' } },
  { key: 'price', title: 'Price', dataIndex: 'price', edit: { type: 'number' } },
  { key: 'note', title: 'Note', dataIndex: 'note' },
];

describe('DataTable cellErrors', () => {
  it('marks editors aria-invalid with the message, and read-only cells too', () => {
    render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        editable
        getRowId={(r) => r.id}
        pendingChanges={{}}
        onPendingChange={() => {}}
        cellErrors={{ a: { price: 'Price is required', note: 'Note is not valid' } }}
        searchable={false}
        pagination={false}
      />
    );
    const cell = (row: number, col: number) =>
      document.querySelector<HTMLElement>(`[data-edit-row="${row}"][data-edit-col="${col}"]`)!;
    // Shown as text: the invalid mark and the message are on the cell already
    expect(cell(0, 1).getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById(cell(0, 1).getAttribute('aria-describedby')!)?.textContent).toBe('Price is required');
    expect(cell(0, 1).closest('td')?.getAttribute('data-invalid')).toBe('true');
    // The editor (on focus) keeps them
    act(() => cell(0, 1).focus());
    const price = cell(0, 1);
    expect(price.tagName).toBe('INPUT');
    expect(price.getAttribute('aria-label')).toBe('Price');
    expect(price.getAttribute('aria-invalid')).toBe('true');
    const describedBy = price.getAttribute('aria-describedby');
    expect(document.getElementById(describedBy!)?.textContent).toBe('Price is required');
    // Other rows / cells untouched
    expect(cell(1, 1).getAttribute('aria-invalid')).toBeNull();
    expect(cell(0, 0).getAttribute('aria-invalid')).toBeNull();
    // A cell without an editor has the message too
    const note = screen.getByText('Note is not valid');
    expect(note.closest('td')?.getAttribute('data-invalid')).toBe('true');
    // Nothing printed in a row: every message is visually hidden text in its cell
    expect(note.classList.contains('dndev-sr-only')).toBe(true);
    expect(document.getElementById(describedBy!)?.classList.contains('dndev-sr-only')).toBe(true);
    expect(document.querySelector('.dndev-table-cell-error')).toBeNull();
  });

  it('shows the message in a Tooltip on the open editor', async () => {
    render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        editable
        getRowId={(r) => r.id}
        pendingChanges={{}}
        onPendingChange={() => {}}
        cellErrors={{ a: { price: 'Price is required' } }}
        searchable={false}
        pagination={false}
      />
    );
    act(() => cell(0, 1).focus());
    expect((await screen.findByRole('tooltip')).textContent).toBe('Price is required');
  });

  it('requires getRowId', () => {
    expect(() =>
      render(<DataTable data={ROWS} columns={COLUMNS} cellErrors={{}} />)
    ).toThrow(/getRowId/);
  });
});

type PriceRow = { id: string; price: number | null };

const PRICE_ROWS: PriceRow[] = [
  { id: 'a', price: 10 },
  { id: 'b', price: 20 },
  { id: 'c', price: 30 },
];

const PRICE_COLUMNS: TableColumn<PriceRow>[] = [
  { key: 'price', title: 'Price', dataIndex: 'price', edit: { type: 'number' } },
];

let pendingNow: TablePendingChanges = {};

/** Editable prices; the consumer's rule: a price is positive (cellErrors from pending). */
function PriceHarness() {
  const [pending, setPending] = useState<TablePendingChanges>({});
  pendingNow = pending;
  const errors: Record<string, Record<string, string>> = {};
  for (const [id, row] of Object.entries(pending)) {
    if (typeof row.price === 'number' && row.price <= 0) {
      errors[id] = { price: 'Price must be positive' };
    }
  }
  return (
    <DataTable
      data={PRICE_ROWS}
      columns={PRICE_COLUMNS}
      editable
      getRowId={(r) => r.id}
      pendingChanges={pending}
      onPendingChange={setPending}
      cellErrors={errors}
      searchable={false}
      pagination={false}
    />
  );
}

const cell = (row: number, col: number) =>
  document.querySelector<HTMLInputElement>(`[data-edit-row="${row}"][data-edit-col="${col}"]`)!;

const open = (row: number) => {
  act(() => cell(row, 0).focus());
  return cell(row, 0);
};

const type = (editor: HTMLInputElement, text: string, key: string) => {
  fireEvent.change(editor, { target: { value: text } });
  let notPrevented = true;
  act(() => {
    notPrevented = fireEvent.keyDown(editor, { key });
  });
  return notPrevented;
};

describe('DataTable invalid value (block mode)', () => {
  it('keeps the editor open on a value that does not parse; Esc restores the value', async () => {
    render(<PriceHarness />);
    const price = open(0);
    type(price, 'abc', 'Enter');
    // Stored (the save stays blocked on it), the editor stays open and focused
    expect(pendingNow).toEqual({ a: { price: 'abc' } });
    expect(cell(0, 0)).toBe(price);
    expect(document.activeElement).toBe(price);
    expect(price.closest('td')?.getAttribute('data-invalid')).toBe('true');
    expect((await screen.findByRole('tooltip')).textContent).toBe('Invalid value');
    // Announced once, politely, with its row and column
    const live = Array.from(document.querySelectorAll('[aria-live="polite"]')).map(
      (region) => region.textContent
    );
    expect(live).toContain('Row 1 · Price: Invalid value');
    expect(live).toContain('1 error');
    // Esc: the value it had when the editor opened, editor closed, cell focused
    act(() => {
      fireEvent.keyDown(price, { key: 'Escape' });
    });
    expect(pendingNow).toEqual({});
    const display = cell(0, 0);
    expect(display.tagName).toBe('DIV');
    expect(document.activeElement).toBe(display);
    expect(display.closest('td')?.getAttribute('data-invalid')).toBeNull();
  });

  it('keeps the editor open on a value a rule rejects (cellErrors), until it is fixed', () => {
    render(<PriceHarness />);
    const price = open(0);
    type(price, '-5', 'Enter');
    expect(document.activeElement).toBe(price);
    // Tab does not leave either
    expect(type(price, '-5', 'Tab')).toBe(false);
    expect(document.activeElement).toBe(price);
    // Fixed: Enter moves on
    type(price, '5', 'Enter');
    expect(pendingNow).toEqual({ a: { price: 5 } });
    expect(document.activeElement).toBe(cell(1, 0));
  });

  it('does not block a cell passed through unchanged', () => {
    render(<PriceHarness />);
    type(open(0), '-5', 'Enter');
    act(() => {
      fireEvent.blur(cell(0, 0));
    });
    // Back on the invalid cell, nothing typed: Enter moves on
    const again = open(0);
    type(again, '-5', 'Enter');
    expect(document.activeElement).toBe(cell(1, 0));
    expect(pendingNow).toEqual({ a: { price: -5 } });
  });
});
