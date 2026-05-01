// packages/components/src/atomic/InfiniteScroll/index.tsx

/**
 * @fileoverview Infinite Scroll Component
 * @description Infinite scroll component for lazy loading content. Features intersection observer-based loading, customizable render functions, loading states, and end messages.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

import { GAP_VARIANT } from '../../styles/componentConstants';
import { cn, observeElement } from '../../utils';
import Spinner from '../Spinner';
import Stack from '../Stack';
import './InfiniteScroll.css';

/** Props for the InfiniteScroll component -- intersection observer-based lazy loading. */
export interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  /** Extract a stable key for each item. Falls back to index when not provided. */
  keyExtractor?: (item: T, index: number) => string | number;
  loadMore: () => void | Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  loadingComponent?: ReactNode;
  endMessage?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  itemClassName?: string;
  gridCols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'none' | 'tight' | 'medium' | 'large';
}

const InfiniteScroll = <T,>({
  items,
  renderItem,
  keyExtractor,
  loadMore,
  hasMore,
  loading = false,
  loadingComponent,
  endMessage,
  threshold = 0.1,
  rootMargin = '100px',
  className,
  itemClassName,
  gridCols = 3,
  gap = GAP_VARIANT.MEDIUM,
}: InfiniteScrollProps<T>) => {
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (loading || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await loadMore();
    } finally {
      setIsLoading(false);
    }
  }, [loadMore, loading, isLoading, hasMore]);

  // Intersection observer for load more trigger
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasMore) return;

    const cleanup = observeElement(
      element,
      (entry) => {
        if (entry.isIntersecting && !loading && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    return cleanup;
  }, [handleLoadMore, hasMore, loading, isLoading, threshold, rootMargin]);

  const gapStyle = {
    none: { gap: 'var(--gap-none)' },
    tight: { gap: 'var(--gap-sm)' },
    medium: { gap: 'var(--gap-md)' },
    large: { gap: 'var(--gap-lg)' },
  }[gap];

  const defaultLoadingComponent = (
    <Stack align="center" justify="center" className="dndev-py-lg">
      <Stack
        direction="row"
        align="center"
        gap="tight"
        className="dndev-infinite-scroll-loading-container"
      >
        <Spinner />
        <span>Loading more...</span>
      </Stack>
    </Stack>
  );

  const defaultEndMessage = (
    <Stack align="center" justify="center" className="dndev-py-lg">
      <div className="dndev-text-center dndev-infinite-scroll-end-title">
        <p className="dndev-text-lg dndev-font-medium">
          🎉 You've seen it all!
        </p>
        <p className="dndev-text-sm dndev-infinite-scroll-end-text">
          That's everything we have to showcase.
        </p>
      </div>
    </Stack>
  );

  return (
    <div className={cn('dndev-grid dndev-gap-md', className)}>
      {/* Items Grid */}
      <div
        className="dndev-infinite-scroll-grid"
        data-cols={gridCols}
        style={gapStyle}
      >
        {items.map((item, index) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : index}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load More Trigger */}
      {hasMore && (
        <Stack ref={loadMoreRef} justify="center" className="dndev-py-md">
          {loading || isLoading ? (
            loadingComponent || defaultLoadingComponent
          ) : (
            <div className="dndev-text-sm dndev-infinite-scroll-more-text">
              Scroll down to load more...
            </div>
          )}
        </Stack>
      )}

      {/* End Message */}
      {!hasMore && items.length > 0 && (
        <Stack justify="center" className="dndev-infinite-scroll-end-container">
          {endMessage || defaultEndMessage}
        </Stack>
      )}
    </div>
  );
};

export default InfiniteScroll;
