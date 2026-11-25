// packages/components/src/utils/__tests__/tableSort.test.tsx

import { beforeEach, describe, expect, it } from 'vitest';

import {
  isTableColumnSortable,
  sortableTableColumns,
  sortTableRows,
  tableSortValue,
} from '../tableSort';
import type { TableSortColumn } from '../tableSort';

type Row = Record<string, unknown>;

/** UI language the table passes (the i18n language); French unless a test sets another. */
let lang = 'fr';

const col = (column: Partial<TableSortColumn<Row>> & { key: string }) =>
  column as TableSortColumn<Row>;
const sorted = (
  rows: Row[],
  column: TableSortColumn<Row>,
  direction: 'asc' | 'desc' = 'asc',
  field = 'id'
) => sortTableRows(rows, column, direction, lang).map((row) => row[field]);

describe('tableSort', () => {
  beforeEach(() => {
    lang = 'fr';
  });

  describe('isTableColumnSortable', () => {
    it('sorts by default a column with dataIndex or render', () => {
      expect(isTableColumnSortable(col({ key: 'a', dataIndex: 'a' }), true)).toBe(true);
      expect(isTableColumnSortable(col({ key: 'a', render: () => 'x' }), true)).toBe(true);
    });
    it('does not sort a column with neither, an opted-out column or a non-sortable table', () => {
      expect(isTableColumnSortable(col({ key: 'a' }), true)).toBe(false);
      expect(isTableColumnSortable(col({ key: 'a', dataIndex: 'a', sortable: false }), true)).toBe(false);
      expect(isTableColumnSortable(col({ key: 'a', dataIndex: 'a' }), false)).toBe(false);
    });
  });

  describe('texts', () => {
    it('ignores case and accents, in the UI language', () => {
      const rows = ['zèbre', 'Écureuil', 'abeille', 'Élan', 'castor'].map((name) => ({ id: name, name }));
      expect(sorted(rows, col({ key: 'name', dataIndex: 'name' }))).toEqual([
        'abeille',
        'castor',
        'Écureuil',
        'Élan',
        'zèbre',
      ]);
    });
    it('compares digits in texts numerically', () => {
      const rows = ['Lot 10', 'Lot 2', 'Lot 1'].map((name) => ({ id: name, name }));
      expect(sorted(rows, col({ key: 'name', dataIndex: 'name' }))).toEqual(['Lot 1', 'Lot 2', 'Lot 10']);
    });
    it('keeps the order of equal cells (stable), in both directions', () => {
      const rows = [
        { id: 1, name: 'e' },
        { id: 2, name: 'É' },
        { id: 3, name: 'a' },
        { id: 4, name: 'E' },
      ];
      const column = col({ key: 'name', dataIndex: 'name' });
      expect(sorted(rows, column, 'asc')).toEqual([3, 1, 2, 4]);
      expect(sorted(rows, column, 'desc')).toEqual([1, 2, 4, 3]);
    });
  });

  describe('values', () => {
    it('sorts numbers and numeric texts by value', () => {
      const rows = [{ id: 'a', n: 10 }, { id: 'b', n: 9.5 }, { id: 'c', n: '100' }, { id: 'd', n: -2 }];
      expect(sorted(rows, col({ key: 'n', dataIndex: 'n' }))).toEqual(['d', 'b', 'a', 'c']);
    });
    it('sorts dates and ISO date texts chronologically, whatever render shows', () => {
      const render = (value: unknown) =>
        new Date(value as string).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      const rows = [
        { id: 'feb', at: '2026-02-01T10:00:00Z' },
        { id: 'dec', at: '2025-12-31' },
        { id: 'jan', at: '2026-01-15T08:30:00.000+01:00' },
      ];
      expect(sorted(rows, col({ key: 'at', dataIndex: 'at', render }))).toEqual(['dec', 'jan', 'feb']);
      const dates = [
        { id: 'b', at: new Date('2026-02-01') },
        { id: 'a', at: new Date('2026-01-01') },
      ];
      expect(sorted(dates, col({ key: 'at', dataIndex: 'at' }))).toEqual(['a', 'b']);
    });
    it('sorts booleans false then true', () => {
      const rows = [{ id: 'y', ok: true }, { id: 'n', ok: false }];
      expect(sorted(rows, col({ key: 'ok', dataIndex: 'ok' }))).toEqual(['n', 'y']);
    });
    it('puts numbers before texts', () => {
      const rows = [{ id: 't', v: 'abc' }, { id: 'n', v: 3 }];
      expect(sorted(rows, col({ key: 'v', dataIndex: 'v' }))).toEqual(['n', 't']);
    });
  });

  describe('empty cells', () => {
    const rows = [
      { id: 'null', v: null },
      { id: 'b', v: 'b' },
      { id: 'undef' },
      { id: 'blank', v: '  ' },
      { id: 'a', v: 'a' },
      { id: 'nan', v: Number.NaN },
    ];
    it('go last in both directions', () => {
      const column = col({ key: 'v', dataIndex: 'v' });
      expect(sorted(rows, column, 'asc')).toEqual(['a', 'b', 'null', 'undef', 'blank', 'nan']);
      expect(sorted(rows, column, 'desc')).toEqual(['b', 'a', 'null', 'undef', 'blank', 'nan']);
    });
    it('stay empty even when render shows a placeholder', () => {
      const column = col({ key: 'v', dataIndex: 'v', render: (v) => (v ? String(v) : '—') });
      expect(sorted(rows, column, 'asc').slice(0, 2)).toEqual(['a', 'b']);
      expect(tableSortValue({ v: null }, column, 0, lang)).toBeNull();
    });
  });

  describe('dataIndex', () => {
    it('reads a literal dotted key first', () => {
      const rows = [
        { id: 'b', 'offer.price': 20, offer: { price: 1 } },
        { id: 'a', 'offer.price': 10, offer: { price: 99 } },
      ];
      expect(sorted(rows, col({ key: 'offer.price', dataIndex: 'offer.price' }))).toEqual(['a', 'b']);
    });
    it('reads a dot path when the row has no such key', () => {
      const rows = [
        { id: 'b', offer: { price: 20 } },
        { id: 'a', offer: { price: 10 } },
        { id: 'none', offer: null },
      ];
      expect(sorted(rows, col({ key: 'offer.price', dataIndex: 'offer.price' }))).toEqual(['a', 'b', 'none']);
    });
  });

  describe('render', () => {
    it('sorts on the label render shows, not the id', () => {
      const brands: Record<string, string> = { b1: 'Zeta', b2: 'alpha', b3: 'Mu' };
      const column = col({
        key: 'brandId',
        dataIndex: 'brandId',
        render: (value) => <span>{brands[value as string]}</span>,
      });
      const rows = [{ id: 'b1', brandId: 'b1' }, { id: 'b2', brandId: 'b2' }, { id: 'b3', brandId: 'b3' }];
      expect(sorted(rows, column)).toEqual(['b2', 'b3', 'b1']);
    });
    it('reads text through nested elements, arrays and fragments without mounting components', () => {
      const Mounted = () => {
        throw new Error('rendered');
      };
      const column = col({
        key: 'x',
        dataIndex: 'x',
        render: (value) => (
          <div>
            <>
              {['Prix', ' ']}
              <strong>{value as string}</strong>
            </>
            <Mounted />
          </div>
        ),
      });
      expect(tableSortValue({ x: 'ok' }, column, 0, lang)).toBe('Prix ok');
    });
    it('sorts a computed column (no dataIndex) on its text, a plain number by value', () => {
      const column = col({
        key: 'total',
        render: (_value, row) => <span>{(row.qty as number) * 2}</span>,
      });
      const rows = [{ id: 'a', qty: 50 }, { id: 'b', qty: 4.5 }, { id: 'c', qty: 6 }];
      expect(sorted(rows, column)).toEqual(['b', 'c', 'a']);
      expect(tableSortValue({ qty: 4.5 }, column, 0, lang)).toBe(9);
    });
    it('falls back to the raw value when render shows no text', () => {
      const column = col({ key: 'code', dataIndex: 'code', render: () => <img alt="" /> });
      const rows = [{ id: 'b', code: 'beta' }, { id: 'a', code: 'alpha' }];
      expect(sorted(rows, column)).toEqual(['a', 'b']);
    });
    it('treats a render-only column showing nothing as empty', () => {
      const column = col({ key: 'icon', render: () => null });
      expect(tableSortValue({}, column, 0, lang)).toBeNull();
    });
  });

  describe('formatted numbers in shown text', () => {
    const shown = (text: string) =>
      tableSortValue({}, col({ key: 'x', render: () => <span>{text}</span> }), 0, lang);

    it('parses the UI language separators, NBSP and narrow NBSP groups, currency, percent, unit, sign', () => {
      expect(shown('1 234,50 €')).toBe(1234.5);
      expect(shown('1\u00a0234,50\u00a0€')).toBe(1234.5);
      expect(shown('1\u202f234,50 €')).toBe(1234.5);
      expect(shown('999 €')).toBe(999);
      expect(shown('12 %')).toBe(12);
      expect(shown('1,5 kg')).toBe(1.5);
      expect(shown('-3')).toBe(-3);
      expect(shown('\u22123,5 €')).toBe(-3.5);
      expect(shown('12,50 € TTC')).toBe(12.5);
    });
    it('reads the separators of the language: en', () => {
      lang = 'en';
      expect(shown('$1,234.50')).toBe(1234.5);
      expect(shown('-$12.50')).toBe(-12.5);
      expect(shown('1,234 kg')).toBe(1234);
    });
    it('reads the separators of the language: de (dot groups)', () => {
      lang = 'de';
      expect(shown('1.234,5 €')).toBe(1234.5);
    });
    it('keeps mixed text as text', () => {
      expect(shown('Lot 2 de 3')).toBe('Lot 2 de 3');
      expect(shown('Lot 2')).toBe('Lot 2');
      expect(shown('25 nov. 2026')).toBe('25 nov. 2026');
    });
    it('sorts formatted amounts by value', () => {
      const column = col({ key: 'p', render: (_v, row) => <span>{row.p as string}</span> });
      const rows = [{ id: 'big', p: '1 234,50 €' }, { id: 'small', p: '999 €' }, { id: 'neg', p: '-3 €' }];
      expect(sorted(rows, column)).toEqual(['neg', 'small', 'big']);
    });
  });

  describe('sortableTableColumns', () => {
    const name = col({ key: 'name', dataIndex: 'name' });
    const action = col({ key: 'actions', render: () => <button type="button">Edit</button> });
    const icon = col({ key: 'icon', render: () => <img alt="" /> });
    const same = col({ key: 'same', dataIndex: 'same' });
    const rows = [
      { name: 'b', same: 'Oui' },
      { name: 'a', same: 'oui' },
    ];

    it('keeps columns with 2+ different values, drops all-same and all-empty ones', () => {
      const keys = sortableTableColumns(rows, [name, action, icon, same], true, lang);
      expect([...keys]).toEqual(['name']);
    });
    it('counts empty and filled cells as different', () => {
      const keys = sortableTableColumns([{ name: 'a' }, { name: null }], [name], true, lang);
      expect(keys.has('name')).toBe(true);
    });
    it('has nothing to sort with fewer than 2 rows, an opted-out column or a non-sortable table', () => {
      expect(sortableTableColumns([], [name], true, lang).size).toBe(0);
      expect(sortableTableColumns([rows[0]], [name], true, lang).size).toBe(0);
      expect(sortableTableColumns(rows, [{ ...name, sortable: false }], true, lang).size).toBe(0);
      expect(sortableTableColumns(rows, [name], false, lang).size).toBe(0);
    });
    it('settles differing raw values without calling render', () => {
      let calls = 0;
      const labelled = col({ key: 'name', dataIndex: 'name', render: (v) => { calls++; return String(v); } });
      expect(sortableTableColumns([{ name: 'a' }, { name: 'b' }], [labelled], true, lang).has('name')).toBe(true);
      expect(calls).toBe(0);
    });
    it('compares shown values when the raw values are the same', () => {
      const shown = col({ key: 'name', dataIndex: 'name', render: (_v, row) => String(row.label) });
      expect(sortableTableColumns([{ name: 'x', label: 'A' }, { name: 'x', label: 'B' }], [shown], true, lang).has('name')).toBe(true);
    });
    it('stops reading a column at its first different value', () => {
      let calls = 0;
      const counted = col({ key: 'c', render: (_v, row) => { calls++; return String(row.name); } });
      sortableTableColumns([{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }], [counted], true, lang);
      expect(calls).toBe(2);
    });
  });

  describe('sortValue (framework-internal accessor)', () => {
    // Shown text no number in the UI language (EUR formatted fr-FR, VAT label, discount clue)
    const shown = (value: unknown) => String((value as { label: string }).label);
    const rows: Row[] = [
      { id: 'plain-12.5', price: { label: '12,5 € VAT Incl.' }, shownAmount: 12.5 },
      { id: 'disc-12.19', price: { label: '12,19 € VAT Incl. -15%' }, shownAmount: 12.189 },
      { id: 'plain-11.69', price: { label: '11,69 € VAT Incl.' }, shownAmount: 11.69 },
      { id: 'empty', price: null, shownAmount: null },
    ];
    const priceCol = col({
      key: 'price',
      dataIndex: 'price',
      render: shown,
      sortValue: (row) => row.shownAmount,
    });

    it('sorts on the sortValue, not the rendered text, empty last', () => {
      lang = 'en';
      expect(sorted(rows, priceCol)).toEqual(['plain-11.69', 'disc-12.19', 'plain-12.5', 'empty']);
      expect(sorted(rows, priceCol, 'desc')).toEqual(['plain-12.5', 'disc-12.19', 'plain-11.69', 'empty']);
      expect(tableSortValue(rows[1] as Row, priceCol, 1, lang)).toBe(12.189);
    });

    it('applies the same rules to its result (texts with the collator, ISO dates)', () => {
      const textCol = col({ key: 'a', sortValue: (row) => row.a });
      const texts: Row[] = ['Lot 10', 'lot 2', 'Lot 1'].map((a) => ({ id: a, a }));
      expect(sorted(texts, textCol)).toEqual(['Lot 1', 'lot 2', 'Lot 10']);
      const dates: Row[] = ['2026-03-01', '2025-12-31'].map((a) => ({ id: a, a }));
      expect(sorted(dates, textCol)).toEqual(['2025-12-31', '2026-03-01']);
    });

    it('makes a column sortable on its own; equal sort values give no arrow', () => {
      expect(isTableColumnSortable(col({ key: 'a', sortValue: () => 1 }), true)).toBe(true);
      // Raw values differ, sort values do not: nothing to sort
      const same = col({ key: 'price', dataIndex: 'price', sortValue: () => 5 });
      expect(sortableTableColumns(rows, [same], true, lang).has('price')).toBe(false);
      expect(sortableTableColumns(rows, [priceCol], true, lang).has('price')).toBe(true);
    });

    it('without sortValue, an object value sorts on its shown text (no amount rule)', () => {
      const offers: Row[] = [
        { id: 'x', offer: { label: 'Lot 10', amount: 1 } },
        { id: 'y', offer: { label: 'Lot 2', amount: 3 } },
      ];
      const offerCol = col({ key: 'offer', dataIndex: 'offer', render: shown });
      expect(sorted(offers, offerCol)).toEqual(['y', 'x']);
    });
  });

  it('does not mutate the input', () => {
    const rows = [{ id: 'b', v: 2 }, { id: 'a', v: 1 }];
    sortTableRows(rows, col({ key: 'v', dataIndex: 'v' }), 'asc', lang);
    expect(rows.map((row) => row.id)).toEqual(['b', 'a']);
  });
});
