// packages/components/src/advanced/Carousel/CarouselSkeleton.tsx

/**
 * @fileoverview Carousel Skeleton Component
 * @description Loading skeleton for Carousel component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import Stack from '../../atomic/Stack';
import { cn } from '../../utils/helpers';

/** Props for the Carousel loading skeleton. */
export type CarouselSkeletonProps = {
  className?: string;
  itemCount?: number;
  showArrows?: boolean;
  showDots?: boolean;
  showProgress?: boolean;
};

function CarouselSkeleton({
  className,
  itemCount = 1,
  showArrows = true,
  showDots = false,
  showProgress = false,
}: CarouselSkeletonProps) {
  return (
    <div
      className={cn('dndev-relative dndev-overflow-hidden', className)}
      role="status"
      aria-label="Loading carousel"
    >
      {/* Main carousel track skeleton */}
      <div className="dndev-overflow-hidden">
        <Stack direction="row">
          {Array.from({ length: itemCount }).map((_, index) => (
            <div key={index} className="dndev-w-full dndev-flex-shrink-0">
              <div
                className="dndev-animate-pulse"
                style={{
                  height: '16rem',
                  backgroundColor: 'var(--muted)',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>
          ))}
        </Stack>
      </div>

      {/* Navigation arrows skeleton */}
      {showArrows && (
        <>
          <div
            className="dndev-absolute dndev-z-breadcrumbs dndev-animate-pulse"
            style={{
              insetInlineStart: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
            }}
          />
          <div
            className="dndev-absolute dndev-z-breadcrumbs dndev-animate-pulse"
            style={{
              insetInlineEnd: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: 'var(--muted)',
              borderRadius: 'var(--radius)',
            }}
          />
        </>
      )}

      {/* Dots indicator skeleton */}
      {showDots && (
        <Stack
          direction="row"
          gap="tight"
          className="dndev-absolute dndev-z-breadcrumbs"
          style={{
            bottom: '1rem',
            insetInlineStart: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {Array.from({ length: itemCount }).map((_, index) => (
            <div
              key={index}
              className="dndev-animate-pulse"
              style={{
                width: '0.5rem',
                height: '0.5rem',
                backgroundColor: 'var(--muted)',
                borderRadius: '9999px',
              }}
            />
          ))}
        </Stack>
      )}

      {/* Progress bar skeleton */}
      {showProgress && (
        <div
          className="dndev-absolute dndev-animate-pulse"
          style={{
            bottom: 0,
            insetInlineStart: 0,
            insetInlineEnd: 0,
            height: '0.25rem',
            backgroundColor: 'var(--muted)',
          }}
        />
      )}
    </div>
  );
}

export default CarouselSkeleton;
