// packages/components/src/atomic/Table/__tests__/DataTableEditable.test.tsx

import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, it, expect } from 'vitest';

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

describe('DataTable editable', () => {
  it('stores a typed value on blur and marks the cell dirty', () => {
    render(<Harness />);
    const price = cell(0, 1);
    fireEvent.change(price, { target: { value: '15' } });
    fireEvent.blur(price);
    expect(latest).toEqual({ a: { price: 15 } });
    expect(price.closest('td')?.getAttribute('data-dirty')).toBe('true');
  });

  it('Enter moves to the same column on the next row', () => {
    render(<Harness />);
    const first = cell(0, 0);
    first.focus();
    fireEvent.keyDown(first, { key: 'Enter' });
    expect(document.activeElement).toBe(cell(1, 0));
  });

  it('pastes an Excel block across rows and columns', () => {
    render(<Harness />);
    fireEvent.paste(cell(1, 1), {
      clipboardData: { getData: () => '25\tBrand Two\n35,5\tb1\n' },
    });
    expect(latest).toEqual({
      b: { price: 25, brand: 'b2' },
      c: { price: 35.5, brand: 'b1' },
    });
  });

  it('keeps a value that does not parse and flags its cell', () => {
    render(<Harness />);
    const price = cell(0, 1);
    fireEvent.change(price, { target: { value: 'abc' } });
    fireEvent.blur(price);
    expect(latest).toEqual({ a: { price: 'abc' } });
    expect(cell(0, 1).closest('td')?.getAttribute('data-invalid')).toBe('true');
  });

  it('applies one value to every checked row from the bulk bar', () => {
    render(<Harness />);
    const boxes = screen.getAllByRole('checkbox');
    // [0] = select all, [1..] = rows
    fireEvent.click(boxes[1]!);
    fireEvent.click(boxes[3]!);
    fireEvent.change(screen.getByLabelText('Field'), {
      target: { value: 'brand' },
    });
    fireEvent.change(screen.getByLabelText('Value'), {
      target: { value: 'b2' },
    });
    fireEvent.click(screen.getByText('Apply to selected'));
    expect(latest).toEqual({ a: { brand: 'b2' } });
  });

  it('Ctrl+Z undoes the last change and restores the editor', () => {
    render(<Harness />);
    const name = cell(0, 0);
    fireEvent.change(name, { target: { value: 'Alpha 2' } });
    fireEvent.blur(name);
    expect(latest).toEqual({ a: { name: 'Alpha 2' } });
    act(() => {
      fireEvent.keyDown(name, { key: 'z', ctrlKey: true });
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
