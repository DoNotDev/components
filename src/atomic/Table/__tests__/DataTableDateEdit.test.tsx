// packages/components/src/atomic/Table/__tests__/DataTableDateEdit.test.tsx

/**
 * @fileoverview Date and date-time cell editors (owner decision 2026-11-25 C1): the
 * DatePicker / DateTimePicker in place, stored UTC <-> wall time in the app's zone,
 * paste and bulk edit like the other editor types.
 */

import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { render } from '../../../utils/__tests__/locale';
import { isCellValueValid, parseCellText } from '../editing';
import type { TableCellEdit, TablePendingChanges } from '../editing';
import { DataTable } from '../index';
import type { TableColumn } from '../index';

const PARIS = 'Europe/Paris';
const DATE: TableCellEdit = { type: 'date', timeZone: PARIS };
const DATETIME: TableCellEdit = { type: 'datetime', timeZone: PARIS };

describe('parseCellText: date', () => {
  it('reads ISO and day-first dates as YYYY-MM-DD', () => {
    expect(parseCellText('2026-11-24', DATE)).toEqual({ value: '2026-11-24', valid: true });
    expect(parseCellText('24/11/2026', DATE)).toEqual({ value: '2026-11-24', valid: true });
    expect(parseCellText('4.1.2027', DATE)).toEqual({ value: '2027-01-04', valid: true });
    expect(parseCellText(' ', DATE)).toEqual({ value: null, valid: true });
  });

  it('reads an instant as its day in the app zone', () => {
    expect(parseCellText('2026-11-24T23:30:00Z', DATE)).toEqual({
      value: '2026-11-25',
      valid: true,
    });
  });

  it('keeps a date that does not exist as typed, invalid', () => {
    expect(parseCellText('31/02/2026', DATE)).toEqual({ value: '31/02/2026', valid: false });
    expect(parseCellText('demain', DATE)).toEqual({ value: 'demain', valid: false });
  });
});

describe('parseCellText: datetime', () => {
  it('reads a wall time in the app zone and stores its UTC instant', () => {
    expect(parseCellText('25/11/2026 00:30', DATETIME)).toEqual({
      value: '2026-11-24T23:30:00.000Z',
      valid: true,
    });
    expect(parseCellText('2026-07-01 12:00', DATETIME)).toEqual({
      value: '2026-07-01T10:00:00.000Z',
      valid: true,
    });
    // A date alone: midnight in the app zone
    expect(parseCellText('2026-11-25', DATETIME)).toEqual({
      value: '2026-11-24T23:00:00.000Z',
      valid: true,
    });
  });

  it('keeps an instant with its zone as is (normalised to UTC)', () => {
    expect(parseCellText('2026-11-24T23:30:00+00:00', DATETIME)).toEqual({
      value: '2026-11-24T23:30:00.000Z',
      valid: true,
    });
  });

  it('flags text that is not a date-time', () => {
    expect(parseCellText('25/11/2026 25:00', DATETIME).valid).toBe(false);
    expect(parseCellText('soon', DATETIME).valid).toBe(false);
  });

  it('is the same whatever the machine zone', () => {
    const previous = process.env.TZ;
    try {
      const values = ['UTC', 'America/Los_Angeles', 'Asia/Tokyo'].map((tz) => {
        process.env.TZ = tz;
        return parseCellText('25/11/2026 00:30', DATETIME).value;
      });
      expect(new Set(values)).toEqual(new Set(['2026-11-24T23:30:00.000Z']));
    } finally {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    }
  });

  it('throws without the app zone (never the browser zone)', () => {
    expect(() => parseCellText('2026-11-25 00:30', { type: 'datetime' })).toThrow(
      /timeZone/
    );
  });
});

describe('isCellValueValid: dates', () => {
  it('accepts stored dates and instants, flags typed text', () => {
    expect(isCellValueValid('2026-11-24', DATE)).toBe(true);
    expect(isCellValueValid('2026-11-24T23:30:00+00:00', DATETIME)).toBe(true);
    expect(isCellValueValid(null, DATETIME)).toBe(true);
    expect(isCellValueValid('31/02/2026', DATE)).toBe(false);
  });
});

type Row = { id: string; title: string; startsAt: string | null; deliveryDate: string | null };

const ROWS: Row[] = [
  { id: 'a', title: 'Winter', startsAt: '2026-11-24T23:30:00+00:00', deliveryDate: '2026-12-01' },
  { id: 'b', title: 'Spring', startsAt: null, deliveryDate: null },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'title', title: 'Title', dataIndex: 'title', edit: { type: 'text' } },
  { key: 'startsAt', title: 'Starts', dataIndex: 'startsAt', edit: DATETIME },
  { key: 'deliveryDate', title: 'Delivery', dataIndex: 'deliveryDate', edit: DATE },
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
  document.querySelector<HTMLElement>(`[data-edit-row="${row}"][data-edit-col="${col}"]`)!;

/** Focus the cell's text: its editor opens in place. */
const open = (row: number, col: number) => {
  act(() => {
    cell(row, col).focus();
  });
  return cell(row, col);
};

describe('DataTable date editors', () => {
  it('opens the DateTimePicker on the wall time in the app zone', () => {
    render(<Harness />);
    const editor = open(0, 1);
    expect(editor.getAttribute('role')).toBe('group');
    expect(editor.getAttribute('aria-label')).toBe('Starts');
    // 23:30 UTC = 25 Nov 00:30 in Paris: the segments read the Paris wall time
    const values = Array.from(editor.querySelectorAll('[role="spinbutton"]')).map(
      (s) => s.getAttribute('aria-valuenow')
    );
    expect(values).toEqual(expect.arrayContaining(['25', '11', '2026', '0', '30']));
  });

  it('stores a changed wall time as its UTC instant', () => {
    render(<Harness />);
    const editor = open(0, 1);
    const minute = Array.from(editor.querySelectorAll<HTMLElement>('[role="spinbutton"]')).find(
      (s) => s.getAttribute('aria-valuenow') === '30'
    )!;
    act(() => {
      minute.focus();
      fireEvent.keyDown(minute, { key: 'ArrowUp' });
    });
    expect(latest).toEqual({ a: { startsAt: '2026-11-24T23:31:00.000Z' } });
  });

  it('opens the DatePicker on a calendar date and stores YYYY-MM-DD', () => {
    render(<Harness />);
    const editor = open(0, 2);
    const day = Array.from(editor.querySelectorAll<HTMLElement>('[role="spinbutton"]')).find(
      (s) => s.getAttribute('aria-valuenow') === '1'
    )!;
    act(() => {
      day.focus();
      fireEvent.keyDown(day, { key: 'ArrowUp' });
    });
    expect(latest).toEqual({ a: { deliveryDate: '2026-12-02' } });
  });

  it('pastes a spreadsheet block of dates (wall times in the app zone)', () => {
    render(<Harness />);
    fireEvent.paste(cell(0, 1), {
      clipboardData: {
        getData: () => '25/11/2026 08:00\t03/12/2026\n2026-12-01 09:15\t2026-12-24\n',
      },
    });
    expect(latest).toEqual({
      a: { startsAt: '2026-11-25T07:00:00.000Z', deliveryDate: '2026-12-03' },
      b: { startsAt: '2026-12-01T08:15:00.000Z', deliveryDate: '2026-12-24' },
    });
  });

  it('pastes a block inside an open date editor', () => {
    render(<Harness />);
    const editor = open(0, 2);
    fireEvent.paste(editor.querySelector('[role="spinbutton"]')!, {
      clipboardData: { getData: () => '2027-01-04\n2027-01-05' },
    });
    expect(latest).toEqual({
      a: { deliveryDate: '2027-01-04' },
      b: { deliveryDate: '2027-01-05' },
    });
  });

  it('keeps a pasted date that does not exist as typed and flags it', () => {
    render(<Harness />);
    fireEvent.paste(cell(1, 2), { clipboardData: { getData: () => '31/02/2026' } });
    expect(latest).toEqual({ b: { deliveryDate: '31/02/2026' } });
    expect(cell(1, 2).closest('td')?.getAttribute('data-invalid')).toBe('true');
  });

  it('Esc closes the editor back to the text', () => {
    render(<Harness />);
    const editor = open(0, 2);
    act(() => {
      fireEvent.keyDown(editor.querySelector('[role="spinbutton"]')!, { key: 'Escape' });
    });
    expect(cell(0, 2).tagName).toBe('DIV');
    expect(cell(0, 2).getAttribute('role')).toBe('textbox');
  });

  it('applies one picked date to every checked row from the selection bar', async () => {
    render(<Harness />);
    const boxes = screen.getAllByRole('checkbox');
    fireEvent.click(boxes[1]!);
    fireEvent.click(boxes[2]!);
    const picker = screen.getByRole('combobox', { name: 'Field' });
    act(() => {
      fireEvent.keyDown(picker, { key: 'Enter' });
    });
    fireEvent.click(await screen.findByRole('option', { name: 'Delivery' }));
    // The bulk value is the DatePicker: paste a date into its first segment
    const bar = screen.getByRole('toolbar');
    const segment = bar.querySelector<HTMLElement>('[role="spinbutton"]')!;
    act(() => {
      fireEvent.paste(segment, { clipboardData: { getData: () => '2026-12-20' } });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply to selected' }));
    expect(latest).toEqual({
      a: { deliveryDate: '2026-12-20' },
      b: { deliveryDate: '2026-12-20' },
    });
  });
});
