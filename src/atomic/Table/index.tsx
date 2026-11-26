'use client';
// packages/components/src/atomic/Table/index.tsx

/**
 * @fileoverview Table component
 * @description Enhanced table with sorting, filtering, selection, and export
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  ArrowUpRight,
  ChevronUp,
  CircleAlert,
  ChevronDown,
  Search,
  Download,
  X,
} from 'lucide-react';
import {
  useState,
  useMemo,
  useRef,
  type ReactNode,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type PointerEvent,
} from 'react';

import { cn } from '../../utils/helpers';
import { useLinkRenderer } from '../../utils/linkComponent';
import { sortableTableColumns, sortTableRows } from '../../utils/tableSort';
import { componentLabel, useComponentLocale } from '../../utils/translator';
import ActionBar from '../ActionBar';
import Button from '../Button';
import Checkbox from '../Checkbox';
import DatePicker from '../DatePicker';
import DateTimePicker from '../DateTimePicker';
import Input from '../Input';
import Pagination, { DEFAULT_TABLE_PAGE_SIZE } from '../Pagination';
import Popover from '../Popover';
import Select from '../Select';
import Stack from '../Stack';
import Text from '../Text';
import Tooltip from '../Tooltip';
import {
  EDIT_LABEL_KEYS,
  EditCell,
  cellText,
  focusEditor,
  formatCellNumber,
  isCellValueValid,
  isCoarsePointer,
  parseCellText,
  setPendingCell,
} from './editing';
import type {
  CellPosition,
  DataTableEditLabels,
  TableCellEdit,
  TablePendingChanges,
} from './editing';
import './Table.css';

export { parseCellText, parseClipboardGrid, setPendingCell } from './editing';
export type {
  DataTableEditLabels,
  TableCellEdit,
  TableCellOption,
  TablePendingChanges,
} from './editing';

/**
 * Table column configuration
 *
 * LAYOUT EXCEPTIONS:
 * - `width`: Layout control for structural column layout (not styling)
 * - `render`: Render prop pattern for custom cell content (modern children pattern)
 *   This is the preferred way to handle dynamic cell content vs nested component composition.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface TableColumn<T = unknown> {
  key: string;
  /** Column header - can be a string or ReactNode (e.g., Button, icon) */
  title: string | ReactNode;
  /** Row field shown in the cell. Sorting reads a dotted key (`'offer.price'`) as is when the row has it, else as a path. */
  dataIndex?: keyof T;
  /**
   * Sorting is on by default: a column with `dataIndex` or `render` sorts on
   * what its cells show, in the UI language (the i18n language): numbers, dates
   * and booleans by value, other cells by the text `render` shows (a reference
   * label, a translated enum; a formatted number such as `1 234,50 €` by
   * value), case and accents ignored; empty cells last. A column whose cells
   * are all empty or all the same over the data (an action column, icon-only
   * cells) has nothing to sort: no arrow, header click inert. `false` opts
   * this column out. See `sortTableRows`, `sortableTableColumns`.
   * @default true
   */
  sortable?: boolean;
  /**
   * Sort value of a row in this column, used instead of the value derived from
   * `dataIndex` / `render`; it goes through the same comparison (numbers, dates,
   * texts with the collator, empty last). Framework-internal for field-typed lists
   * (EntityList sets it for price fields: the discounted price the cell shows).
   * Apps normally don't need it: put the shown value in the row instead.
   */
  sortValue?: (row: T) => unknown;
  /** Enable column header filter (Excel-style dropdown) */
  filterable?: boolean;
  /**
   * Render prop for custom cell content - RENDER PROP EXCEPTION
   * Modern pattern for dynamic content generation. Preferred over nested component composition.
   * Allows rendering custom components (buttons, inputs, etc.) within table cells.
   */
  render?: (value: unknown, record: T, index: number) => ReactNode;
  /**
   * Column width - LAYOUT EXCEPTION
   * Controls structural data presentation, not styling.
   * Analogous to Grid's cols for defining layout structure.
   * Cells never wrap: text wider than the column ends with "…" (full text in
   * a native tooltip). Without `width`, a column fits its content up to 24rem.
   */
  width?: string | number;
  /**
   * Minimum width of a flexible column (no `width`): it takes its share of the
   * free space but never gets narrower (e.g. the record name column, 240 px).
   * @since 0.3.8
   */
  minWidth?: string | number;
  /**
   * Pins the column at the inline start while the table scrolls sideways (the
   * open-link and checkbox columns pin with it). Put it on the one column that
   * identifies the row (its name); on phones (< 768 px) that column is the
   * stacked row's title.
   * @since 0.3.8
   */
  sticky?: boolean;
  /**
   * Lines a cell shows before "…": `1` (one line, the default), `2` for long
   * text (description, notes).
   * @default 1
   * @since 0.3.8
   */
  lines?: 1 | 2;
  /**
   * Under 768 px the rows stack (one "label  value" line per cell, the
   * header hidden): `true` leaves this column's line out there. Desktop is
   * unchanged. EntityList hides the columns outside the entity's
   * `listCardFields`.
   * @default false
   * @since 0.3.8
   */
  hideOnPhone?: boolean;
  /**
   * Text alignment - LAYOUT CONTROL
   * Semantic alignment for data presentation (start for text, end for numbers).
   * Uses logical alignment for RTL support.
   */
  align?: 'start' | 'center' | 'end';
  /**
   * In-place editor of this column's cells when the DataTable is `editable`.
   * Requires `dataIndex`. The cell shows `render` of the current (pending or
   * saved) value as text (no `render`: a select's option label, a number in the
   * UI language, `29,9` in French), and the editor while focused. The text is
   * focusable with the editor's role and name (`textbox` / `combobox`, the
   * column title). `date` / `datetime` edit with the DatePicker / DateTimePicker in
   * `edit.timeZone` (the bulk edit value too).
   */
  edit?: TableCellEdit;
}

/**
 * Data table component props
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface DataTableProps<T = unknown> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: TableColumn<T>[];
  /**
   * Header click sorts the rows on that column (see `TableColumn.sortable`);
   * `false` turns sorting off for every column.
   * @default true
   */
  sortable?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /**
   * Accessible label of the header checkbox.
   * @default `dndev` key `table.selectAllRows` (ComponentLocaleProvider)
   * @since 0.3.8
   */
  selectAllLabel?: string;
  /**
   * Accessible label of a row checkbox; `{{index}}` is replaced by the 1-based
   * row number.
   * @default `dndev` key `table.selectRow`
   * @since 0.3.8
   */
  selectRowLabel?: string;
  /** Enable search */
  searchable?: boolean;
  /**
   * Placeholder of the search box.
   * @default `dndev` key `table.searchPlaceholder`
   * @since 0.3.8
   */
  searchPlaceholder?: string;
  /**
   * Toolbar content after the search box (e.g. a "Filters" button). The
   * toolbar is one row: [search][toolbarStart] … [Export][toolbarEnd].
   * @since 0.3.8
   */
  toolbarStart?: ReactNode;
  /**
   * Toolbar content at the end, after Export (e.g. Refresh, Add).
   * @since 0.3.8
   */
  toolbarEnd?: ReactNode;
  /**
   * Actions on the checked rows (e.g. Delete), shown in the selection bar at
   * the bottom of the viewport next to "N selected" and the bulk edit
   * controls. With row selection (`selectable` / `editable`), the bar shows
   * while rows are checked when the table is `editable` or this is set.
   * @since 0.3.8
   */
  selectionActions?: (selectedRows: T[]) => ReactNode;
  /**
   * More content of the table's bottom bar (`ActionBar`, fixed to the viewport
   * bottom), e.g. "1 unsaved change · Discard · Save". The bar shows while this
   * is set or rows are checked (both in one bar): nothing is inserted above the
   * table. One bar per page: a page bar of its own (form footer) is covered
   * while this one shows.
   * @since 0.3.8
   */
  actionBarContent?: ReactNode;
  /**
   * Content of the one full-width row shown when there is no row to show
   * (not while loading).
   * @default `dndev` key `table.empty`
   * @since 0.3.8
   */
  emptyState?: ReactNode;
  /** Enable pagination */
  pagination?: boolean;
  /** Current page (1-indexed) */
  currentPage?: number;
  /**
   * Page size (`0` = all). The loading skeleton shows as many rows (3 without pagination).
   * @default 25
   */
  pageSize?: number;
  /** Total number of items (for server-side pagination) */
  total?: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;
  /** Label for "Showing X to Y of Z" text (default: "Showing {{from}} to {{to}} of {{total}} results") */
  showingLabel?: string;
  /** Label for previous button (passed to Pagination) */
  paginationPreviousLabel?: string;
  /** Label for next button (passed to Pagination) */
  paginationNextLabel?: string;
  /** Placeholder for items per page selector (passed to Pagination) */
  paginationItemsPerPagePlaceholder?: string;
  /** "All" page-size choice (passed to Pagination as `allLabel`) @since 0.3.8 */
  paginationAllLabel?: string;
  /** Page button label, `{{page}}` = number (passed to Pagination as `pageLabel`) @since 0.3.8 */
  paginationPageLabel?: string;
  /** Pagination landmark label (passed to Pagination as `navigationLabel`) @since 0.3.8 */
  paginationNavigationLabel?: string;
  /** Loading state */
  loading?: boolean;
  /** Excel-like grid lines (borders on all cells) */
  gridLines?: boolean;
  /** Called with the column key and direction after a header click (the table sorts the rows itself). */
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  /** Callback when selection changes */
  onSelect?: (selectedRows: T[]) => void;
  /** Callback when search query changes */
  onSearch?: (query: string) => void;
  /**
   * Callback when a row is clicked.
   *
   * NOTE: This is programmatic click only. Browsers cannot intercept it for
   * Ctrl+Click / middle-click "open in new tab". For navigable rows, expose a
   * real `<Link>` (anchor) inside an action cell instead - see DataTable
   * component JSDoc "Row clicks & native link affordances".
   */
  onRowClick?: (row: T) => void;
  /** Additional CSS classes */
  className?: string;
  /**
   * Enable export functionality (CSV download button)
   * @default false
   */
  exportable?: boolean;
  /**
   * Custom filename for export (without extension)
   * @default 'export'
   */
  exportFilename?: string;
  /**
   * Callback when export is triggered. If provided, handles export externally.
   * Receives the processed (filtered/sorted) data array.
   */
  onExport?: (data: T[]) => void;
  /**
   * Label for the export button
   * @default `dndev` key `table.export`
   */
  exportLabel?: string;
  /**
   * Spreadsheet-style editing of the columns that declare `edit`: cells show
   * their value as text and are edited in place once focused, rows are checked
   * to set one field on all of them (selection bar, at the bottom of the
   * viewport), a block copied from Excel / Sheets pastes across rows and columns.
   * Implies row selection; `onRowClick` is ignored (open records from a link
   * cell). Edits go to `pendingChanges` — nothing is saved by the table.
   * Requires `getRowId`, `pendingChanges` and `onPendingChange`.
   * @default false
   */
  editable?: boolean;
  /** Stable id of a row. Required with `editable`. */
  getRowId?: (row: T) => string;
  /** Edited values not saved yet (controlled). Required with `editable`. */
  pendingChanges?: TablePendingChanges;
  /** Called with the new pending changes after every edit, paste, bulk apply or undo. */
  onPendingChange?: (changes: TablePendingChanges) => void;
  /** Labels of the selection bar: count, bulk edit, clear (defaults: `dndev` `table.*` keys). */
  editLabels?: DataTableEditLabels;
  /**
   * Leading "open" cell: an icon link to the row's record. Renders a real
   * `<a href>` through the app router's link (Ctrl/Cmd-click opens a new tab).
   * Use it to open records from an `editable` table, where a row click edits.
   * @since 0.2.3
   */
  getRowHref?: (row: T) => string;
  /**
   * Leading "open" cell as an icon button, for apps that open records in place
   * (sheet, dialog) instead of navigating. Takes precedence over `getRowHref`.
   * @since 0.2.3
   */
  onRowOpen?: (row: T) => void;
  /** Accessible label of the open cell (translated by the consumer). Required with `getRowHref` / `onRowOpen`. */
  openLabel?: string;
  /**
   * Invalid cells: `cellErrors[rowId][columnKey]` = message (translated by the
   * consumer), e.g. the rules a pending value breaks or the cells a save rejected.
   * Marked like a value that does not parse (`data-invalid`, red inset border),
   * editors get `aria-invalid` and `aria-describedby` to the message. Nothing is
   * printed in the row (rows never change height): the message is a `Tooltip` on
   * the cell (hover, keyboard focus, open editor) and visually hidden text in the
   * cell. `editable` tables also list every invalid cell (these and the values that
   * do not parse) behind an "N errors" button in the bottom bar. Requires `getRowId`.
   * @since 0.2.5
   */
  cellErrors?: Record<string, Record<string, string>>;
}

/**
 * Basic Table wrapper component.
 * @component
 */
function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="dndev-table-wrapper">
      <table className={cn('dndev-table', className)} role="table" {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('dndev-table-header', className)} {...props} />;
}

function TableBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('dndev-table-body', className)} {...props} />;
}

function TableFooter({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tfoot className={cn('dndev-table-footer', className)} {...props} />;
}

function TableRow({
  className,
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('dndev-table-row', className)} {...props} />;
}

function TableHead({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('dndev-table-head', className)} {...props} />;
}

function TableCell({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('dndev-table-cell', className)} {...props} />;
}

function TableCaption({
  className,
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption className={cn('dndev-table-caption', className)} {...props} />
  );
}

/**
 * Inline-start offsets of pinned cells: 0, 1 or 2 utility columns (open link,
 * checkbox) before them, each one row height wide. Module-level: no style
 * object per render.
 */
const STICKY_OFFSETS: CSSProperties[] = [0, 1, 2].map((n) => ({
  insetInlineStart: `calc(var(--table-row-height) * ${n})`,
}));

/** Size style of a column (header and cells), with its pin offset when `sticky`. */
function columnStyle<T>(
  column: TableColumn<T>,
  stickyOffset: CSSProperties | undefined
): CSSProperties | undefined {
  const { width, minWidth } = column;
  const sticky = column.sticky ? stickyOffset : undefined;
  if (width === undefined && minWidth === undefined && !sticky) return undefined;
  return {
    ...sticky,
    ...(width !== undefined && { width, maxWidth: width }),
    ...(minWidth !== undefined && { minWidth }),
  };
}

/**
 * Text an editable cell shows while not edited: the column's `render` of the
 * current value, the option label of a select, a number in the UI language
 * (`29,9` in French; the editor keeps `29.9`), else the value as text. A value
 * that does not parse shows as typed (it is what the save will reject).
 */
function editCellDisplay<T>(
  column: TableColumn<T>,
  value: unknown,
  row: T,
  index: number,
  valid: boolean,
  language: string
): ReactNode {
  if (!valid) return cellText(value);
  if (column.render) return column.render(value, row, index);
  const edit = column.edit!;
  if (edit.type === 'select') {
    const text = cellText(value);
    const option = edit.options?.find((o) => o.value === text);
    return option ? option.label : text;
  }
  if (edit.type === 'number' && typeof value === 'number') {
    return formatCellNumber(value, language);
  }
  return cellText(value);
}

/**
 * Native tooltip with the full text of a cell cut by "…" (`title`, set on hover
 * from the DOM, removed once the text fits). One delegated listener per table.
 */
function showOverflowTitle(e: PointerEvent<HTMLDivElement>) {
  const cell = (e.target as HTMLElement).closest<HTMLElement>(
    '.dndev-table-cell, .dndev-table-head'
  );
  if (!cell) return;
  const box =
    cell.querySelector<HTMLElement>(
      '.dndev-table-cell-clamp, .dndev-table-cell-tip, .dndev-table-cell-text, .dndev-table-head-label'
    ) ?? cell;
  const cut =
    box.scrollWidth > box.clientWidth || box.scrollHeight > box.clientHeight;
  const text = cut ? (cell.textContent ?? '').trim() : '';
  if (text) cell.setAttribute('title', text);
  else cell.removeAttribute('title');
}

/** Key of a cell in the error list: row id + column key. */
function errorKey(rowId: string, columnKey: string): string {
  return `${rowId}\u0000${columnKey}`;
}

/**
 * Error list opened on a tapped cell's entry: scrolls that entry into view in the
 * list (mount of the list, keyed by the entry). Module-level: one stable ref.
 */
function scrollCurrentEntryIntoView(list: HTMLUListElement | null) {
  list
    ?.querySelector('[aria-current="true"]')
    ?.scrollIntoView({ block: 'nearest' });
}

// Enhanced DataTable component
/**
 * High-level DataTable component with built-in sorting, filtering, search, pagination, and export.
 *
 * ## Sorting
 *
 * Every column with `dataIndex` or `render` sorts on header click, with no
 * config: on what the cell shows, in the UI language (`sortTableRows`).
 * A column with nothing to sort over the data (all cells empty or the same,
 * fewer than 2 rows) shows no sort arrow (`sortableTableColumns`).
 * Opt out with `sortable: false` on a column or `sortable={false}` on the table.
 *
 * ## Layout (admin grid)
 *
 * Neutral sticky header, no striping, one line per cell ("…" + native tooltip),
 * rows `--table-row-height` high (40px, 48px on a coarse pointer), a few px of
 * inline cell padding. The sort arrow (sorted column, or hover) is overlaid at the
 * header's inline end, out of the flow: it never changes a column width. Columns
 * size with `width` / `minWidth`; `sticky` pins the row's name column at the
 * inline start; `lines: 2` for long text. One toolbar row:
 * `[search][toolbarStart] … [Export][toolbarEnd]`. Nothing to show: one full-width
 * `emptyState` row. Checked rows and `actionBarContent` show in one bottom
 * `ActionBar`; nothing is inserted above the table. Under 768px rows stack by CSS
 * (the `sticky` column as title, "label  value" lines, `hideOnPhone` left out).
 *
 * ## Invalid cells (editable)
 *
 * A cell in error (`cellErrors`, or a value that does not parse) has a red inset
 * border and its message in a `Tooltip` (hover, keyboard focus, open editor);
 * nothing is printed in the row. An invalid typed value keeps its editor open
 * (block mode, see `EditCell`). The bottom bar shows an "N errors" button
 * (`dndev:table.errors`) opening a non-modal list, one entry per invalid cell in
 * the order shown ("Row 3 · Price: …", `dndev:table.errorEntry`); an entry closes the
 * list and focuses its cell (on its page). Entries leave as cells are fixed, the
 * button with the last one. On a touch screen (coarse pointer: no hover), tapping an
 * invalid cell opens its editor and the list on its entry, focus kept in the editor.
 * Screen readers: one polite announcement when the edited cell's error appears or
 * changes, one when the count changes.
 *
 * ## Row clicks & native link affordances
 *
 * `onRowClick` is a programmatic click handler. Browsers CANNOT intercept it
 * for Ctrl+Click / Cmd+Click / middle-click / "Open in new tab". If users need
 * to open a row in a new tab, expose a real `<Link>` inside an action cell
 * (e.g. an Edit icon column rendered as `<Link path={url}>`). The Link emits a
 * proper `<a href>` and the browser handles all native affordances natively.
 *
 * Why DataTable does NOT render a row-level `<a>` overlay (decision 2026-04-07):
 * - HTML disallows `<a>` wrapping `<tr>` (no interactive content nesting in
 *   table rows), so a row-link must be an absolutely-positioned overlay anchor.
 * - An overlay covering the row intercepts ALL clicks before they reach cell
 *   content, which is incompatible with future inline-cell-editing (clicks on
 *   `<input>` cells would be swallowed by the overlay).
 * - A single row CANNOT have BOTH inline editing AND row-level Ctrl+Click open
 *   in new tab. HTML semantics force the choice. We chose to keep DataTable
 *   inline-edit-friendly and put the Ctrl+Click affordance on action-cell
 *   `<Link>` instead.
 * - Layer rule: DataTable lives in `@donotdev/components`, below `@donotdev/ui`.
 *   It cannot import `Link` (which lives in ui). The action-cell `<Link>` is
 *   provided by the consumer (in ui or higher) via `column.render`.
 *
 * If a future use case truly needs the entire row to be a link (e.g. an
 * admin-only browse table that will never have inline editing), add an opt-in
 * `getRowHref` prop AT THAT TIME and document the inline-edit incompatibility.
 * Do not add it speculatively.
 *
 * @component
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { key: 'name', title: 'Name', dataIndex: 'name' },
 *     { key: 'role', title: 'Role', dataIndex: 'role', render: (v) => t(`role.${v}`) },
 *     { key: 'actions', title: '', sortable: false, render: (_, row) => <RowActions row={row} /> }
 *   ]}
 *   searchable
 *   pagination
 *   exportable
 *   exportFilename="users-export"
 * />
 * ```
 * @param {DataTableProps} props - The props for the data table
 * @returns {ReactNode} The rendered data table
 */
const DataTable = <T = unknown,>({
  data,
  columns,
  sortable = true,
  selectable = false,
  searchable = true,
  pagination = true,
  currentPage: currentPageProp,
  pageSize: pageSizeProp,
  total: totalProp,
  onPageChange,
  onPageSizeChange,
  showingLabel,
  paginationPreviousLabel,
  paginationNextLabel,
  paginationItemsPerPagePlaceholder,
  paginationAllLabel,
  paginationPageLabel,
  paginationNavigationLabel,
  loading = false,
  gridLines = false,
  onSort,
  onSelect,
  onSearch,
  onRowClick,
  className,
  exportable = false,
  exportFilename = 'export',
  onExport,
  exportLabel,
  selectAllLabel,
  selectRowLabel,
  searchPlaceholder,
  toolbarStart,
  toolbarEnd,
  selectionActions,
  actionBarContent,
  emptyState,
  editable = false,
  getRowId,
  pendingChanges,
  onPendingChange,
  editLabels,
  getRowHref,
  onRowOpen,
  openLabel,
  cellErrors,
}: DataTableProps<T>): ReactNode => {
  if (cellErrors && !getRowId) {
    throw new Error('DataTable: `cellErrors` requires `getRowId`.');
  }
  if (editable && (!getRowId || !pendingChanges || !onPendingChange)) {
    throw new Error(
      'DataTable: `editable` requires `getRowId`, `pendingChanges` and `onPendingChange`.'
    );
  }
  const showOpen = !!(getRowHref || onRowOpen);
  if (showOpen && !openLabel) {
    throw new Error(
      'DataTable: `getRowHref` / `onRowOpen` require `openLabel`.'
    );
  }
  const LinkComponent = useLinkRenderer();
  // UI language and default labels (ComponentLocaleProvider): the same on the server
  // render and the client, so sorting and number cells hydrate identically
  const { language, translate } = useComponentLocale();
  const showSelection = selectable || editable;
  const rowClick = editable ? undefined : onRowClick;
  const tableRef = useRef<HTMLDivElement>(null);
  // Previous pending states, for Ctrl/Cmd+Z
  const historyRef = useRef<TablePendingChanges[]>([]);
  const [bulkKey, setBulkKey] = useState('');
  // Bulk value: a select column's choice (state), else typed text kept in the DOM (read on Apply)
  const [bulkOption, setBulkOption] = useState('');
  const bulkValueRef = useRef<HTMLInputElement>(null);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedRows, setCheckedRows] = useState<T[]>([]);
  // Error list (bottom bar): open, the entry it was opened on (tap), the last edited cell
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [lastEdited, setLastEdited] = useState<string | null>(null);
  /** The list opens or closes from a tap on a cell: focus stays in that cell's editor. */
  const errorsTapRef = useRef(false);
  /** Cell an entry was activated for: focused once the list has closed. */
  const errorTargetRef = useRef<{ index: number; columnIndex: number } | null>(
    null
  );

  // Page size state (for client-side pagination)
  const [internalPageSize, setInternalPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);
  const effectivePageSize = pageSizeProp ?? internalPageSize;

  // Controlled vs uncontrolled pagination
  const isControlledPagination =
    currentPageProp !== undefined && onPageChange !== undefined;
  const [internalPage, setInternalPage] = useState(1);
  const currentPage = isControlledPagination ? currentPageProp : internalPage;
  const handlePageChange = (page: number) => {
    if (isControlledPagination) {
      onPageChange?.(page);
    } else {
      setInternalPage(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      // Controlled mode (server-side)
      onPageSizeChange(newPageSize);
    } else {
      // Uncontrolled mode (client-side) - update internal state
      setInternalPageSize(newPageSize);
      setInternalPage(1); // Reset to page 1
    }
  };

  // Columns with something to sort over the data (2+ different values), once per data / columns change
  const sortableKeys = useMemo(
    () => sortableTableColumns(data, columns, sortable, language),
    [data, columns, sortable, language]
  );

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          const value = col.dataIndex ? row[col.dataIndex] : '';
          return String(value)
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply sorting: on what the column shows, in the UI language (tableSort)
    const sortBy = columns.find((col) => col.key === sortColumn);
    if (sortBy && sortableKeys.has(sortBy.key)) {
      filtered = sortTableRows(filtered, sortBy, sortDirection, language);
    }

    return filtered;
  }, [data, searchQuery, sortColumn, sortDirection, columns, sortableKeys, language]);

  // Pagination: use server-side total if provided, otherwise client-side
  const total = totalProp ?? processedData.length;
  // Handle "All" case (pageSize = 0 means show all)
  const isShowingAll = effectivePageSize === 0;
  const pageSize = isShowingAll ? total : effectivePageSize;
  const totalPages = isShowingAll ? 1 : Math.ceil(total / pageSize);
  // For server-side pagination, data is already paginated - use as-is
  // For client-side pagination, slice the data
  const displayData =
    isControlledPagination && totalProp !== undefined
      ? processedData // Server-side: data already paginated
      : pagination && !isShowingAll
        ? processedData.slice(
            (currentPage - 1) * pageSize,
            currentPage * pageSize
          )
        : processedData;

  const handleSort = (column: string) => {
    if (!sortable) return;

    const newDirection =
      sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort?.(column, newDirection);
  };

  // Rows compare by id when the table has one (rows are new objects after a refetch)
  const sameRow = (a: T, b: T) =>
    getRowId ? getRowId(a) === getRowId(b) : a === b;

  // Selection only holds rows still in the data (deleted or refetched-away rows drop out)
  const presentIds = !loading && getRowId ? new Set(data.map(getRowId)) : null;
  const selectedRows = loading || data.length === 0
    ? []
    : checkedRows.filter((r) =>
        presentIds ? presentIds.has(getRowId!(r)) : data.includes(r)
      );
  const selectedIds = getRowId ? new Set(selectedRows.map(getRowId)) : null;
  const isSelected = (row: T) =>
    selectedIds ? selectedIds.has(getRowId!(row)) : selectedRows.includes(row);

  // Header checkbox selects every row of the filtered / sorted result, across
  // client-side pages; with server pagination `data` is the loaded page.
  const selectableRows = loading ? [] : processedData;
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((row) => isSelected(row));

  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? selectableRows : [];
    setCheckedRows(newSelection);
    onSelect?.(newSelection);
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    const newSelection = checked
      ? [...selectedRows, row]
      : selectedRows.filter((r) => !sameRow(r, row));
    setCheckedRows(newSelection);
    onSelect?.(newSelection);
  };

  // --- Editing ---
  const editColumns = editable
    ? columns.filter((c) => c.edit && c.dataIndex)
    : [];

  const originalValue = (row: T, column: TableColumn<T>) =>
    row[column.dataIndex as keyof T] as unknown;

  const currentValue = (row: T, column: TableColumn<T>) => {
    const pending = pendingChanges?.[getRowId!(row)];
    return pending && column.key in pending
      ? pending[column.key]
      : originalValue(row, column);
  };

  const emitChanges = (next: TablePendingChanges) => {
    if (next === pendingChanges) return;
    historyRef.current.push(pendingChanges!);
    onPendingChange!(next);
  };

  /** Applies `value` to (row, column) pairs in one change (one undo step). */
  const applyCells = (
    cells: ReadonlyArray<{ row: T; column: TableColumn<T>; value: unknown }>
  ) => {
    let next = pendingChanges!;
    for (const { row, column, value } of cells) {
      next = setPendingCell(
        next,
        getRowId!(row),
        column.key,
        value,
        originalValue(row, column)
      );
    }
    emitChanges(next);
  };

  const undo = () => {
    const previous = historyRef.current.pop();
    if (!previous) return false;
    onPendingChange!(previous);
    return true;
  };

  const pasteGrid = (start: CellPosition, grid: string[][]) => {
    const cells: Array<{ row: T; column: TableColumn<T>; value: unknown }> = [];
    grid.forEach((line, r) => {
      const row = displayData[start.row + r];
      if (!row) return;
      line.forEach((text, c) => {
        const column = editColumns[start.col + c];
        if (!column) return;
        cells.push({
          row,
          column,
          value: parseCellText(text, column.edit!).value,
        });
      });
    });
    applyCells(cells);
  };

  const editLabel = (name: keyof DataTableEditLabels) =>
    componentLabel(translate, editLabels?.[name], EDIT_LABEL_KEYS[name], {
      count: selectedRows.length,
    });
  const labels = {
    selected: editLabel('selected'),
    field: editLabel('field'),
    value: editLabel('value'),
    apply: editLabel('apply'),
    clear: editLabel('clear'),
  };
  const exportText = componentLabel(translate, exportLabel, 'table.export');
  const bulkColumn = editColumns.find((c) => c.key === bulkKey);
  const applyBulk = () => {
    if (!bulkColumn) return;
    // select / date / datetime: the picked value (state); else the typed text (DOM).
    // A datetime pick is a wall time, read in the column's zone by parseCellText.
    const pickedType = ['select', 'date', 'datetime'].includes(
      bulkColumn.edit!.type
    );
    const text = pickedType
      ? bulkOption
      : (bulkValueRef.current?.value ?? '');
    const { value } = parseCellText(text, bulkColumn.edit!);
    applyCells(selectedRows.map((row) => ({ row, column: bulkColumn, value })));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  /**
   * Export processed data to CSV
   * Uses the current filtered/sorted data, respecting column definitions
   */
  const handleExport = () => {
    // If custom handler provided, delegate to it
    if (onExport) {
      onExport(processedData);
      return;
    }

    // Get column headers (only data columns, not render-only columns)
    const dataColumns = columns.filter((col) => col.dataIndex);
    const headers = dataColumns
      .map((col) => {
        // Extract string title, handle ReactNode titles
        const title = col.title;
        return typeof title === 'string' ? title : col.key;
      })
      .join(',');

    // Build CSV rows
    const rows = processedData.map((row) =>
      dataColumns
        .map((col) => {
          const value = col.dataIndex ? row[col.dataIndex] : '';
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const stringValue = String(value ?? '');
          if (
            stringValue.includes(',') ||
            stringValue.includes('"') ||
            stringValue.includes('\n')
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    );

    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFilename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Loading slots carry no record and must never enter consumer data paths.
  // As many skeleton rows as the page shows, so nothing jumps when rows arrive.
  type RowSlot = { kind: 'loading' } | { kind: 'data'; row: T };
  const skeletonCount =
    pagination && effectivePageSize > 0 ? effectivePageSize : 3;
  const rowSlots: RowSlot[] = loading
    ? Array.from({ length: skeletonCount }, () => ({ kind: 'loading' }))
    : displayData.map((row) => ({ kind: 'data', row }));

  // Pinned columns: open link, checkbox, then the `sticky` column, offset by
  // the utility columns before it (each one row height wide).
  const hasSticky = columns.some((c) => c.sticky);
  const utilityCount = (showOpen ? 1 : 0) + (showSelection ? 1 : 0);
  const openOffset = STICKY_OFFSETS[0];
  const checkboxOffset = STICKY_OFFSETS[showOpen ? 1 : 0];
  // One style object per column (shared by its header and cells)
  const columnStyles = columns.map((column) =>
    columnStyle(column, hasSticky ? STICKY_OFFSETS[utilityCount] : undefined)
  );
  const columnCount = columns.length + utilityCount;

  // --- Invalid cells: message per cell, and the error list in the order shown ---
  const invalidText = translate('table.invalidValue');
  /** Why a cell is invalid: `cellErrors`, else a value that does not parse. */
  const cellMessage = (row: T, column: TableColumn<T>): string | undefined => {
    const message = cellErrors?.[getRowId!(row)]?.[column.key];
    if (message) return message;
    if (!editable || !column.edit || !column.dataIndex) return undefined;
    return isCellValueValid(currentValue(row, column), column.edit)
      ? undefined
      : invalidText;
  };
  const serverPaged = isControlledPagination && totalProp !== undefined;
  const clientPaged = pagination && !isShowingAll && !serverPaged;
  // Row numbers as the user sees them: across pages (server pages: this page's offset)
  const rowOffset =
    serverPaged && !isShowingAll ? (currentPage - 1) * pageSize : 0;
  const errorEntries =
    editable && !loading
      ? processedData.flatMap((row, index) =>
          columns.flatMap((column, columnIndex) => {
            const message = cellMessage(row, column);
            if (!message) return [];
            return [
              {
                key: errorKey(getRowId!(row), column.key),
                index,
                columnIndex,
                text: translate('table.errorEntry', {
                  row: rowOffset + index + 1,
                  column:
                    typeof column.title === 'string'
                      ? column.title
                      : column.key,
                  message,
                }),
              },
            ];
          })
        )
      : [];
  type ErrorEntry = (typeof errorEntries)[number];
  const errorCount = errorEntries.length;
  // Nothing left to list: the list is closed (it does not reopen with the next error)
  if (errorsOpen && errorCount === 0) setErrorsOpen(false);
  const errorsLabel = translate('table.errors', { count: errorCount });
  // Screen readers: the edited cell's error when it appears or changes (one entry text)
  const editedError =
    errorEntries.find((entry) => entry.key === lastEdited)?.text ?? '';

  /** Focuses (editable) or scrolls to (read-only) the cell of an entry, on its page. */
  const focusErrorCell = (target: { index: number; columnIndex: number }) => {
    const position = clientPaged ? target.index % pageSize : target.index;
    const column = columns[target.columnIndex]!;
    const editCol = editColumns.indexOf(column);
    if (editCol >= 0) {
      focusEditor(tableRef, { row: position, col: editCol });
      return;
    }
    tableRef.current
      ?.querySelectorAll('tbody > tr')
      [position]?.children[utilityCount + target.columnIndex]?.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
  };

  /** An entry: its page, then the list closes and focus goes to the cell. */
  const goToError = (entry: ErrorEntry) => {
    if (clientPaged) {
      const page = Math.floor(entry.index / pageSize) + 1;
      if (page !== currentPage) handlePageChange(page);
    }
    errorTargetRef.current = entry;
    setErrorsOpen(false);
  };

  /**
   * Touch screens (no hover, the Tooltip does not open on a tap): a tap on an
   * invalid cell opens the list on its entry, without moving focus (the cell's
   * editor opens as usual); a tap on another cell closes it.
   */
  const openErrorOnTap = (e: PointerEvent<HTMLDivElement>) => {
    if (errorCount === 0 || !isCoarsePointer()) return;
    const td = (e.target as HTMLElement).closest('td');
    if (!td) return;
    const row =
      displayData[(td.parentElement as HTMLTableRowElement).sectionRowIndex];
    const column = columns[td.cellIndex - utilityCount];
    const key = row && column ? errorKey(getRowId!(row), column.key) : null;
    if (!key || !errorEntries.some((entry) => entry.key === key)) {
      if (!errorsOpen) return;
      errorsTapRef.current = true;
      setErrorsOpen(false);
      return;
    }
    if (!errorsOpen) errorsTapRef.current = true;
    setActiveError(key);
    setErrorsOpen(true);
  };

  // Selection bar: count, bulk edit, app actions, clear; pending edits beside it
  const showSelectionBar =
    showSelection &&
    selectedRows.length > 0 &&
    (editColumns.length > 0 || !!selectionActions);
  const showActionBar =
    showSelectionBar || actionBarContent != null || errorCount > 0;

  const hasToolbar =
    searchable || exportable || toolbarStart != null || toolbarEnd != null;

  return (
    <Stack>
      {/* Toolbar, one row: [search][toolbarStart] … [Export][toolbarEnd] */}
      {hasToolbar && (
        <Stack
          direction="row"
          align="center"
          justify="between"
          gap="tight"
          wrap="wrap"
          className="dndev-table-toolbar"
        >
          <Stack
            direction="row"
            align="center"
            gap="tight"
            className="dndev-table-toolbar-start"
          >
            {searchable && (
              <Stack
                direction="row"
                align="center"
                className="dndev-relative dndev-flex-1 dndev-table-search-container"
              >
                <Search className="dndev-table-search-icon" />
                <Input
                  placeholder={componentLabel(
                    translate,
                    searchPlaceholder,
                    'table.searchPlaceholder'
                  )}
                  value={searchQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleSearch(e.target.value)
                  }
                  className="dndev-table-search-input"
                />
              </Stack>
            )}
            {toolbarStart}
          </Stack>
          {(exportable || toolbarEnd != null) && (
            <Stack direction="row" align="center" gap="tight" width="fit">
              {exportable && (
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={handleExport}
                  disabled={loading || processedData.length === 0}
                  aria-label={exportText}
                >
                  {exportText}
                </Button>
              )}
              {toolbarEnd}
            </Stack>
          )}
        </Stack>
      )}

      {/* Table */}
      <div
        ref={tableRef}
        className="dndev-table-edit-scope"
        onPointerOver={showOverflowTitle}
        onPointerDown={editable ? openErrorOnTap : undefined}
      >
        <Table
          className={cn(gridLines && 'dndev-table-grid')}
          data-utilities={utilityCount || undefined}
        >
          <TableHeader>
            <TableRow>
              {showOpen && (
                <TableHead
                  className="dndev-table-utility"
                  data-sticky={hasSticky || undefined}
                  style={hasSticky ? openOffset : undefined}
                >
                  <span className="dndev-sr-only">{openLabel}</span>
                </TableHead>
              )}
              {showSelection && (
                <TableHead
                  className="dndev-table-utility"
                  data-sticky={hasSticky || undefined}
                  style={hasSticky ? checkboxOffset : undefined}
                >
                  <Checkbox
                    checked={allSelected}
                    disabled={loading}
                    onCheckedChange={handleSelectAll}
                    aria-label={componentLabel(
                      translate,
                      selectAllLabel,
                      'table.selectAllRows'
                    )}
                  />
                </TableHead>
              )}
              {columns.map((column, columnIndex) => {
                const columnSortable = sortableKeys.has(column.key);
                const sorted = columnSortable && sortColumn === column.key;
                return (
                  <TableHead
                    key={column.key}
                    className={cn(columnSortable && 'dndev-cursor-pointer')}
                    data-sortable={columnSortable || undefined}
                    data-sorted={sorted || undefined}
                    data-align={column.align}
                    data-sticky={column.sticky || undefined}
                    aria-sort={
                      sorted
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    style={columnStyles[columnIndex]}
                    onClick={(e) => {
                      // Only sort if clicking on header, not on interactive elements (buttons, inputs, etc.)
                      if (columnSortable) {
                        const target = e.target as HTMLElement;
                        const isInteractive = target.closest(
                          'button, input, a, [role="button"]'
                        );
                        if (!isInteractive) {
                          handleSort(column.key);
                        }
                      }
                    }}
                  >
                    <span className="dndev-table-head-content">
                      {typeof column.title === 'string' ? (
                        <span className="dndev-table-head-label">
                          {column.title}
                        </span>
                      ) : (
                        column.title
                      )}
                      {/* Arrow: shown on the sorted column, else on hover (CSS) */}
                      {columnSortable &&
                        (sorted && sortDirection === 'desc' ? (
                          <ChevronDown
                            className="dndev-table-sort-icon"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronUp
                            className="dndev-table-sort-icon"
                            aria-hidden="true"
                          />
                        ))}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!loading && rowSlots.length === 0 && (
              <TableRow className="dndev-table-empty-row">
                <TableCell colSpan={columnCount} className="dndev-table-empty">
                  {emptyState === undefined || typeof emptyState === 'string' ? (
                    <Text as="span" variant="muted">
                      {emptyState ?? translate('table.empty')}
                    </Text>
                  ) : (
                    emptyState
                  )}
                </TableCell>
              </TableRow>
            )}
            {rowSlots.map((slot, index) => {
              const selected =
                slot.kind === 'data' && showSelection && isSelected(slot.row);
              return (
                <TableRow
                  key={index}
                  data-selected={selected || undefined}
                  onClick={(e) => {
                    if (rowClick && slot.kind === 'data') {
                      const target = e.target as HTMLElement;
                      // Prevent row click if clicking interactive elements
                      const isInteractive = target.closest(
                        'button, a, input, [role="button"], label'
                      );
                      if (!isInteractive) {
                        rowClick(slot.row);
                      }
                    }
                  }}
                  className={cn(
                    slot.kind === 'loading' && 'dndev-skeleton-row',
                    rowClick && slot.kind === 'data' && 'dndev-cursor-pointer'
                  )}
                >
                  {showOpen && (
                    <TableCell
                      className="dndev-table-utility dndev-table-open-cell"
                      data-sticky={hasSticky || undefined}
                      style={hasSticky ? openOffset : undefined}
                    >
                      {slot.kind === 'loading' ? null : onRowOpen ? (
                        <Button
                          variant="ghost"
                          display="compact"
                          icon={ArrowUpRight}
                          onClick={() => onRowOpen(slot.row)}
                          aria-label={openLabel}
                          className="dndev-table-open-link"
                        />
                      ) : (
                        <LinkComponent
                          href={getRowHref!(slot.row)}
                          className="dndev-table-open-link"
                          aria-label={openLabel}
                          title={openLabel}
                        >
                          <ArrowUpRight
                            className="dndev-size-md"
                            aria-hidden="true"
                          />
                        </LinkComponent>
                      )}
                    </TableCell>
                  )}
                  {showSelection && (
                    <TableCell
                      className="dndev-table-utility dndev-table-select-cell"
                      data-sticky={hasSticky || undefined}
                      style={hasSticky ? checkboxOffset : undefined}
                    >
                      {slot.kind === 'loading' ? (
                        <div
                          className="dndev-skeleton dndev-skeleton-pulse dndev-table-skeleton-box"
                          aria-hidden="true"
                        />
                      ) : (
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked: boolean) =>
                            handleSelectRow(slot.row, !!checked)
                          }
                          aria-label={componentLabel(
                            translate,
                            selectRowLabel,
                            'table.selectRow',
                            { index: index + 1 }
                          )}
                        />
                      )}
                    </TableCell>
                  )}
                  {columns.map((column, columnIndex) => {
                    let content: ReactNode;
                    let isEditable = false;
                    let dirty: 'true' | undefined;
                    let invalid: 'true' | undefined;
                    let cellError: string | undefined;

                    if (slot.kind === 'loading') {
                      content = (
                        <div
                          className="dndev-skeleton dndev-skeleton-pulse dndev-table-skeleton-bar"
                          data-short={index % 2 === 1 || undefined}
                          aria-hidden="true"
                        />
                      );
                    } else {
                      const row = slot.row;
                      const cellValue = column.dataIndex
                        ? row[column.dataIndex]
                        : null;
                      cellError = cellMessage(row, column);
                      const editCol = column.edit
                        ? editColumns.indexOf(column)
                        : -1;
                      if (editCol >= 0) {
                        const value = currentValue(row, column);
                        const pending = pendingChanges?.[getRowId!(row)];
                        const valid = isCellValueValid(value, column.edit!);
                        isEditable = true;
                        dirty =
                          pending && column.key in pending ? 'true' : undefined;
                        invalid = valid && !cellError ? undefined : 'true';
                        content = (
                          <EditCell
                            edit={column.edit!}
                            value={value}
                            display={editCellDisplay(column, value, row, index, valid, language)}
                            error={cellError}
                            position={{ row: index, col: editCol }}
                            label={
                              typeof column.title === 'string'
                                ? column.title
                                : column.key
                            }
                            commit={(v) => {
                              setLastEdited(
                                errorKey(getRowId!(row), column.key)
                              );
                              applyCells([{ row, column, value: v }]);
                            }}
                            focusCell={(p) => focusEditor(tableRef, p)}
                            pasteGrid={(grid) =>
                              pasteGrid({ row: index, col: editCol }, grid)
                            }
                            undo={undo}
                          />
                        );
                      } else if (column.render) {
                        // Real empty values and action columns still reach render.
                        content = column.render(cellValue, row, index);
                      } else {
                        const isEmpty =
                          cellValue === null ||
                          cellValue === undefined ||
                          cellValue === '';
                        content = isEmpty ? '' : String(cellValue || '');
                      }
                    }

                    return (
                      <TableCell
                        key={column.key}
                        data-label={
                          typeof column.title === 'string'
                            ? column.title
                            : undefined
                        }
                        data-align={column.align}
                        data-sticky={column.sticky || undefined}
                        data-lines={column.lines === 2 ? '2' : undefined}
                        data-phone={column.hideOnPhone ? 'hidden' : undefined}
                        data-editable={isEditable ? 'true' : undefined}
                        data-dirty={dirty}
                        data-invalid={invalid ?? (cellError ? 'true' : undefined)}
                        style={columnStyles[columnIndex]}
                      >
                        {cellError && !isEditable ? (
                          // Read-only cell in error: its message on hover, visually
                          // hidden in the cell (nothing printed in the row)
                          <>
                            <Tooltip content={cellError}>
                              {column.lines === 2 ? (
                                <div className="dndev-table-cell-clamp">
                                  {content}
                                </div>
                              ) : (
                                <span className="dndev-table-cell-tip">
                                  {content}
                                </span>
                              )}
                            </Tooltip>
                            <span className="dndev-sr-only">{cellError}</span>
                          </>
                        ) : column.lines === 2 && !isEditable ? (
                          <div className="dndev-table-cell-clamp">
                            {content}
                          </div>
                        ) : (
                          content
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Polite live regions, in the DOM from the first render (WCAG ARIA19, as
          FieldMessage): the edited cell's error, then the error count */}
      {editable && (
        <>
          <span className="dndev-sr-only" aria-live="polite" aria-atomic="true">
            {editedError}
          </span>
          <span className="dndev-sr-only" aria-live="polite" aria-atomic="true">
            {errorCount > 0 ? errorsLabel : ''}
          </span>
        </>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          total={total}
          onPageSizeChange={handlePageSizeChange}
          showingLabel={showingLabel}
          previousLabel={paginationPreviousLabel}
          nextLabel={paginationNextLabel}
          itemsPerPagePlaceholder={paginationItemsPerPagePlaceholder}
          allLabel={paginationAllLabel}
          pageLabel={paginationPageLabel}
          navigationLabel={paginationNavigationLabel}
        />
      )}

      {/* Bottom bar: pending edits (consumer) and the selection bar; nothing moves above the table */}
      {showActionBar && (
        <ActionBar className="dndev-table-action-bar">
          <Stack
            direction="row"
            align="center"
            justify="between"
            gap="medium"
            wrap="wrap"
          >
            {(actionBarContent != null || errorCount > 0) && (
              <Stack direction="row" align="center" gap="tight" wrap="wrap">
                {errorCount > 0 && (
                  // Error list (SAP UI5 MessagePopover): count button, non-modal popover
                  <Popover.Root
                    open={errorsOpen}
                    onOpenChange={(open) => {
                      if (open) setActiveError(null);
                      setErrorsOpen(open);
                    }}
                    modal={false}
                  >
                    <Popover.Trigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        display="full"
                        icon={CircleAlert}
                        className="dndev-table-errors-button"
                      >
                        {errorsLabel}
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content
                      side="top"
                      align="start"
                      className="dndev-floating dndev-z-tooltip dndev-table-errors"
                      aria-label={errorsLabel}
                      onOpenAutoFocus={(e) => {
                        // Opened by a tap on a cell: its editor keeps focus
                        if (errorsTapRef.current) e.preventDefault();
                        errorsTapRef.current = false;
                      }}
                      onCloseAutoFocus={(e) => {
                        // Closed by a tap on a cell: focus stays in its editor
                        if (errorsTapRef.current) {
                          errorsTapRef.current = false;
                          e.preventDefault();
                          return;
                        }
                        // Closed by an entry: focus goes to its cell, not the button
                        const target = errorTargetRef.current;
                        if (!target) return;
                        errorTargetRef.current = null;
                        e.preventDefault();
                        focusErrorCell(target);
                      }}
                      onFocusOutside={(e) => {
                        // Touch: the list closes on a tap outside it, not when focus
                        // moves (the tapped cell's text, then its editor, take focus)
                        if (isCoarsePointer()) e.preventDefault();
                      }}
                      onPointerDownOutside={(e) => {
                        // Touch: a tap on another invalid cell moves the list to its entry
                        const target = e.target as Element;
                        if (
                          isCoarsePointer() &&
                          tableRef.current?.contains(target) &&
                          target.closest('td[data-invalid="true"]')
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <ul
                        key={activeError ?? ''}
                        ref={scrollCurrentEntryIntoView}
                        className="dndev-table-errors-list"
                      >
                        {errorEntries.map((entry) => (
                          <li key={entry.key}>
                            <button
                              type="button"
                              className="dndev-table-error-entry"
                              aria-current={
                                entry.key === activeError || undefined
                              }
                              onClick={() => goToError(entry)}
                            >
                              {entry.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </Popover.Content>
                  </Popover.Root>
                )}
                {actionBarContent}
              </Stack>
            )}
            {showSelectionBar && (
              <Stack
                direction="row"
                align="center"
                gap="tight"
                wrap="wrap"
                role="toolbar"
                aria-label={labels.selected}
                className="dndev-table-selection-bar"
              >
                <Text as="span" weight="medium">
                  {labels.selected}
                </Text>
                {editColumns.length > 0 && (
                  <>
                    <Select
                      label={labels.field}
                      placeholder={labels.field}
                      value={bulkKey}
                      onValueChange={(key) => {
                        setBulkKey(key);
                        setBulkOption('');
                      }}
                      options={editColumns.map((c) => ({
                        value: c.key,
                        label: typeof c.title === 'string' ? c.title : c.key,
                      }))}
                    />
                    {bulkColumn?.edit?.type === 'select' ? (
                      <Select
                        key={bulkKey}
                        label={labels.value}
                        placeholder={labels.value}
                        value={bulkOption}
                        onValueChange={setBulkOption}
                        options={[...(bulkColumn.edit.options ?? [])]}
                      />
                    ) : bulkColumn?.edit?.type === 'date' ? (
                      <DatePicker
                        key={bulkKey}
                        label={labels.value}
                        value={bulkOption === '' ? null : bulkOption}
                        onChange={(picked) => setBulkOption(picked ?? '')}
                      />
                    ) : bulkColumn?.edit?.type === 'datetime' ? (
                      <DateTimePicker
                        key={bulkKey}
                        label={labels.value}
                        value={bulkOption === '' ? null : bulkOption}
                        onChange={(picked) => setBulkOption(picked ?? '')}
                      />
                    ) : (
                      <Input
                        key={bulkKey}
                        ref={bulkValueRef}
                        label={labels.value}
                        placeholder={labels.value}
                        inputMode={
                          bulkColumn?.edit?.type === 'number'
                            ? 'decimal'
                            : undefined
                        }
                        defaultValue=""
                        disabled={!bulkColumn}
                      />
                    )}
                    <Button
                      variant="outline"
                      display="full"
                      onClick={applyBulk}
                      disabled={!bulkColumn}
                    >
                      {labels.apply}
                    </Button>
                  </>
                )}
                {selectionActions?.(selectedRows)}
                <Button
                  variant="ghost"
                  display="compact"
                  icon={X}
                  onClick={() => handleSelectAll(false)}
                  aria-label={labels.clear}
                  tooltip={labels.clear}
                />
              </Stack>
            )}
          </Stack>
        </ActionBar>
      )}
    </Stack>
  );
};

export default Table;
export {
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  DataTable,
};
