// packages/components/src/atomic/Table/__tests__/DataTableEditOverlay.test.tsx

/**
 * @fileoverview Editing overlay (owner decision 2026-11-26 T1): while a cell is edited,
 * its text stays in the flow, invisible and hidden from assistive tech, and the editor
 * lays over it inside a positioned wrapper in the same `<td>`, so no column width
 * changes. jsdom has no layout: these tests assert the structure the CSS relies on
 * (the widths were measured in Chromium with the real Table.css), not any width.
 */

import { act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { render } from '../../../utils/__tests__/locale';
import { DataTable } from '../index';
import type { TableColumn } from '../index';

type Row = {
  id: string;
  name: string;
  qty: number;
  brand: string;
  day: string;
};

const ROWS: Row[] = [
  { id: 'a', name: 'Alpha', qty: 12, brand: 'b1', day: '2026-12-01' },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name', edit: { type: 'text' } },
  { key: 'qty', title: 'Qty', dataIndex: 'qty', edit: { type: 'number' } },
  {
    key: 'brand',
    title: 'Brand',
    dataIndex: 'brand',
    edit: { type: 'select', options: [{ value: 'b1', label: 'Brand One' }] },
  },
  {
    key: 'day',
    title: 'Day',
    dataIndex: 'day',
    edit: { type: 'date', timeZone: 'Europe/Paris' },
  },
];

const cell = (col: number) =>
  document.querySelector<HTMLElement>(
    `[data-edit-row="0"][data-edit-col="${col}"]`
  )!;

describe('DataTable editing overlay', () => {
  it.each([
    [0, 'text', 'Alpha'],
    [1, 'number', '12'],
    [2, 'select', 'Brand One'],
    [3, 'date', '01/12/2026'],
  ])(
    'keeps the %i column (%s) text in the flow, hidden, under the editor',
    (col, _type, text) => {
      render(
        <DataTable
          data={ROWS}
          columns={COLUMNS}
          editable
          getRowId={(r) => r.id}
          pendingChanges={{}}
          onPendingChange={() => {}}
          searchable={false}
          pagination={false}
        />
      );
      act(() => cell(col).focus());
      const editor = cell(col);
      // Exactly one element carries the editor position (the copy of the text has none)
      expect(
        document.querySelectorAll(`[data-edit-row="0"][data-edit-col="${col}"]`)
      ).toHaveLength(1);
      const td = editor.closest('td')!;
      expect(td.getAttribute('data-editable')).toBe('true');
      const wrapper = editor.closest('.dndev-table-cell-overlay')!;
      expect(wrapper).not.toBeNull();
      expect(wrapper.closest('td')).toBe(td);
      // The text copy: same wrapper, hidden from assistive tech, nothing focusable or named
      const sizer = wrapper.querySelector<HTMLElement>(
        '.dndev-table-cell-sizer'
      )!;
      expect(sizer.getAttribute('aria-hidden')).toBe('true');
      expect(sizer.hasAttribute('tabindex')).toBe(false);
      expect(sizer.hasAttribute('role')).toBe(false);
      expect(sizer.classList.contains('dndev-table-cell-display')).toBe(true);
      if (col !== 3) expect(sizer.textContent).toContain(text);
      expect(sizer.contains(editor)).toBe(false);
      // The focused editor is the real control; the real display is gone
      expect(td.querySelector('div.dndev-table-cell-display')).toBeNull();
    }
  );
});
