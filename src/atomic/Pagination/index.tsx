// packages/components/src/atomic/Pagination/index.tsx

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import './Pagination.css';
import { cn } from '../../utils/helpers';
import Button from '../Button';
import Select from '../Select';
import Text from '../Text';

/** Props for the Pagination component. */
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  total?: number;
  onPageSizeChange?: (pageSize: number) => void;
  maxVisible?: number;
  showNavigation?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  itemsPerPagePlaceholder?: string;
  showingLabel?: string;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize: pageSizeProp,
  total: totalProp,
  onPageSizeChange,
  maxVisible = 5, // Default to 5 to fit safe on mobile (48px * 7 items ~= 336px)
  showNavigation = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  itemsPerPagePlaceholder = 'Items per page',
  showingLabel,
  className,
}: PaginationProps) => {
  const [internalPageSize, setInternalPageSize] = useState(12);
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

  let pageSizeOptions: Array<{ value: string; label: string }> = [];
  if (typeof total === 'number' && total > 0) {
    if (total < 12) {
      pageSizeOptions = [];
    } else if (total < 36) {
      pageSizeOptions = [
        { value: '12', label: '12' },
        { value: 'all', label: String(total) },
      ];
    } else if (total < 120) {
      pageSizeOptions = [
        { value: '12', label: '12' },
        { value: '36', label: '36' },
        { value: 'all', label: String(total) },
      ];
    } else {
      pageSizeOptions = [
        { value: '12', label: '12' },
        { value: '36', label: '36' },
        { value: '120', label: '120' },
        { value: 'all', label: String(total) },
      ];
    }
  } else {
    pageSizeOptions = [
      { value: '12', label: '12' },
      { value: '36', label: '36' },
      { value: '120', label: '120' },
      { value: 'all', label: 'All' },
    ];
  }

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
  const showInfo = typeof total === 'number' && total > 0;

  const showingText =
    showInfo && showingLabel
      ? showingLabel
          .replace('{{from}}', String(startItem))
          .replace('{{to}}', String(endItem))
          .replace('{{total}}', String(total))
      : showInfo
        ? `Showing ${startItem}-${endItem} of ${total}`
        : null;

  return (
    <nav
      role="navigation"
      aria-label="pagination"
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
                {itemsPerPagePlaceholder}
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
            aria-label={previousLabel}
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
                  aria-label={`Page ${page}`}
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
            aria-label={nextLabel}
          />
        )}
      </div>
    </nav>
  );
};

export default Pagination;
