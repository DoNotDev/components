// packages/components/src/utils/tableSort.ts

/**
 * @fileoverview Table sorting
 * @description The one sort of `DataTable` (web and `@donotdev/expo`): every
 * column sorts on what its cells show, in the UI language the caller passes (the
 * i18n language: `useComponentLocale().language` on the web). Pure logic: no DOM,
 * no `navigator`, same result on the server and the client (SSR / React Native safe).
 *
 * @version 0.1.0
 * @since 0.3.8
 * @author AMBROISE PARK Consulting
 */

import { isValidElement, type ReactNode } from 'react';

/** Sort direction of a table column. */
export type TableSortDirection = 'asc' | 'desc';

/**
 * Sort value of a cell: a number (numbers, booleans, dates, numeric text) or a
 * text, `null` when the cell is empty (always sorted last).
 */
export type TableSortValue = number | string | null;

/**
 * The column fields the sort reads. `TableColumn` of `@donotdev/components`
 * and of `@donotdev/expo` both satisfy it.
 */
export interface TableSortColumn<T> {
  key: string;
  dataIndex?: keyof T;
  sortable?: boolean;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /** Sort value of a row, used instead of the derived one (framework-internal: field-typed lists). */
  sortValue?: (row: T) => unknown;
}

/** A plain number: `12`, `-3.5`, `1e3` (not `0x1f`, not `1 234`). */
const NUMERIC = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;
/** ISO 8601 date or date-time, as databases return them. */
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/i;
/** Text that shows something (a letter or a digit), not only a dash or spaces. */
const HAS_CONTENT = /[\p{L}\p{N}]/u;

/**
 * Whether a column sorts: the table sorts (`sortable`, default on), the column
 * did not opt out (`sortable: false`) and it shows something to sort on
 * (`dataIndex`, `render` or `sortValue`).
 *
 * @param column - Column definition
 * @param tableSortable - The table's `sortable` prop
 * @returns True when the column header sorts the rows
 */
export function isTableColumnSortable<T>(
  column: TableSortColumn<T>,
  tableSortable: boolean
): boolean {
  return (
    tableSortable &&
    column.sortable !== false &&
    (column.dataIndex !== undefined ||
      column.render !== undefined ||
      column.sortValue !== undefined)
  );
}

/** `row[dataIndex]` (literal key first, then dot path), else `row[key]`. */
function rawValue<T>(row: T, column: TableSortColumn<T>): unknown {
  const record = row as Record<string, unknown>;
  const path =
    column.dataIndex !== undefined ? String(column.dataIndex) : column.key;
  if (path in record) return record[path];
  return path
    .split('.')
    .reduce<unknown>(
      (value, part) =>
        value !== null && typeof value === 'object'
          ? (value as Record<string, unknown>)[part]
          : undefined,
      record
    );
}

/** Text of a rendered cell: string / number children of the element tree (nothing is mounted). */
function collectText(node: ReactNode, parts: string[]): void {
  if (typeof node === 'string') parts.push(node);
  else if (typeof node === 'number' || typeof node === 'bigint')
    parts.push(String(node));
  else if (Array.isArray(node))
    for (const child of node) collectText(child as ReactNode, parts);
  else if (isValidElement<{ children?: ReactNode }>(node))
    collectText(node.props.children, parts);
}

/** Number of a value that is one (number, boolean, Date, numeric or ISO date text), else undefined. */
function numberOf(value: unknown): number | null | undefined {
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === 'string') {
    const text = value.trim();
    if (NUMERIC.test(text)) return Number(text);
    if (ISO_DATE.test(text)) {
      const time = Date.parse(text);
      if (!Number.isNaN(time)) return time;
    }
  }
  return undefined;
}

/** Text of a raw value as the table shows it without `render`. */
function textOf(value: unknown): string | null {
  const text = Array.isArray(value)
    ? value.join(', ')
    : value !== null && typeof value === 'object'
      ? ''
      : String(value ?? '');
  return HAS_CONTENT.test(text) ? text.trim() : null;
}

/** {@link numberPattern} per language (built once: `Intl.NumberFormat` is costly). */
const NUMBER_PATTERNS = new Map<string, RegExp>();

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

/**
 * Pattern of one number formatted in `lang` (`Intl.NumberFormat(lang)`
 * separators; a space-like group separator, as in French, matches any space:
 * space, NBSP, narrow NBSP), with an optional leading sign / currency and an
 * optional trailing currency / percent / unit word. No other digit.
 */
function numberPattern(lang: string): RegExp {
  const cached = NUMBER_PATTERNS.get(lang);
  if (cached) return cached;
  const parts = new Intl.NumberFormat(lang).formatToParts(1234567.5);
  const group = parts.find((part) => part.type === 'group')?.value ?? '';
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const groupPattern = /\s/.test(group) ? '\\s' : escapeRegExp(group);
  const integer = group
    ? `\\d{1,3}(?:${groupPattern}\\d{3})+|\\d+`
    : '\\d+';
  const pattern = new RegExp(
    `^([\\p{Sc}\\s+\\-\\u2212]*)(${integer})(?:${escapeRegExp(decimal)}(\\d+))?([\\s\\p{Sc}\\p{L}%\\u2030./°²³]*)$`,
    'u'
  );
  NUMBER_PATTERNS.set(lang, pattern);
  return pattern;
}

/**
 * Number of a text that is one locale-formatted number (`1 234,50 €`, `12 %`,
 * `1,5 kg`, `-3`, `$1,234.50`), else undefined (`Lot 2 de 3`, `Lot 2`).
 */
function formattedNumber(text: string, lang: string): number | undefined {
  const match = numberPattern(lang).exec(text);
  if (!match) return undefined;
  const [, prefix = '', integer = '', fraction] = match;
  const value = Number(
    `${integer.replace(/\D/g, '')}${fraction ? `.${fraction}` : ''}`
  );
  return /[-−]/.test(prefix) ? -value : value;
}

/** Sort value of a shown text: its number when it is one number (locale-formatted or plain), else the text. */
function textValue(text: string, lang: string): number | string {
  const value = formattedNumber(text, lang);
  if (value !== undefined) return value;
  return NUMERIC.test(text) ? Number(text) : text;
}

/** {@link tableSortValue} in a given language. */
function sortValueIn<T>(
  row: T,
  column: TableSortColumn<T>,
  index: number,
  lang: string
): TableSortValue {
  // An explicit sort value goes through the same rules as a raw value
  if (column.sortValue) {
    const value = column.sortValue(row);
    const number = numberOf(value);
    if (number !== undefined) return number;
    const text = textOf(value);
    return text === null ? null : textValue(text, lang);
  }
  const raw = rawValue(row, column);
  const rawText = textOf(raw);
  if (
    column.dataIndex !== undefined &&
    rawText === null &&
    (raw === null || raw === undefined || typeof raw === 'string')
  ) {
    return null;
  }
  const rawNumber = numberOf(raw);
  if (rawNumber !== undefined) return rawNumber;
  if (column.render) {
    const parts: string[] = [];
    const cellValue =
      column.dataIndex !== undefined
        ? (row as Record<string, unknown>)[String(column.dataIndex)]
        : null;
    collectText(column.render(cellValue, row, index), parts);
    const shown = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (HAS_CONTENT.test(shown)) return textValue(shown, lang);
  }
  return rawText === null ? null : textValue(rawText, lang);
}

/** Text comparison of the table: case and accents ignored, digit runs numeric. */
const collatorOf = (lang: string) =>
  new Intl.Collator(lang, { numeric: true, sensitivity: 'base' });

/**
 * Sort value of a cell, derived from the column (no sort config):
 * - the column's `sortValue(row)` when set (framework-internal: EntityList's price
 *   columns, the discounted price the cell shows), read with the rules below
 *   (number / date / numeric text by value, other text as text, empty `null`);
 * - empty raw value (`null`, `undefined`, blank) of a `dataIndex` column: `null`;
 * - number, boolean, Date, numeric or ISO date text: that number (numeric /
 *   chronological, whatever `render` formats it as);
 * - otherwise the text `render` shows (reference labels, translated enums);
 *   a text that is one number, formatted in `lang` with an optional
 *   sign, currency, percent or unit (`1 234,50 €`, `12 %`, `1,5 kg`), is that
 *   number; the raw value when `render` shows no text.
 *
 * @param row - The row
 * @param column - Its column
 * @param index - Row index, passed to `render`
 * @param lang - UI language (BCP 47) the cells are formatted in
 * @returns The cell's sort value, `null` when empty
 */
export function tableSortValue<T>(
  row: T,
  column: TableSortColumn<T>,
  index: number,
  lang: string
): TableSortValue {
  return sortValueIn(row, column, index, lang);
}

/**
 * Plain raw value of a `dataIndex` cell, compared without calling `render`:
 * `null` when empty, a string / number / boolean (Date: its time); undefined
 * when the raw value is an object (only the shown value tells).
 */
function plainRaw<T>(row: T, column: TableSortColumn<T>): string | number | boolean | null | undefined {
  const raw = rawValue(row, column);
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') return HAS_CONTENT.test(raw) ? raw.trim() : null;
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw;
  if (typeof raw === 'boolean') return raw;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.getTime();
  return undefined;
}

/** Whether a `dataIndex` column's plain raw values already differ (no `render` call; texts compared as the sort does). */
function rawValuesDiffer<T>(
  rows: readonly T[],
  column: TableSortColumn<T>,
  collator: Intl.Collator
): boolean {
  if (column.dataIndex === undefined || column.sortValue) return false;
  const first = plainRaw(rows[0] as T, column);
  if (first === undefined) return false;
  for (let index = 1; index < rows.length; index++) {
    const value = plainRaw(rows[index] as T, column);
    if (value === undefined) return false;
    const same =
      typeof value === 'string' && typeof first === 'string'
        ? collator.compare(value, first) === 0
        : value === first;
    if (!same) return true;
  }
  return false;
}

/**
 * Keys of the columns that sort over these rows: {@link isTableColumnSortable}
 * and something to sort: at least two different cells. A column whose cells
 * are all empty or all the same (equal as the sort compares them: an action
 * column with one button label, icon-only cells) has nothing to sort: no sort
 * affordance. Fewer than 2 rows: none. Cheap: plain raw values that differ
 * settle it without calling `render`; otherwise the sort values are compared,
 * up to the first different one.
 *
 * @param rows - The table's rows
 * @param columns - Its columns
 * @param tableSortable - The table's `sortable` prop
 * @param lang - UI language (BCP 47): text comparison and formatted numbers
 * @returns Keys of the sortable columns
 */
export function sortableTableColumns<T>(
  rows: readonly T[],
  columns: readonly TableSortColumn<T>[],
  tableSortable: boolean,
  lang: string
): Set<string> {
  const keys = new Set<string>();
  if (rows.length < 2) return keys;
  const collator = collatorOf(lang);
  for (const column of columns) {
    if (!isTableColumnSortable(column, tableSortable)) continue;
    if (rawValuesDiffer(rows, column, collator)) {
      keys.add(column.key);
      continue;
    }
    const first = sortValueIn(rows[0] as T, column, 0, lang);
    for (let index = 1; index < rows.length; index++) {
      const value = sortValueIn(rows[index] as T, column, index, lang);
      const same =
        value === null || first === null || typeof value !== typeof first
          ? value === first
          : typeof value === 'string'
            ? collator.compare(value, first as string) === 0
            : value === first;
      if (!same) {
        keys.add(column.key);
        break;
      }
    }
  }
  return keys;
}

/**
 * Rows sorted on one column (new array; the input is not mutated).
 * Numbers before texts; texts compared in `lang`
 * (`Intl.Collator`, numeric, case and accents ignored: "é" = "e", "a2" < "a10");
 * empty cells last in both directions; equal cells keep their order (stable).
 *
 * @param rows - Rows to sort
 * @param column - The sort column
 * @param direction - `asc` or `desc`
 * @param lang - UI language (BCP 47): text comparison and formatted numbers
 * @returns The sorted rows
 */
export function sortTableRows<T>(
  rows: readonly T[],
  column: TableSortColumn<T>,
  direction: TableSortDirection,
  lang: string
): T[] {
  const collator = collatorOf(lang);
  const sign = direction === 'asc' ? 1 : -1;
  const compare = (a: number | string, b: number | string): number => {
    if (typeof a === 'number' && typeof b === 'number') {
      return a < b ? -1 : a > b ? 1 : 0;
    }
    if (typeof a === 'number') return -1;
    if (typeof b === 'number') return 1;
    return collator.compare(a, b);
  };
  return rows
    .map((row, index) => ({ row, value: sortValueIn(row, column, index, lang) }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        return a.value === b.value ? 0 : a.value === null ? 1 : -1;
      }
      return sign * compare(a.value, b.value);
    })
    .map(({ row }) => row);
}
