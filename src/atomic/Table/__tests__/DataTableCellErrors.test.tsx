// packages/components/src/atomic/Table/__tests__/DataTableCellErrors.test.tsx

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DataTable } from '../index';
import type { TableColumn } from '../index';

// cellErrors: cells breaking a rule are marked invalid with their message.

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
    const prices = screen.getAllByRole('textbox', { name: 'Price' });
    expect(prices[0]!.getAttribute('aria-invalid')).toBe('true');
    const describedBy = prices[0]!.getAttribute('aria-describedby');
    expect(document.getElementById(describedBy!)?.textContent).toBe('Price is required');
    expect(prices[0]!.closest('td')?.getAttribute('data-invalid')).toBe('true');
    // Other rows / cells untouched
    expect(prices[1]!.getAttribute('aria-invalid')).toBeNull();
    expect(screen.getAllByRole('textbox', { name: 'Name' })[0]!.getAttribute('aria-invalid')).toBeNull();
    // A cell without an editor shows the message too
    const note = screen.getByText('Note is not valid');
    expect(note.closest('td')?.getAttribute('data-invalid')).toBe('true');
  });

  it('requires getRowId', () => {
    expect(() =>
      render(<DataTable data={ROWS} columns={COLUMNS} cellErrors={{}} />)
    ).toThrow(/getRowId/);
  });
});
