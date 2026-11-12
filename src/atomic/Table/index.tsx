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
  ChevronDown,
  Search,
  Download,
} from 'lucide-react';
import {
  useState,
  useMemo,
  useRef,
  type ReactNode,
  type HTMLAttributes,
  type ChangeEvent,
} from 'react';

import { cn } from '../../utils/helpers';
import { useLinkRenderer } from '../../utils/linkComponent';
import Button, { BUTTON_VARIANT } from '../Button';
import Checkbox from '../Checkbox';
import Input from '../Input';
import Pagination from '../Pagination';
import Select from '../Select';
import Stack from '../Stack';
import Text from '../Text';
import {
  DEFAULT_EDIT_LABELS,
  EditCell,
  focusEditor,
  isCellValueValid,
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
  dataIndex?: keyof T;
  sortable?: boolean;
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
   */
  width?: string | number;
  /**
   * Text alignment - LAYOUT CONTROL
   * Semantic alignment for data presentation (start for text, end for numbers).
   * Uses logical alignment for RTL support.
   */
  align?: 'start' | 'center' | 'end';
  /**
   * In-place editor of this column's cells when the DataTable is `editable`.
   * Requires `dataIndex`. In edit mode it replaces `render`.
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
  /** Enable sorting */
  sortable?: boolean;
  /** Enable row selection */
  selectable?: boolean;
  /** Enable search */
  searchable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Current page (1-indexed) */
  currentPage?: number;
  /** Page size */
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
  /** Loading state */
  loading?: boolean;
  /** Excel-like grid lines (borders on all cells) */
  gridLines?: boolean;
  /** Callback when sorting changes */
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
   * @default 'Export'
   */
  exportLabel?: string;
  /**
   * Spreadsheet-style editing of the columns that declare `edit`: cells are
   * edited in place, rows are checked to set one field on all of them (bulk
   * bar), a block copied from Excel / Sheets pastes across rows and columns.
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
  /** Labels of the bulk edit bar (translated by the consumer). */
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
}: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('dndev-table-head', className)} {...props} />;
}

function TableCell({
  className,
  ...props
}: HTMLAttributes<HTMLTableCellElement>) {
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

// Enhanced DataTable component
/**
 * High-level DataTable component with built-in sorting, filtering, search, pagination, and export.
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
 *     { key: 'name', title: 'Name', dataIndex: 'name', sortable: true },
 *     { key: 'role', title: 'Role', dataIndex: 'role' }
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
  exportLabel = 'Export',
  editable = false,
  getRowId,
  pendingChanges,
  onPendingChange,
  editLabels,
  getRowHref,
  onRowOpen,
  openLabel,
}: DataTableProps<T>): ReactNode => {
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
  const showSelection = selectable || editable;
  const rowClick = editable ? undefined : onRowClick;
  const tableRef = useRef<HTMLDivElement>(null);
  // Previous pending states, for Ctrl/Cmd+Z
  const historyRef = useRef<TablePendingChanges[]>([]);
  const [bulkKey, setBulkKey] = useState('');
  // Bulk value stays in the DOM (uncontrolled), read on Apply
  const bulkValueRef = useRef<HTMLInputElement & HTMLSelectElement>(null);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedRows, setCheckedRows] = useState<T[]>([]);

  // Page size state (for client-side pagination) - default 12
  const [internalPageSize, setInternalPageSize] = useState(12);
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

    // Apply sorting
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- why: not yet narrowed (any-audit 2026-11-11 follow-up)
        const aVal = sortColumn ? (a as Record<string, any>)[sortColumn] : '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- why: not yet narrowed (any-audit 2026-11-11 follow-up)
        const bVal = sortColumn ? (b as Record<string, any>)[sortColumn] : '';

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchQuery, sortColumn, sortDirection, columns]);

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
  const presentIds = getRowId ? new Set(data.map(getRowId)) : null;
  const selectedRows = checkedRows.filter((r) =>
    presentIds ? presentIds.has(getRowId!(r)) : data.includes(r)
  );
  const selectedIds = getRowId ? new Set(selectedRows.map(getRowId)) : null;
  const isSelected = (row: T) =>
    selectedIds ? selectedIds.has(getRowId!(row)) : selectedRows.includes(row);

  // Header checkbox selects every row of the filtered / sorted result, across
  // client-side pages; with server pagination `data` is the loaded page.
  const selectableRows = processedData;
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

  const labels = { ...DEFAULT_EDIT_LABELS, ...editLabels };
  const bulkColumn = editColumns.find((c) => c.key === bulkKey);
  const applyBulk = () => {
    if (!bulkColumn) return;
    const text = bulkValueRef.current?.value ?? '';
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

  // Industry standard pattern: When loading, pass empty rows to render actual structure
  // Component will detect empty data and render skeleton bars in cells
  const skeletonRows = Array.from({ length: 3 }, () => ({}) as T);
  const finalDisplayData = loading ? skeletonRows : displayData;

  return (
    <Stack>
      {/* Toolbar: Search + Export */}
      {(searchable || exportable) && (
        <Stack direction="row" align="center" gap="tight">
          {searchable && (
            <Stack
              direction="row"
              align="center"
              className="dndev-relative dndev-flex-1 dndev-table-search-container"
            >
              <Search className="dndev-table-search-icon" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleSearch(e.target.value)
                }
                className="dndev-table-search-input"
              />
            </Stack>
          )}
          {exportable && (
            <Button
              variant="outline"
              icon={Download}
              onClick={handleExport}
              disabled={loading || processedData.length === 0}
              display="compact"
              aria-label={exportLabel}
            >
              {exportLabel}
            </Button>
          )}
        </Stack>
      )}

      {/* Bulk edit bar: set one field on every checked row */}
      {editable && selectedRows.length > 0 && editColumns.length > 0 && (
        <Stack
          direction="row"
          align="center"
          gap="tight"
          wrap="wrap"
          className="dndev-table-bulk-bar"
          role="toolbar"
          aria-label={labels.apply}
        >
          <Text level="body">
            {labels.selected.replace('{{count}}', String(selectedRows.length))}
          </Text>
          <select
            className="dndev-table-cell-editor"
            aria-label={labels.field}
            value={bulkKey}
            onChange={(e) => setBulkKey(e.target.value)}
          >
            <option value="">{labels.field}</option>
            {editColumns.map((c) => (
              <option key={c.key} value={c.key}>
                {typeof c.title === 'string' ? c.title : c.key}
              </option>
            ))}
          </select>
          {bulkColumn?.edit?.type === 'select' ? (
            <select
              key={bulkKey}
              ref={bulkValueRef}
              className="dndev-table-cell-editor"
              aria-label={labels.value}
              defaultValue=""
            >
              <option value="" />
              {bulkColumn.edit.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={bulkKey}
              ref={bulkValueRef}
              className="dndev-table-cell-editor"
              aria-label={labels.value}
              placeholder={labels.value}
              inputMode={
                bulkColumn?.edit?.type === 'number' ? 'decimal' : undefined
              }
              defaultValue=""
              disabled={!bulkColumn}
            />
          )}
          <Button
            variant="outline"
            display="compact"
            onClick={applyBulk}
            disabled={!bulkColumn}
          >
            {labels.apply}
          </Button>
        </Stack>
      )}

      {/* Table */}
      <div ref={tableRef} className="dndev-table-edit-scope">
        <Table className={cn(gridLines && 'dndev-table-grid')}>
          <TableHeader>
            <TableRow>
              {showOpen && (
                <TableHead className="dndev-w-touch">
                  <span className="dndev-sr-only">{openLabel}</span>
                </TableHead>
              )}
              {showSelection && (
                <TableHead className="dndev-w-touch">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(column.sortable && 'dndev-cursor-pointer')}
                  data-sortable={column.sortable}
                  data-align={column.align}
                  style={{ width: column.width }}
                  onClick={(e) => {
                    // Only sort if clicking on header, not on interactive elements (buttons, inputs, etc.)
                    if (column.sortable) {
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
                  <Stack
                    direction="row"
                    align="center"
                    justify={column.align || 'start'}
                    gap="tight"
                  >
                    {typeof column.title === 'string' ? (
                      <Text level="body">{column.title}</Text>
                    ) : (
                      column.title
                    )}
                    {column.sortable &&
                      (sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="dndev-size-md" />
                        ) : (
                          <ChevronDown className="dndev-size-md" />
                        )
                      ) : (
                        <ChevronUp
                          className="dndev-size-md"
                          style={{ opacity: 0.3 }}
                        />
                      ))}
                  </Stack>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {finalDisplayData.map((row, index) => {
              const isSkeletonRow =
                loading &&
                Object.keys(row as Record<string, unknown>).length === 0;
              return (
                <TableRow
                  key={index}
                  onClick={(e) => {
                    if (rowClick && !isSkeletonRow) {
                      const target = e.target as HTMLElement;
                      // Prevent row click if clicking interactive elements
                      const isInteractive = target.closest(
                        'button, a, input, [role="button"], label'
                      );
                      if (!isInteractive) {
                        rowClick(row);
                      }
                    }
                  }}
                  className={cn(
                    isSkeletonRow && 'dndev-skeleton-row',
                    rowClick &&
                      !isSkeletonRow &&
                      'dndev-cursor-pointer dndev-hover-bg-muted'
                  )}
                >
                  {showOpen && (
                    <TableCell className="dndev-table-open-cell">
                      {isSkeletonRow ? null : onRowOpen ? (
                        <Button
                          variant="ghost"
                          display="compact"
                          icon={ArrowUpRight}
                          onClick={() => onRowOpen(row)}
                          aria-label={openLabel}
                        />
                      ) : (
                        <LinkComponent
                          href={getRowHref!(row)}
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
                    <TableCell>
                      {isSkeletonRow ? (
                        <div
                          className="dndev-skeleton dndev-skeleton-pulse"
                          style={{
                            width: 'var(--icon-md)',
                            height: 'var(--icon-md)',
                            borderRadius: 'var(--radius)',
                          }}
                          aria-hidden="true"
                        />
                      ) : (
                        <Checkbox
                          checked={isSelected(row)}
                          onCheckedChange={(checked: boolean) =>
                            handleSelectRow(row, !!checked)
                          }
                          aria-label={`Select row ${index + 1}`}
                        />
                      )}
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const cellValue = column.dataIndex
                      ? row[column.dataIndex]
                      : null;
                    const isEmpty =
                      cellValue === null ||
                      cellValue === undefined ||
                      cellValue === '';

                    const editCol = column.edit
                      ? editColumns.indexOf(column)
                      : -1;
                    if (editCol >= 0 && !isSkeletonRow) {
                      const value = currentValue(row, column);
                      const pending = pendingChanges?.[getRowId!(row)];
                      return (
                        <TableCell
                          key={column.key}
                          data-align={column.align}
                          data-editable="true"
                          data-dirty={
                            pending && column.key in pending
                              ? 'true'
                              : undefined
                          }
                          data-invalid={
                            isCellValueValid(value, column.edit!)
                              ? undefined
                              : 'true'
                          }
                        >
                          <EditCell
                            edit={column.edit!}
                            value={value}
                            position={{ row: index, col: editCol }}
                            label={
                              typeof column.title === 'string'
                                ? column.title
                                : column.key
                            }
                            commit={(v) =>
                              applyCells([{ row, column, value: v }])
                            }
                            focusCell={(p) => focusEditor(tableRef, p)}
                            pasteGrid={(grid) =>
                              pasteGrid({ row: index, col: editCol }, grid)
                            }
                            undo={undo}
                          />
                        </TableCell>
                      );
                    }

                    // Always call render function if it exists (for action columns, etc.)
                    // Let the render function decide what to show for empty/skeleton states
                    if (column.render) {
                      return (
                        <TableCell key={column.key} data-align={column.align}>
                          {column.render(cellValue, row, index)}
                        </TableCell>
                      );
                    }

                    // For data columns: show skeleton only when loading AND empty
                    // When not loading but empty, show empty string (fallback)
                    return (
                      <TableCell key={column.key} data-align={column.align}>
                        {isSkeletonRow ? (
                          <div
                            className="dndev-skeleton dndev-skeleton-pulse"
                            style={{
                              height: 'var(--gap-md)',
                              width: index % 2 === 0 ? '80%' : '60%',
                              borderRadius: 'var(--radius)',
                            }}
                            aria-hidden="true"
                          />
                        ) : isEmpty ? (
                          '' // Empty state - show nothing, not skeleton
                        ) : (
                          String(cellValue || '')
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
        />
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
