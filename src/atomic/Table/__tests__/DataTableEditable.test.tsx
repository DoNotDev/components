// packages/components/src/atomic/Table/__tests__/DataTableEditable.test.tsx

import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';

import { FR_LOCALE, render } from '../../../utils/__tests__/locale';
import { parseCellText, parseClipboardGrid, setPendingCell } from '../editing';
import type { TablePendingChanges } from '../editing';
import { DataTable } from '../index';
import type { TableColumn } from '../index';

type Row = { id: string; name: string; price: number; brand: string };

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', price: 10, brand: 'b1' },
  { id: 'b', name: 'Beta', price: 20, brand: 'b1' },
  { id: 'c', name: 'Gamma', price: 30, brand: 'b2' },
];

const BRANDS = [
  { value: 'b1', label: 'Brand One' },
  { value: 'b2', label: 'Brand Two' },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', edit: { type: 'text' } },
  {
    key: 'price',
    title: 'Price',
    dataIndex: 'price',
    edit: { type: 'number' },
  },
  {
    key: 'brand',
    title: 'Brand',
    dataIndex: 'brand',
    edit: { type: 'select', options: BRANDS },
  },
];

let latest: TablePendingChanges = {};

function Harness() {
  const [pending, setPending] = useState<TablePendingChanges>({});
  latest = pending;
  return (
    <DataTable
      data={ROWS}
      columns={COLUMNS}
      editable
      getRowId={(r) => r.id}
      pendingChanges={pending}
      onPendingChange={setPending}
      searchable={false}
      pagination={false}
    />
  );
}

const cell = (row: number, col: number) =>
  document.querySelector<HTMLInputElement & HTMLSelectElement>(
    `[data-edit-row="${row}"][data-edit-col="${col}"]`
  )!;

describe('parseCellText', () => {
  it('parses decimal comma and flags non-numbers', () => {
    expect(parseCellText('12,5', { type: 'number' })).toEqual({
      value: 12.5,
      valid: true,
    });
    expect(parseCellText('abc', { type: 'number' })).toEqual({
      value: 'abc',
      valid: false,
    });
    expect(parseCellText(' ', { type: 'number' })).toEqual({
      value: null,
      valid: true,
    });
  });

  it('matches select options by value or label, case-insensitive', () => {
    const edit = { type: 'select' as const, options: BRANDS };
    expect(parseCellText('brand two', edit)).toEqual({
      value: 'b2',
      valid: true,
    });
    expect(parseCellText('b1', edit)).toEqual({ value: 'b1', valid: true });
    expect(parseCellText('Nope', edit)).toEqual({
      value: 'Nope',
      valid: false,
    });
  });
});

describe('parseClipboardGrid', () => {
  it('splits rows and tabs, ignores the trailing newline', () => {
    expect(parseClipboardGrid('a\tb\r\nc\td\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('returns null for a single value', () => {
    expect(parseClipboardGrid('hello')).toBeNull();
  });
});

describe('setPendingCell', () => {
  it('drops the entry and the row when the value returns to the original', () => {
    const changed = setPendingCell({}, 'a', 'price', 11, 10);
    expect(changed).toEqual({ a: { price: 11 } });
    expect(setPendingCell(changed, 'a', 'price', 10, 10)).toEqual({});
  });
});

/** Focuses a cell: its editor opens in place of the text. */
const edit = (row: number, col: number) => {
  act(() => cell(row, col).focus());
  return cell(row, col);
};

describe('DataTable editable', () => {
  it('shows cells as text (render / option label) until focused, then the editor', () => {
    render(<Harness />);
    const brand = cell(0, 2);
    expect(brand.tagName).toBe('DIV');
    expect(brand.textContent).toBe('Brand One');
    // No editor until focused (the texts carry the editor's role and name)
    expect(document.querySelector('.dndev-table-cell-editor')).toBeNull();
    const price = edit(0, 1);
    expect(price.tagName).toBe('INPUT');
    expect(document.activeElement).toBe(price);
    expect(price.value).toBe('10');
    // Text selected: typing replaces it, like a spreadsheet
    expect(price.selectionStart).toBe(0);
    expect(price.selectionEnd).toBe(2);
    // Same cell, no own box: the editor sits where the text was
    expect(price.closest('td')?.getAttribute('data-editable')).toBe('true');
    fireEvent.blur(price);
    expect(cell(0, 1).tagName).toBe('DIV');
  });

  it('names the focusable text after its column, with the role of its editor', () => {
    render(<Harness />);
    // Keyboard / screen-reader users hear which column the focus reached
    const prices = screen.getAllByRole('textbox', { name: 'Price' });
    expect(prices).toHaveLength(ROWS.length);
    expect(prices[0]).toBe(cell(0, 1));
    expect(prices[0]!.tagName).toBe('DIV');
    expect(prices[0]!.getAttribute('tabindex')).toBe('0');
    const brand = screen.getAllByRole('combobox', { name: 'Brand' })[0]!;
    expect(brand).toBe(cell(0, 2));
    expect(brand.getAttribute('aria-expanded')).toBe('false');
    // Focus still opens the editor, same role and name
    const editor = edit(0, 1);
    expect(editor.tagName).toBe('INPUT');
    expect(screen.getAllByRole('textbox', { name: 'Price' })[0]).toBe(editor);
    expect(edit(0, 2).tagName).toBe('SELECT');
  });

  it('shows a number without render in the UI language; the editor keeps the stored text', () => {
    render(
      <DataTable
        data={[{ id: 'a', price: 29.9 }, { id: 'b', price: 1234.5 }]}
        columns={[{ key: 'price', title: 'Price', dataIndex: 'price', edit: { type: 'number' } }]}
        editable
        getRowId={(r) => r.id}
        pendingChanges={{}}
        onPendingChange={() => {}}
        searchable={false}
        pagination={false}
      />,
      FR_LOCALE
    );
    expect(cell(0, 0).textContent).toBe('29,9');
    expect(cell(1, 0).textContent).toBe(new Intl.NumberFormat('fr').format(1234.5));
    expect(edit(0, 0).value).toBe('29.9');
  });

  it('stores a typed value on blur and marks the cell dirty', () => {
    render(<Harness />);
    const price = edit(0, 1);
    fireEvent.change(price, { target: { value: '15' } });
    fireEvent.blur(price);
    expect(latest).toEqual({ a: { price: 15 } });
    expect(cell(0, 1).closest('td')?.getAttribute('data-dirty')).toBe('true');
    expect(cell(0, 1).textContent).toBe('15');
  });

  it('Enter stores the value and opens the same column on the next row', () => {
    render(<Harness />);
    const first = edit(0, 0);
    fireEvent.change(first, { target: { value: 'Alpha 2' } });
    act(() => {
      fireEvent.keyDown(first, { key: 'Enter' });
    });
    expect(latest).toEqual({ a: { name: 'Alpha 2' } });
    const next = cell(1, 0);
    expect(next.tagName).toBe('INPUT');
    expect(document.activeElement).toBe(next);
    // ArrowUp goes back
    act(() => {
      fireEvent.keyDown(next, { key: 'ArrowUp' });
    });
    expect(document.activeElement).toBe(cell(0, 0));
  });

  it('Esc restores the value and leaves the editor; typing a character edits again with it', () => {
    render(<Harness />);
    const name = edit(0, 0);
    fireEvent.change(name, { target: { value: 'Typo' } });
    act(() => {
      fireEvent.keyDown(name, { key: 'Escape' });
    });
    const display = cell(0, 0);
    expect(display.tagName).toBe('DIV');
    expect(document.activeElement).toBe(display);
    expect(latest).toEqual({});
    act(() => {
      fireEvent.keyDown(display, { key: 'Z' });
    });
    const editor = cell(0, 0);
    expect(editor.tagName).toBe('INPUT');
    expect(editor.value).toBe('Z');
    fireEvent.blur(editor);
    expect(latest).toEqual({ a: { name: 'Z' } });
  });

  it('pastes an Excel block across rows and columns', () => {
    render(<Harness />);
    fireEvent.paste(edit(1, 1), {
      clipboardData: { getData: () => '25\tBrand Two\n35,5\tb1\n' },
    });
    expect(latest).toEqual({
      b: { price: 25, brand: 'b2' },
      c: { price: 35.5, brand: 'b1' },
    });
  });

  it('pastes a block on a focused cell shown as text (after Esc)', () => {
    render(<Harness />);
    act(() => {
      fireEvent.keyDown(edit(0, 1), { key: 'Escape' });
    });
    fireEvent.paste(cell(0, 1), {
      clipboardData: { getData: () => '11\n12' },
    });
    expect(latest).toEqual({ a: { price: 11 }, b: { price: 12 } });
  });

  it('keeps a value that does not parse and flags its cell', () => {
    render(<Harness />);
    const price = edit(0, 1);
    fireEvent.change(price, { target: { value: 'abc' } });
    fireEvent.blur(price);
    expect(latest).toEqual({ a: { price: 'abc' } });
    expect(cell(0, 1).closest('td')?.getAttribute('data-invalid')).toBe('true');
    // Shown as typed (what the save will reject)
    expect(cell(0, 1).textContent).toBe('abc');
  });

  it('a select cell shows its chevron, then the native select on focus', () => {
    render(<Harness />);
    expect(cell(0, 2).querySelector('.dndev-table-cell-chevron')).toBeTruthy();
    const brand = edit(0, 2);
    expect(brand.tagName).toBe('SELECT');
    fireEvent.change(brand, { target: { value: 'b2' } });
    expect(latest).toEqual({ a: { brand: 'b2' } });
  });

  it('shows the selection bar in the bottom bar, not above the table', () => {
    const { container } = render(<Harness />);
    const before = container.querySelector('table')!.previousElementSibling;
    const boxes = screen.getAllByRole('checkbox');
    // [0] = select all, [1..] = rows
    fireEvent.click(boxes[1]!);
    fireEvent.click(boxes[3]!);
    const bar = screen.getByRole('toolbar', { name: '2 selected' });
    expect(bar.closest('.dndev-action-bar')).toBeTruthy();
    expect(container.contains(bar)).toBe(false);
    expect(container.querySelector('table')!.previousElementSibling).toBe(before);
    // Apply is a labelled button (not an empty square)
    expect(screen.getByRole('button', { name: 'Apply to selected' }).textContent).toContain(
      'Apply to selected'
    );
    // Clear unchecks every row and hides the bar
    fireEvent.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('applies one typed value to every checked row from the selection bar', async () => {
    render(<Harness />);
    const boxes = screen.getAllByRole('checkbox');
    fireEvent.click(boxes[1]!);
    fireEvent.click(boxes[3]!);
    // Framework Select (Radix): open the field picker, pick "Price"
    const picker = screen.getByRole('combobox', { name: 'Field' });
    act(() => {
      fireEvent.keyDown(picker, { key: 'Enter' });
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Price' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Value' }), {
      target: { value: '9,5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply to selected' }));
    expect(latest).toEqual({ a: { price: 9.5 }, c: { price: 9.5 } });
  });

  it('Ctrl+Z undoes the last change and restores the text', () => {
    render(<Harness />);
    const name = edit(0, 0);
    fireEvent.change(name, { target: { value: 'Alpha 2' } });
    // Enter + the blur that follows store one change (one undo step)
    act(() => {
      fireEvent.keyDown(name, { key: 'Enter' });
    });
    expect(latest).toEqual({ a: { name: 'Alpha 2' } });
    const back = edit(0, 0);
    act(() => {
      fireEvent.keyDown(back, { key: 'z', ctrlKey: true });
    });
    expect(latest).toEqual({});
    expect(cell(0, 0).value).toBe('Alpha');
  });

  it('requires getRowId and controlled pending changes', () => {
    const noop = () => {};
    expect(() =>
      render(
        <DataTable
          data={ROWS}
          columns={COLUMNS}
          editable
          onPendingChange={noop}
        />
      )
    ).toThrow(/requires `getRowId`/);
  });
});
