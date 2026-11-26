// packages/components/src/atomic/Table/__tests__/DataTableErrorList.test.tsx

import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';

import { render } from '../../../utils/__tests__/locale';
import { DataTable } from '../index';
import type { TableColumn, TablePendingChanges } from '../index';

// Error list (T4, SAP UI5 MessagePopover): an "N errors" button in the bottom bar
// opens a non-modal list, one entry per invalid cell; an entry focuses its cell.

type Row = { id: string; name: string; price: number };

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', price: 10 },
  { id: 'b', name: 'Beta', price: 20 },
  { id: 'c', name: 'Gamma', price: 30 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', edit: { type: 'text' } },
  { key: 'price', title: 'Price', dataIndex: 'price', edit: { type: 'number' } },
];

let pendingNow: TablePendingChanges = {};

/** Editable rows; the consumer's rule: a price is positive (cellErrors from pending). */
function Harness({ pageSize }: { pageSize?: number }) {
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
      data={ROWS}
      columns={COLUMNS}
      editable
      getRowId={(r) => r.id}
      pendingChanges={pending}
      onPendingChange={setPending}
      cellErrors={errors}
      searchable={false}
      pagination={pageSize !== undefined}
      {...(pageSize !== undefined && { pageSize })}
    />
  );
}

const cell = (row: number, col: number) =>
  document.querySelector<HTMLInputElement>(`[data-edit-row="${row}"][data-edit-col="${col}"]`)!;

/** Types `text` in a cell and leaves it with the pointer (blur stores it). */
const setCell = (row: number, col: number, text: string) => {
  act(() => cell(row, col).focus());
  const editor = cell(row, col);
  fireEvent.change(editor, { target: { value: text } });
  act(() => {
    fireEvent.blur(editor);
  });
};

const errorsButton = () => screen.queryByRole('button', { name: /errors?$/ });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DataTable error list', () => {
  it('counts the invalid cells in the bottom bar and lists them in the order shown', async () => {
    const { container } = render(<Harness />);
    expect(errorsButton()).toBeNull();
    setCell(2, 1, '-1');
    setCell(0, 1, 'abc');
    const button = errorsButton()!;
    expect(button.textContent).toBe('2 errors');
    expect(button.closest('.dndev-action-bar')).toBeTruthy();
    expect(container.contains(button)).toBe(false);
    // The count change is announced once, politely
    const live = Array.from(document.querySelectorAll('[aria-live="polite"]')).map(
      (region) => region.textContent
    );
    expect(live).toContain('2 errors');

    fireEvent.click(button);
    const list = await screen.findByRole('dialog', { name: '2 errors' });
    const entries = within(list).getAllByRole('button').map((entry) => entry.textContent);
    expect(entries).toEqual([
      'Row 1 · Price: Invalid value',
      'Row 3 · Price: Price must be positive',
    ]);
  });

  it('an entry closes the list and focuses its cell', async () => {
    render(<Harness />);
    setCell(2, 1, '-1');
    fireEvent.click(errorsButton()!);
    const list = await screen.findByRole('dialog');
    fireEvent.click(within(list).getByRole('button', { name: 'Row 3 · Price: Price must be positive' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(cell(2, 1)));
    expect(cell(2, 1).tagName).toBe('INPUT');
  });

  it('an entry on another page opens that page and focuses its cell', async () => {
    render(<Harness pageSize={2} />);
    // Row 3 is on page 2: make it invalid there, come back to page 1
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    setCell(0, 1, '-1');
    fireEvent.click(screen.getByRole('button', { name: 'Page 1' }));
    expect(cell(0, 0).textContent).toBe('Alpha');
    fireEvent.click(errorsButton()!);
    fireEvent.click(await screen.findByRole('button', { name: 'Row 3 · Price: Price must be positive' }));
    await waitFor(() => expect(document.activeElement).toBe(cell(0, 1)));
    expect(cell(0, 0).textContent).toBe('Gamma');
  });

  it('drops an entry once its cell is fixed, and the button with the last one', async () => {
    render(<Harness />);
    setCell(0, 1, '-1');
    setCell(1, 1, '-2');
    expect(errorsButton()!.textContent).toBe('2 errors');
    setCell(0, 1, '5');
    expect(errorsButton()!.textContent).toBe('1 error');
    fireEvent.click(errorsButton()!);
    const list = await screen.findByRole('dialog', { name: '1 error' });
    expect(within(list).getAllByRole('button').map((entry) => entry.textContent)).toEqual([
      'Row 2 · Price: Price must be positive',
    ]);
    setCell(1, 1, '6');
    expect(errorsButton()).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(pendingNow).toEqual({ a: { price: 5 }, b: { price: 6 } });
  });

  it('touch: a tap on an invalid cell opens its editor and the list on its entry, focus kept', async () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    render(<Harness />);
    setCell(0, 1, '-1');
    setCell(2, 1, '-3');
    const display = cell(2, 1);
    expect(display.tagName).toBe('DIV');
    // A tap: pointer down, then the focus it gives the cell
    fireEvent.pointerDown(display, { pointerType: 'touch' });
    act(() => display.focus());
    const list = await screen.findByRole('dialog');
    expect(
      within(list).getByRole('button', { name: 'Row 3 · Price: Price must be positive' }).getAttribute('aria-current')
    ).toBe('true');
    // The editor has focus, not the list; no tooltip over it on a touch screen
    const editor = cell(2, 1);
    expect(editor.tagName).toBe('INPUT');
    await waitFor(() => expect(document.activeElement).toBe(editor));
    expect(list.contains(document.activeElement)).toBe(false);
    expect(screen.queryByRole('tooltip')).toBeNull();
    // A tap on a valid cell closes the list; focus stays in that cell's editor
    const name = cell(1, 0);
    fireEvent.pointerDown(name, { pointerType: 'touch' });
    act(() => name.focus());
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(cell(1, 0));
    expect(cell(1, 0).tagName).toBe('INPUT');
  });
});
