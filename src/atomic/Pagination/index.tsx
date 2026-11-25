'use client';
// packages/components/src/atomic/Pagination/index.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import './Pagination.css';
import { cn } from '../../utils/helpers';
import { componentLabel, useComponentTranslate } from '../../utils/translator';
import Button from '../Button';
import Select from '../Select';
import Text from '../Text';

/**
 * Props for the Pagination component. Every label defaults to its `dndev` namespace
 * key, translated in the UI language (ComponentLocaleProvider, mounted by the app
 * providers); a label prop overrides it.
 */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  total?: number;
  onPageSizeChange?: (pageSize: number) => void;
  maxVisible?: number;
  showNavigation?: boolean;
  /** Previous-page button. @default `dndev` key `pagination.previous` */
  previousLabel?: string;
  /** Next-page button. @default `dndev` key `pagination.next` */
  nextLabel?: string;
  /** Label of the page-size selector. @default `dndev` key `pagination.itemsPerPage` */
  itemsPerPagePlaceholder?: string;
  /**
   * Range text; `{{from}}`, `{{to}}`, `{{total}}` are replaced.
   * @default `dndev` key `pagination.showing`
   */
  showingLabel?: string;
  /**
   * Page-size choice that shows every row, when the total is unknown.
   * @default `dndev` key `pagination.all`
   * @since 0.3.8
   */
  allLabel?: string;
  /**
   * Accessible label of a page button; `{{page}}` is replaced by the page number.
   * @default `dndev` key `pagination.pageNumber`
   * @since 0.3.8
   */
  pageLabel?: string;
  /**
   * Accessible label of the pagination landmark.
   * @default `dndev` key `pagination.label`
   * @since 0.3.8
   */
  navigationLabel?: string;
  className?: string;
}

/**
 * Rows-per-page choices of the page-size selector (with "all"); the first is the
 * default page size ({@link DEFAULT_TABLE_PAGE_SIZE}).
 * @since 0.3.8
 */
export const TABLE_PAGE_SIZES = [25, 50, 100] as const;

/**
 * Rows per page of a table that is not told (`DataTable`, `Pagination`, crud lists'
 * stored preference, the `@donotdev/expo` DataTable): the one default.
 * @since 0.3.8
 */
export const DEFAULT_TABLE_PAGE_SIZE: number = TABLE_PAGE_SIZES[0];

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize: pageSizeProp,
  total: totalProp,
  onPageSizeChange,
  maxVisible = 5, // Default to 5 to fit safe on mobile (48px * 7 items ~= 336px)
  showNavigation = true,
  previousLabel,
  nextLabel,
  itemsPerPagePlaceholder,
  showingLabel,
  allLabel,
  pageLabel,
  navigationLabel,
  className,
}: PaginationProps) => {
  const translate = useComponentTranslate();
  const [internalPageSize, setInternalPageSize] = useState<number>(DEFAULT_TABLE_PAGE_SIZE);
  const pageSize = pageSizeProp ?? internalPageSize;
  const total = totalProp;

  const handlePageSizeChange = (value: string) => {
    const newPageSize = value === 'all' ? 0 : Number(value);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setInternalPageSize(newPageSize);
    }
    onPageChange(1);
  };

  const isShowingAll = pageSize === 0;
  const effectiveTotalPages = isShowingAll
    ? 1
    : total && total > 0
      ? Math.ceil(total / pageSize)
      : totalPages;

  const selectValue = isShowingAll ? 'all' : String(pageSize);

  // Table page sizes below the total, then "all"; the current size is always a
  // choice (a size stored before, e.g. 12, still shows in the selector).
  const sizes = new Set<number>(
    TABLE_PAGE_SIZES.filter((size) => typeof total !== 'number' || size < total)
  );
  if (!isShowingAll) sizes.add(pageSize);
  const pageSizeOptions: Array<{ value: string; label: string }> =
    typeof total === 'number' && total > 0 && total <= DEFAULT_TABLE_PAGE_SIZE
      ? []
      : [
          ...[...sizes]
            .sort((a, b) => a - b)
            .map((size) => ({ value: String(size), label: String(size) })),
          {
            value: 'all',
            label:
              typeof total === 'number' && total > 0
                ? String(total)
                : componentLabel(translate, allLabel, 'pagination.all'),
          },
        ];

  const showPageSizeSelector = pageSizeOptions.length > 1;

  const pageNumbers = (() => {
    if (isShowingAll) return [1];
    if (effectiveTotalPages <= maxVisible) {
      return Array.from({ length: effectiveTotalPages }, (_, i) => i + 1);
    }

    const pages: (number | 'ellipsis')[] = [];
    const half = Math.floor(maxVisible / 2);

    if (currentPage <= half + 1) {
      for (let i = 1; i <= maxVisible - 2; i++) pages.push(i);
      pages.push('ellipsis', effectiveTotalPages);
    } else if (currentPage >= effectiveTotalPages - half) {
      pages.push(1, 'ellipsis');
      for (
        let i = effectiveTotalPages - (maxVisible - 3);
        i <= effectiveTotalPages;
        i++
      )
        pages.push(i);
    } else {
      pages.push(1, 'ellipsis');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('ellipsis', effectiveTotalPages);
    }

    return pages;
  })();

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total || 0);

  const showingText =
    typeof total === 'number' && total > 0
      ? componentLabel(translate, showingLabel, 'pagination.showing', {
          from: startItem,
          to: endItem,
          total,
        })
      : null;

  return (
    <nav
      role="navigation"
      aria-label={componentLabel(translate, navigationLabel, 'pagination.label')}
      className={cn('dndev-pagination', className)}
    >
      <div className="dndev-pagination-info">
        {showingText && (
          <Text level="small" variant="muted">
            {showingText}
          </Text>
        )}
      </div>

      <div className="dndev-pagination-size">
        {showPageSizeSelector && (
          <>
            <span className="dndev-pagination-size-label">
              <Text level="small" variant="muted">
                {componentLabel(
                  translate,
                  itemsPerPagePlaceholder,
                  'pagination.itemsPerPage'
                )}
              </Text>
            </span>
            <Select
              value={selectValue}
              onValueChange={handlePageSizeChange}
              options={pageSizeOptions}
              placeholder={String(pageSize)}
            />
          </>
        )}
      </div>

      <div className="dndev-pagination-nav">
        {showNavigation && (
          <Button
            variant="ghost"
            className="dndev-pagination-button"
            icon={ChevronLeft}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label={componentLabel(translate, previousLabel, 'pagination.previous')}
          />
        )}

        <ul className="dndev-pagination-list">
          {pageNumbers.map((page, index) =>
            page === 'ellipsis' ? (
              <li key={`ellipsis-${index}`}>
                <div className="dndev-pagination-button">
                  <Text level="small" variant="muted">
                    ...
                  </Text>
                </div>
              </li>
            ) : (
              <li key={page}>
                <Button
                  variant={page === currentPage ? 'default' : 'ghost'}
                  className="dndev-pagination-button"
                  onClick={() => onPageChange(page)}
                  aria-current={page === currentPage ? 'page' : undefined}
                  aria-label={componentLabel(translate, pageLabel, 'pagination.pageNumber', {
                    page,
                  })}
                >
                  {page}
                </Button>
              </li>
            )
          )}
        </ul>

        {showNavigation && (
          <Button
            variant="ghost"
            className="dndev-pagination-button"
            icon={ChevronRight}
            onClick={() =>
              onPageChange(Math.min(effectiveTotalPages, currentPage + 1))
            }
            disabled={currentPage >= effectiveTotalPages}
            aria-label={componentLabel(translate, nextLabel, 'pagination.next')}
          />
        )}
      </div>
    </nav>
  );
};

export default Pagination;
