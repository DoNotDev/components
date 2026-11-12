// packages/components/src/atomic/Table/editing.tsx

/**
 * @fileoverview DataTable cell editing
 * @description Spreadsheet-style editing for DataTable: in-place cell editors,
 * pending changes keyed by row id, keyboard navigation, Excel block paste, undo.
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useRef } from 'react';
import type {
  ClipboardEvent,
  KeyboardEvent,
  ReactElement,
  RefObject,
} from 'react';

/** One choice of a `select` cell editor. */
export interface TableCellOption {
  /** Stored value. */
  value: string;
  /** Displayed label (already translated). */
  label: string;
}

/**
 * How a column's cells are edited when the DataTable is `editable`. Columns
 * without `edit` stay read-only.
 *
 * - `text`: free text; empty = `null`.
 * - `number`: decimal number (`12.5` or `12,5`); empty = `null`.
 * - `select`: one of `options` (enums, references). Pasted text matches an
 *   option's value or label, case-insensitive.
 *
 * A value that does not parse (pasted `abc` in a number column, an unknown
 * option) is kept as typed and its cell is flagged `data-invalid`, so the save
 * fails on it instead of dropping it silently.
 */
export interface TableCellEdit {
  type: 'text' | 'number' | 'select';
  /** Choices of a `select` editor. */
  options?: readonly TableCellOption[];
}

/**
 * Edited values not saved yet: `{ [rowId]: { [columnKey]: value } }`. Only cells
 * that differ from the row hold an entry; a row without changes has no key.
 */
export type TablePendingChanges = Record<string, Record<string, unknown>>;

/** Labels of the bulk edit bar. `{{count}}` is replaced in `selected`. */
export interface DataTableEditLabels {
  /** @default '{{count}} selected' */
  selected?: string;
  /** Field picker. @default 'Field' */
  field?: string;
  /** Value input. @default 'Value' */
  value?: string;
  /** @default 'Apply to selected' */
  apply?: string;
}

/** Defaults of {@link DataTableEditLabels}. */
export const DEFAULT_EDIT_LABELS: Required<DataTableEditLabels> = {
  selected: '{{count}} selected',
  field: 'Field',
  value: 'Value',
  apply: 'Apply to selected',
};

/** Result of parsing typed or pasted text for a cell. */
export interface ParsedCell {
  value: unknown;
  valid: boolean;
}

/**
 * Parses typed or pasted text into a cell value.
 *
 * @example
 * ```ts
 * parseCellText('12,5', { type: 'number' }); // { value: 12.5, valid: true }
 * parseCellText('Rouge', { type: 'select', options: [{ value: 'red', label: 'Rouge' }] });
 * // { value: 'red', valid: true }
 * ```
 */
export function parseCellText(text: string, edit: TableCellEdit): ParsedCell {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null, valid: true };
  if (edit.type === 'number') {
    const n = Number(trimmed.replace(/\s/g, '').replace(',', '.'));
    return Number.isFinite(n)
      ? { value: n, valid: true }
      : { value: trimmed, valid: false };
  }
  if (edit.type === 'select') {
    const needle = trimmed.toLowerCase();
    const match = edit.options?.find(
      (o) =>
        o.value.toLowerCase() === needle || o.label.toLowerCase() === needle
    );
    return match
      ? { value: match.value, valid: true }
      : { value: trimmed, valid: false };
  }
  return { value: text, valid: true };
}

/** Whether a stored value is valid for the editor (see {@link parseCellText}). */
export function isCellValueValid(value: unknown, edit: TableCellEdit): boolean {
  if (value === null || value === undefined || value === '') return true;
  if (edit.type === 'number') return typeof value === 'number';
  if (edit.type === 'select') {
    return Boolean(edit.options?.some((o) => o.value === String(value)));
  }
  return true;
}

/** Text shown in an editor for a stored value. */
export function cellText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

/**
 * Returns `changes` with one cell set. A value equal to the row's own value
 * removes the entry (and the row once it has no entry left).
 */
export function setPendingCell(
  changes: TablePendingChanges,
  rowId: string,
  key: string,
  value: unknown,
  original: unknown
): TablePendingChanges {
  const row = { ...changes[rowId] };
  const same =
    value === original ||
    (cellText(value) === cellText(original) &&
      typeof value === typeof original);
  if (same) delete row[key];
  else row[key] = value;
  const next = { ...changes };
  if (Object.keys(row).length === 0) delete next[rowId];
  else next[rowId] = row;
  return next;
}

/**
 * Splits clipboard text copied from a spreadsheet into rows of cells, or
 * returns `null` for a single value (left to the input's own paste).
 */
export function parseClipboardGrid(text: string): string[][] | null {
  const normalized = text.replace(/\r\n?/g, '\n').replace(/\n$/, '');
  if (!normalized.includes('\t') && !normalized.includes('\n')) return null;
  return normalized.split('\n').map((line) => line.split('\t'));
}

/** Position of an editor in the visible grid. */
export interface CellPosition {
  row: number;
  col: number;
}

/** Callbacks an editor needs from the table. */
export interface EditCellHandlers {
  /** Store the editor's value. */
  commit: (value: unknown) => void;
  /** Move focus to another editor (rows: visible rows, cols: editable columns). */
  focusCell: (position: CellPosition) => void;
  /** Spreadsheet paste starting at this cell. */
  pasteGrid: (grid: string[][]) => void;
  /** Undo the last change. Returns whether there was one. */
  undo: () => boolean;
}

/** Props of {@link EditCell}. */
export interface EditCellProps extends EditCellHandlers {
  edit: TableCellEdit;
  /** Current value (pending or saved). */
  value: unknown;
  position: CellPosition;
  /** Accessible name, e.g. the column title. */
  label: string;
}

/**
 * In-place cell editor. Uncontrolled: the DOM holds the text while typing; the
 * value is stored on blur / Enter (`select`: on change). Keys: Enter / ArrowDown
 * next row, ArrowUp previous row, Tab native, Esc restores the stored value,
 * Ctrl/Cmd+Z undoes the last stored change once nothing is being typed.
 */
export function EditCell({
  edit,
  value,
  position,
  label,
  commit,
  focusCell,
  pasteGrid,
  undo,
}: EditCellProps): ReactElement {
  const ref = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const stored = cellText(value);
  const invalid = !isCellValueValid(value, edit);

  // Paste, bulk apply and undo change the stored value from outside: sync the DOM
  useEffect(() => {
    if (ref.current && ref.current.value !== stored) {
      ref.current.value = stored;
    }
  }, [stored]);

  const store = (text: string) => {
    if (text === stored) return;
    commit(parseCellText(text, edit).value);
  };

  const onKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.currentTarget;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (target.value === stored && undo()) e.preventDefault();
      return;
    }
    if (e.key === 'Escape') {
      target.value = stored;
      return;
    }
    const isSelect = edit.type === 'select';
    if (e.key === 'Enter' || (!isSelect && e.key === 'ArrowDown')) {
      e.preventDefault();
      store(target.value);
      focusCell({
        row: position.row + (e.shiftKey ? -1 : 1),
        col: position.col,
      });
      return;
    }
    if (!isSelect && e.key === 'ArrowUp') {
      e.preventDefault();
      store(target.value);
      focusCell({ row: position.row - 1, col: position.col });
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    const grid = parseClipboardGrid(e.clipboardData.getData('text/plain'));
    if (!grid) return;
    e.preventDefault();
    pasteGrid(grid);
  };

  const common = {
    className: 'dndev-table-cell-editor',
    'aria-label': label,
    'aria-invalid': invalid || undefined,
    'data-edit-row': position.row,
    'data-edit-col': position.col,
    onKeyDown,
    onPaste,
  };

  if (edit.type === 'select') {
    const known = edit.options?.some((o) => o.value === stored);
    return (
      <select
        ref={ref}
        {...common}
        defaultValue={stored}
        onChange={(e) => store(e.target.value)}
      >
        <option value="" />
        {!known && stored !== '' && <option value={stored}>{stored}</option>}
        {edit.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={ref}
      {...common}
      type="text"
      inputMode={edit.type === 'number' ? 'decimal' : undefined}
      defaultValue={stored}
      onBlur={(e) => store(e.target.value)}
    />
  );
}

/** Focuses the editor at `position` inside `container`, if it exists. */
export function focusEditor(
  container: RefObject<HTMLElement | null>,
  position: CellPosition
): void {
  const el = container.current?.querySelector<HTMLElement>(
    `[data-edit-row="${position.row}"][data-edit-col="${position.col}"]`
  );
  el?.focus();
  if (el instanceof HTMLInputElement) el.select();
}
