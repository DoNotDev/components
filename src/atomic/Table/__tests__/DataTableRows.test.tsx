// packages/components/src/atomic/Table/__tests__/DataTableRows.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { DataTable } from '../index';
import type { TableColumn } from '../index';

type Row = { id: string; name: string };

const ROWS: Row[] = Array.from({ length: 15 }, (_, i) => ({
  id: `r${i}`,
  name: `Row ${i}`,
}));
const COLUMNS: TableColumn<Row>[] = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];

const checkboxes = () => screen.getAllByRole('checkbox');

describe('DataTable row selection', () => {
  it('header select-all selects every row across client-side pages', () => {
    const onSelect = vi.fn();
    render(
      <DataTable
        data={ROWS}
        columns={COLUMNS}
        selectable
        getRowId={(r) => r.id}
        onSelect={onSelect}
        searchable={false}
        pageSize={5}
        onPageSizeChange={() => {}}
      />
    );
    fireEvent.click(checkboxes()[0]);
    expect(onSelect).toHaveBeenLastCalledWith(ROWS);
    // Header reflects "all selected"; unchecking clears everything
    expect(checkboxes()[0].getAttribute('data-state')).toBe('checked');
    fireEvent.click(checkboxes()[0]);
    expect(onSelect).toHaveBeenLastCalledWith([]);
  });

  it('drops selected rows that leave the data (deleted)', () => {
    const { rerender } = render(
      <DataTable
        data={ROWS.slice(0, 3)}
        columns={COLUMNS}
        selectable
        getRowId={(r) => r.id}
        searchable={false}
        pagination={false}
      />
    );
    fireEvent.click(checkboxes()[0]);
    rerender(
      <DataTable
        data={ROWS.slice(1, 3)}
        columns={COLUMNS}
        selectable
        getRowId={(r) => r.id}
        searchable={false}
        pagination={false}
      />
    );
    // Remaining two rows still selected, header still "all"
    expect(checkboxes()[0].getAttribute('data-state')).toBe('checked');
  });
});

describe('DataTable open cell', () => {
  it('renders a real link to each row', () => {
    render(
      <DataTable
        data={ROWS.slice(0, 2)}
        columns={COLUMNS}
        getRowHref={(r) => `/items/${r.id}`}
        openLabel="Open"
        searchable={false}
        pagination={false}
      />
    );
    const links = screen.getAllByRole('link', { name: 'Open' });
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/items/r0',
      '/items/r1',
    ]);
  });

  it('renders a button when the app opens rows in place', () => {
    const onRowOpen = vi.fn();
    render(
      <DataTable
        data={ROWS.slice(0, 1)}
        columns={COLUMNS}
        onRowOpen={onRowOpen}
        getRowHref={(r) => `/items/${r.id}`}
        openLabel="Open"
        searchable={false}
        pagination={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onRowOpen).toHaveBeenCalledWith(ROWS[0]);
    expect(screen.queryByRole('link', { name: 'Open' })).toBeNull();
  });

  it('requires openLabel', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <DataTable
          data={ROWS}
          columns={COLUMNS}
          getRowHref={(r) => `/items/${r.id}`}
        />
      )
    ).toThrow(/openLabel/);
  });
});
