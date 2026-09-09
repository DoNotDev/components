// packages/components/src/atomic/Rating/index.tsx

/**
 * @fileoverview Rating Component
 * @description Interactive star rating component for forms and display.
 * Input mode accepts whole numbers (1-5), display mode renders fractional values.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { Star } from 'lucide-react';
import { useState, useId } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';

import { CONTROL_VARIANT, type ControlVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import './Rating.css';

const ratingVariants = cva('dndev-rating', {
  variants: {
    variant: {
      [CONTROL_VARIANT.DEFAULT]: '',
      [CONTROL_VARIANT.MUTED]: '',
      [CONTROL_VARIANT.PRIMARY]: '',
      [CONTROL_VARIANT.SECONDARY]: '',
      [CONTROL_VARIANT.ACCENT]: '',
      [CONTROL_VARIANT.SUCCESS]: '',
      [CONTROL_VARIANT.WARNING]: '',
      [CONTROL_VARIANT.DESTRUCTIVE]: '',
    },
  },
  defaultVariants: {
    variant: CONTROL_VARIANT.WARNING,
  },
});

/** Props for the Rating component -- star-based rating input/display. */
export interface RatingProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof ratingVariants> {
  /** Current rating value (1-5, supports decimals for display) */
  value?: number;
  /** Callback when rating changes (only fires whole numbers 1-5) */
  onChange?: (value: number) => void;
  /** Maximum rating value */
  max?: number;
  /** Read-only mode (no interaction) */
  readonly?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Accessible label */
  'aria-label'?: string;
  /** Show numeric value next to stars */
  showValue?: boolean;
}

/**
 * Get star fill state based on position and value
 * @param position - Star position (1-indexed)
 * @param value - Current rating value
 * @returns 'filled' | 'half' | 'empty'
 */
function getStarState(
  position: number,
  value: number
): 'filled' | 'half' | 'empty' {
  if (value >= position) return 'filled';
  if (value >= position - 0.5) return 'half';
  return 'empty';
}

/**
 * Rating component for star-based ratings
 *
 * @example
 * // Interactive (form input)
 * <Rating value={rating} onChange={setRating} />
 *
 * @example
 * // Display only (average rating)
 * <Rating value={4.3} readonly />
 */
const Rating = ({
  value = 0,
  onChange,
  max = 5,
  readonly = false,
  disabled = false,
  variant,
  className,
  showValue = false,
  'aria-label': ariaLabel,
  ...props
}: RatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;
  const isInteractive = !readonly && !disabled && onChange;

  const handleStarClick = (position: number) => {
    if (!isInteractive) return;
    onChange?.(position);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return;

    const currentValue = value || 0;
    let newValue: number | null = null;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = Math.min(currentValue + 1, max);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = Math.max(currentValue - 1, 1);
        break;
      case 'Home':
        e.preventDefault();
        newValue = 1;
        break;
      case 'End':
        e.preventDefault();
        newValue = max;
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        e.preventDefault();
        const numValue = parseInt(e.key, 10);
        if (numValue <= max) newValue = numValue;
        break;
    }

    if (newValue !== null) {
      onChange?.(newValue);
    }
  };

  const variantAttrs = getVariantDataAttrs({ variant });

  return (
    <div
      className={cn(ratingVariants({ variant }), className)}
      role={isInteractive ? 'slider' : 'img'}
      aria-label={ariaLabel ?? `Rating: ${value} out of ${max} stars`}
      aria-valuemin={1}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} out of ${max} stars`}
      aria-readonly={readonly}
      aria-disabled={disabled}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={handleKeyDown}
      data-readonly={readonly || undefined}
      data-disabled={disabled || undefined}
      {...variantAttrs}
      {...props}
    >
      <div className="dndev-rating-stars">
        {Array.from({ length: max }, (_, i) => {
          const position = i + 1;
          const state = getStarState(position, displayValue);

          return (
            <button
              key={position}
              type="button"
              className="dndev-rating-star"
              data-state={state}
              data-position={position}
              disabled={!isInteractive}
              tabIndex={-1}
              onClick={() => handleStarClick(position)}
              onMouseEnter={() => isInteractive && setHoverValue(position)}
              onMouseLeave={() => setHoverValue(null)}
              aria-hidden="true"
            >
              {state === 'half' ? (
                <span className="dndev-rating-star-half">
                  <Star className="dndev-rating-star-back" />
                  <Star className="dndev-rating-star-front" />
                </span>
              ) : (
                <Star />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="dndev-rating-value">
          {Math.min(Math.max(value, 0), max).toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default Rating;
export { ratingVariants, CONTROL_VARIANT as RATING_VARIANT };
export type { ControlVariant as RatingVariant };
