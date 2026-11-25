'use client';
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

import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type {
  ClipboardEvent,
  KeyboardEvent,
  ReactElement,
  ReactNode,
  RefObject,
} from 'react';

import {
  isoToZonedWallTime,
  toZonedCalendarDate,
  zonedWallTimeToISO,
} from '../../utils/date';
import DatePicker from '../DatePicker';
import DateTimePicker from '../DateTimePicker';

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
 * - `date`: a calendar date `YYYY-MM-DD` (DatePicker). A stored instant is edited as
 *   its day in `timeZone`. Pasted `2026-11-24`, `24/11/2026` or `24.11.2026`.
 * - `datetime`: an instant, stored as UTC ISO (`toISOString()`), edited as its wall
 *   time in `timeZone` (DateTimePicker). Pasted `2026-11-24 14:30`,
 *   `24/11/2026 14:30` (wall time in `timeZone`) or an ISO instant with `Z` / offset.
 *
 * A value that does not parse (pasted `abc` in a number column, an unknown
 * option, `32/13/2026` in a date column) is kept as typed and its cell is flagged
 * `data-invalid`, so the save fails on it instead of dropping it silently.
 */
export interface TableCellEdit {
  type: 'text' | 'number' | 'select' | 'date' | 'datetime';
  /** Choices of a `select` editor. */
  options?: readonly TableCellOption[];
  /**
   * `date` / `datetime` (required there): the app's time zone, IANA (`getAppTimeZone()`
   * of `@donotdev/core`; crud's `cellEditFor` sets it). Wall times are read and picked
   * in it, whatever the browser's zone.
   * @since 0.3.8
   */
  timeZone?: string;
}

/** The zone of a `date` / `datetime` editor (fail loud: never the browser's zone). */
function editTimeZone(edit: TableCellEdit): string {
  if (!edit.timeZone) {
    throw new Error(
      `DataTable: a "${edit.type}" cell editor needs edit.timeZone (the app's IANA time zone, getAppTimeZone()).`
    );
  }
  return edit.timeZone;
}

/** Whether a date editor type. */
function isDateEdit(edit: TableCellEdit): boolean {
  return edit.type === 'date' || edit.type === 'datetime';
}

/** Days in a month (1-12) of a year. */
function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Wall date (and time) of typed or pasted text: `YYYY-MM-DD[ HH:MM]` (`T` or a space),
 * `DD/MM/YYYY[ HH:MM]` (`/`, `.` or `-`). `null` when it does not read as one, or the
 * day does not exist.
 */
function parseWallText(
  text: string
): { date: string; time: string | null } | null {
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{2}))?$/);
  const eu = text.match(
    /^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})(?:\s+(\d{1,2})[:h](\d{2}))?$/
  );
  const parts = iso
    ? { y: iso[1], m: iso[2], d: iso[3], h: iso[4], mi: iso[5] }
    : eu
      ? { y: eu[3], m: eu[2], d: eu[1], h: eu[4], mi: eu[5] }
      : null;
  if (!parts) return null;
  const year = Number(parts.y);
  const month = Number(parts.m);
  const day = Number(parts.d);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${parts.y}-${pad(month)}-${pad(day)}`;
  if (parts.h === undefined || parts.mi === undefined) return { date, time: null };
  const hour = Number(parts.h);
  const minute = Number(parts.mi);
  if (hour > 23 || minute > 59) return null;
  return { date, time: `${pad(hour)}:${pad(minute)}` };
}

/** An ISO instant with its zone (`Z` or an offset): absolute, no wall time to read. */
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i;

/** Parses typed or pasted text of a `date` / `datetime` cell (see {@link TableCellEdit}). */
function parseDateCellText(trimmed: string, edit: TableCellEdit): ParsedCell {
  const timeZone = editTimeZone(edit);
  const invalid = { value: trimmed, valid: false };
  if (ISO_INSTANT.test(trimmed)) {
    const instant = new Date(trimmed);
    if (isNaN(instant.getTime())) return invalid;
    return edit.type === 'date'
      ? { value: toZonedCalendarDate(trimmed, timeZone), valid: true }
      : { value: instant.toISOString(), valid: true };
  }
  const wall = parseWallText(trimmed);
  if (!wall) return invalid;
  if (edit.type === 'date') return { value: wall.date, valid: true };
  const iso = zonedWallTimeToISO(
    `${wall.date}T${wall.time ?? '00:00'}`,
    timeZone
  );
  return iso === null ? invalid : { value: iso, valid: true };
}

/** Same date value: same instant (or the same day), whatever its text form. */
function sameDateValue(a: unknown, b: unknown): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return a === b;
  const ta = Date.parse(a);
  const tb = Date.parse(b);
  return !isNaN(ta) && ta === tb;
}

/**
 * Edited values not saved yet: `{ [rowId]: { [columnKey]: value } }`. Only cells
 * that differ from the row hold an entry; a row without changes has no key.
 */
export type TablePendingChanges = Record<string, Record<string, unknown>>;

/**
 * Labels of the selection bar (bulk edit), each overriding its `dndev` default
 * ({@link EDIT_LABEL_KEYS}, ComponentLocaleProvider). `{{count}}` is replaced in `selected`.
 */
export interface DataTableEditLabels {
  /** @default `dndev` key `table.selected` ("{{count}} selected") */
  selected?: string;
  /** Field picker. @default `dndev` key `table.field` */
  field?: string;
  /** Value input. @default `dndev` key `table.value` */
  value?: string;
  /** @default `dndev` key `table.apply` ("Apply to selected") */
  apply?: string;
  /** Button that unchecks every row (selection bar). @default `dndev` key `table.clearSelection` */
  clear?: string;
}

/** `dndev` namespace keys of the {@link DataTableEditLabels} defaults. */
export const EDIT_LABEL_KEYS: Record<keyof DataTableEditLabels, string> = {
  selected: 'table.selected',
  field: 'table.field',
  value: 'table.value',
  apply: 'table.apply',
  clear: 'table.clearSelection',
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
 * parseCellText('25/11/2026 00:30', { type: 'datetime', timeZone: 'Europe/Paris' });
 * // { value: '2026-11-24T23:30:00.000Z', valid: true }
 * ```
 */
export function parseCellText(text: string, edit: TableCellEdit): ParsedCell {
  const trimmed = text.trim();
  if (trimmed === '') return { value: null, valid: true };
  if (isDateEdit(edit)) return parseDateCellText(trimmed, edit);
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
  if (isDateEdit(edit)) {
    return typeof value === 'string' && !isNaN(Date.parse(value));
  }
  return true;
}

/** Text shown in an editor for a stored value. */
export function cellText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

/** `Intl.NumberFormat` per language (built once per language: construction is costly). */
const NUMBER_FORMATS = new Map<string, Intl.NumberFormat>();

/**
 * A number cell's value as it reads in `lang` (`Intl.NumberFormat`: `29,9` and
 * `1 234,5` in French, `29.9` in English). The editor keeps the stored text.
 *
 * @example
 * ```ts
 * formatCellNumber(29.9, 'fr'); // '29,9'
 * ```
 */
export function formatCellNumber(value: number, lang: string): string {
  let format = NUMBER_FORMATS.get(lang);
  if (!format) {
    format = new Intl.NumberFormat(lang);
    NUMBER_FORMATS.set(lang, format);
  }
  return format.format(value);
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
  /**
   * What the cell shows while it is not being edited: the column's formatted
   * value (`render`), or the option label / text of the value.
   */
  display: ReactNode;
  position: CellPosition;
  /**
   * Accessible name, e.g. the column title: of the editor and of the focusable
   * text shown before it (same role as the editor: `textbox`, `select` → `combobox`).
   */
  label: string;
  /** Message of a rule the value breaks (`DataTable` `cellErrors`): marks it invalid. */
  error?: string;
}

/** A key that types a character (opens the editor with it, like a spreadsheet). */
function isTypingKey(e: KeyboardEvent<HTMLElement>): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}

/**
 * Spreadsheet cell: shows the formatted value as text and swaps to its editor
 * (text input, or a native select) when focused (click, Tab, or the
 * keyboard moves of a neighbour editor); the editor sits where the text was,
 * so nothing shifts. Uncontrolled: the DOM holds the text while typing; the
 * value is stored on blur / Enter (`select`: on change). Editor keys: Enter /
 * ArrowDown next row, ArrowUp previous row (Shift+Enter previous row), Tab
 * native, Esc restores the stored value and leaves the editor (the cell stays
 * focused: typing a character, Enter or F2 edits it again), Ctrl/Cmd+Z undoes
 * the last stored change once nothing is being typed. A spreadsheet block
 * pasted in the cell (editor or focused text) fills the cells from there.
 * `date` / `datetime` cells edit with the DatePicker / DateTimePicker (segments and
 * calendar, wall time in `edit.timeZone`): each complete value is stored at once,
 * Enter / Shift+Enter move a row, Esc closes, Ctrl/Cmd+Z undoes, ArrowUp / ArrowDown
 * change the focused segment; leaving the picker and its calendar closes the editor.
 */
export function EditCell({
  edit,
  value,
  display,
  position,
  label,
  error,
  commit,
  focusCell,
  pasteGrid,
  undo,
}: EditCellProps): ReactElement {
  const ref = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  /** `date` / `datetime`: the picker's wrapper (the editor's grid position). */
  const dateRef = useRef<HTMLSpanElement>(null);
  const errorId = useId();
  const stored = cellText(value);
  const invalid = !isCellValueValid(value, edit) || !!error;
  const [editing, setEditing] = useState(false);
  /** Character typed on the focused text: the editor opens with it instead of the value. */
  const typedRef = useRef<string | null>(null);
  /** Opened by a pointer: a select opens its list at once (one click, not two). */
  const pointerRef = useRef(false);
  /** Esc gave focus back to the text: that focus must not reopen the editor. */
  const keepClosedRef = useRef(false);
  /** Last text this cell stored: blur after Enter does not store it twice (one undo step). */
  const committedRef = useRef(stored);

  useEffect(() => {
    committedRef.current = stored;
  }, [stored]);

  // Paste, bulk apply and undo change the stored value from outside: sync the DOM
  useEffect(() => {
    if (ref.current && ref.current.value !== stored) {
      ref.current.value = stored;
    }
  }, [stored]);

  // Editor opened: focus it (text selected, or the caret after a typed character);
  // closed by Esc: focus back on the text.
  useEffect(() => {
    if (!editing) {
      if (keepClosedRef.current) displayRef.current?.focus();
      return;
    }
    // Date picker: its first visible control (segments; the native input on phones)
    if (dateRef.current) {
      const controls = dateRef.current.querySelectorAll<HTMLElement>(
        '[role="spinbutton"], input:not([type="hidden"])'
      );
      const first = Array.from(controls).find((c) => c.offsetParent !== null);
      (first ?? controls[0])?.focus();
      pointerRef.current = false;
      return;
    }
    // Widened: the ref holds an input or a select (narrowed below)
    const el: HTMLElement | null = ref.current;
    if (!el) return;
    const typed = typedRef.current;
    typedRef.current = null;
    el.focus();
    if (el instanceof HTMLInputElement) {
      if (typed === null) el.select();
      else {
        el.value = typed;
        el.setSelectionRange(typed.length, typed.length);
      }
    } else if (
      pointerRef.current &&
      el instanceof HTMLSelectElement &&
      'showPicker' in el
    ) {
      // why: showPicker throws without a user activation (e.g. cross-origin iframe); the select stays focused
      try {
        el.showPicker();
      } catch {
        /* the focused select opens on the next click or Alt+ArrowDown */
      }
    }
    pointerRef.current = false;
  }, [editing]);

  const store = (text: string) => {
    if (text === stored || text === committedRef.current) return;
    committedRef.current = text;
    commit(parseCellText(text, edit).value);
  };

  const open = () => {
    keepClosedRef.current = false;
    setEditing(true);
  };

  const onPaste = (e: ClipboardEvent<HTMLElement>) => {
    const text = e.clipboardData.getData('text/plain');
    const grid = parseClipboardGrid(text);
    if (grid) {
      e.preventDefault();
      pasteGrid(grid);
      return;
    }
    // A single value on the focused text replaces the value (the editor's own paste otherwise)
    if (!editing) {
      e.preventDefault();
      store(text);
    }
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
      keepClosedRef.current = true;
      setEditing(false);
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

  // Focused text (after Esc): typing, Enter or F2 edits; arrows move; Ctrl/Cmd+Z undoes.
  const onDisplayKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (undo()) e.preventDefault();
      return;
    }
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      open();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell({
        row: position.row + (e.key === 'ArrowDown' ? 1 : -1),
        col: position.col,
      });
      return;
    }
    if (isTypingKey(e)) {
      e.preventDefault();
      if (edit.type !== 'select' && !isDateEdit(edit)) typedRef.current = e.key;
      open();
    }
  };

  const message = error ? (
    <span id={errorId} className="dndev-table-cell-error">
      {error}
    </span>
  ) : null;

  const cellPosition = {
    'data-edit-row': position.row,
    'data-edit-col': position.col,
  };

  if (!editing) {
    return (
      <>
        <div
          ref={displayRef}
          tabIndex={0}
          className="dndev-table-cell-display"
          data-edit-type={edit.type}
          // Same role and name as its editor: a screen reader hears the column
          // ("Price, edit text, 29.9"), not an anonymous focus stop
          role={edit.type === 'select' ? 'combobox' : 'textbox'}
          aria-expanded={edit.type === 'select' ? false : undefined}
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? errorId : undefined}
          {...cellPosition}
          onPointerDown={() => {
            pointerRef.current = true;
          }}
          onFocus={() => {
            if (keepClosedRef.current) {
              keepClosedRef.current = false;
              return;
            }
            setEditing(true);
          }}
          onKeyDown={onDisplayKeyDown}
          onPaste={onPaste}
        >
          <span className="dndev-table-cell-text">{display}</span>
          {edit.type === 'select' && (
            <ChevronDown className="dndev-table-cell-chevron" aria-hidden="true" />
          )}
        </div>
        {message}
      </>
    );
  }

  const common = {
    className: 'dndev-table-cell-editor',
    'aria-label': label,
    'aria-invalid': invalid || undefined,
    'aria-describedby': error ? errorId : undefined,
    ...cellPosition,
    onKeyDown,
    onPaste,
  };

  if (isDateEdit(edit)) {
    const timeZone = editTimeZone(edit);
    const isDate = edit.type === 'date';
    // Picker value: a calendar date / a wall time in the app's zone ('' = none or invalid)
    const picked =
      typeof value === 'string' && value !== ''
        ? isDate
          ? toZonedCalendarDate(value, timeZone)
          : isoToZonedWallTime(value, timeZone)
        : '';
    // Each complete value the picker emits is stored (one undo step each)
    const onPick = (next: string | null) => {
      const nextValue =
        next === null
          ? null
          : isDate
            ? next
            : zonedWallTimeToISO(next, timeZone);
      if (sameDateValue(nextValue, value ?? null)) return;
      committedRef.current = cellText(nextValue);
      commit(nextValue);
    };
    // Focus left the picker and its calendar popover (portaled): close the editor.
    // Checked once focus settled: a calendar day click moves it through <body>.
    const onBlur = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (dateRef.current?.contains(active)) return;
        if (active?.closest('.dndev-datepicker-popover')) return;
        setEditing(false);
      }, 0);
    };
    const onDateKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
      // Keys of the calendar popover (portaled, a React child) are its own
      if (!dateRef.current?.contains(e.target as Node)) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (undo()) e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        keepClosedRef.current = true;
        setEditing(false);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        focusCell({
          row: position.row + (e.shiftKey ? -1 : 1),
          col: position.col,
        });
      }
    };
    // A spreadsheet block fills the cells from here; one value: the picker's own paste
    const onDatePaste = (e: ClipboardEvent<HTMLSpanElement>) => {
      const grid = parseClipboardGrid(e.clipboardData.getData('text/plain'));
      if (!grid) return;
      e.preventDefault();
      e.stopPropagation();
      pasteGrid(grid);
    };
    const pickerProps = {
      value: picked === '' ? null : picked,
      onChange: onPick,
      'aria-invalid': invalid || undefined,
      'aria-describedby': error ? errorId : undefined,
    };
    return (
      <>
        <span
          ref={dateRef}
          className="dndev-table-cell-date"
          role="group"
          aria-label={label}
          tabIndex={-1}
          {...cellPosition}
          onKeyDown={onDateKeyDown}
          onBlur={onBlur}
          onPasteCapture={onDatePaste}
        >
          {isDate ? (
            <DatePicker {...pickerProps} />
          ) : (
            <DateTimePicker {...pickerProps} />
          )}
        </span>
        {message}
      </>
    );
  }

  if (edit.type === 'select') {
    const known = edit.options?.some((o) => o.value === stored);
    return (
      <>
        <span className="dndev-table-cell-select">
          <select
            ref={ref}
            {...common}
            defaultValue={stored}
            onChange={(e) => store(e.target.value)}
            onBlur={() => setEditing(false)}
          >
            <option value="" />
            {!known && stored !== '' && <option value={stored}>{stored}</option>}
            {edit.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="dndev-table-cell-chevron" aria-hidden="true" />
        </span>
        {message}
      </>
    );
  }

  return (
    <>
      <input
        ref={ref}
        {...common}
        type="text"
        inputMode={edit.type === 'number' ? 'decimal' : undefined}
        defaultValue={stored}
        onBlur={(e) => {
          store(e.target.value);
          setEditing(false);
        }}
      />
      {message}
    </>
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
