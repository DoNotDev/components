// packages/components/src/advanced/Marquee/MarqueeSkeleton.tsx

/**
 * @fileoverview Marquee Skeleton Component
 * @description Loading skeleton for Marquee component
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useId } from 'react';

import Stack from '../../atomic/Stack';
import { GAP_VARIANT } from '../../styles/componentConstants';
import { ComponentLabelText } from '../../utils/ComponentLabelText';
import { cn } from '../../utils/helpers';

/** Props for the Marquee loading skeleton. */
export type MarqueeSkeletonProps = {
  className?: string;
  itemCount?: number;
  itemWidth?: string;
  gap?: 'none' | 'tight' | 'medium' | 'large';
  direction?: 'horizontal' | 'vertical';
};

const GAP_VALUE: Record<NonNullable<MarqueeSkeletonProps['gap']>, string> = {
  none: 'var(--gap-none)',
  tight: 'var(--gap-sm)',
  medium: 'var(--gap-md)',
  large: 'var(--gap-lg)',
};

function MarqueeSkeleton({
  className,
  itemCount = 8,
  itemWidth,
  gap = GAP_VARIANT.MEDIUM,
  direction = 'horizontal',
}: MarqueeSkeletonProps) {
  const labelId = useId();
  const isVertical = direction === 'vertical';

  return (
    <div
      className={cn('dndev-relative dndev-overflow-hidden', className)}
      role="status"
      // Named by the hidden text: `dndev:messages.loading` in the UI language
      aria-labelledby={labelId}
    >
      <span id={labelId} className="dndev-sr-only">
        <ComponentLabelText labelKey="messages.loading" />
      </span>
      <Stack
        direction={isVertical ? 'column' : 'row'}
        align={!isVertical ? 'center' : undefined}
        gap={gap}
      >
        {Array.from({ length: itemCount * 2 }).map((_, idx) => (
          <div
            key={idx}
            className="dndev-flex-shrink-0 dndev-animate-pulse"
            style={
              isVertical
                ? {
                    height: '4rem',
                    width: '100%',
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius-surface)',
                  }
                : {
                    height: '4rem',
                    width: itemWidth || '4rem',
                    backgroundColor: 'var(--muted)',
                    borderRadius: 'var(--radius-surface)',
                  }
            }
          />
        ))}
      </Stack>
    </div>
  );
}

export default MarqueeSkeleton;
