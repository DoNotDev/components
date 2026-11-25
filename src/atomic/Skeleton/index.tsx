// packages/components/src/atomic/Skeleton/index.tsx

/**
 * @fileoverview Skeleton component
 * @description Skeleton component for loading states
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useId } from 'react';

import { ComponentLabelText } from '../../utils/ComponentLabelText';
import { cn } from '../../utils/helpers';

/** Props for the Skeleton component -- loading placeholder with animation. */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Animation variant */
  variant?: 'pulse' | 'wave' | 'shimmer' | 'none';
  /** Size preset for common content types */
  size?: 'text' | 'heading' | 'avatar' | 'button' | 'card' | 'image' | 'custom';
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
  /** Number of lines for text skeleton */
  lines?: number;
  /**
   * Accessible name. Default: `dndev:messages.loading` in the UI language, as hidden
   * text that names the status (`aria-labelledby`); a given value is used as is.
   */
  'aria-label'?: string;
}

const sizePresets = {
  text: { height: 'var(--gap-md)', width: '100%' },
  heading: { height: 'var(--icon-touch)', width: '100%' },
  avatar: {
    height: 'var(--icon-touch)',
    width: 'var(--icon-touch)',
    borderRadius: 'var(--radius-full)',
  },
  button: { height: 'var(--icon-touch)', width: '100%' },
  card: { height: '8rem', width: '100%' },
  image: { height: '12rem', width: '100%' },
  custom: { width: '100%' },
};

const animationClasses = {
  pulse: 'dndev-skeleton-pulse',
  wave: 'dndev-skeleton-wave',
  shimmer: 'dndev-skeleton-shimmer',
  none: '',
};

/**
 * Skeleton component for loading states.
 *
 * Features:
 * - Multiple animation variants (pulse, wave, shimmer)
 * - Size presets for common content types
 * - Content-aware sizing
 * - Full ARIA compliance
 * - Customizable dimensions
 *
 * @component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 * @example
 * ```tsx
 * <Skeleton size="text" lines={3} />
 * <Skeleton size="avatar" variant="wave" />
 * <Skeleton width="200px" height="40px" />
 * ```
 * @param {SkeletonProps} props - The props for the skeleton
 * @returns {JSX.Element} The rendered skeleton
 */
function Skeleton({
  className,
  variant = 'pulse',
  size = 'custom',
  width,
  height,
  lines = 1,
  'aria-label': ariaLabel,
  ...props
}: SkeletonProps) {
  const labelId = useId();
  // The app's label as is; else the translated default, as the hidden text naming it
  const name =
    ariaLabel !== undefined
      ? { 'aria-label': ariaLabel }
      : { 'aria-labelledby': labelId };
  const label =
    ariaLabel !== undefined ? (
      <span className="dndev-sr-only">{ariaLabel}</span>
    ) : (
      <span id={labelId} className="dndev-sr-only">
        <ComponentLabelText labelKey="messages.loading" />
      </span>
    );
  const sizeStyles = sizePresets[size];
  const animationClass = animationClasses[variant];

  const style = {
    ...sizeStyles,
    // Width: explicit width prop overrides preset, otherwise use preset (defaults to 100%)
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    // Height: explicit height prop overrides preset
    ...(height && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
    // User-provided style overrides everything
    ...props.style,
  };

  if (lines > 1) {
    return (
      <div
        role="status"
        aria-busy="true"
        {...name}
        className={cn('dndev-grid dndev-gap-sm', className)}
        {...props}
      >
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn('dndev-skeleton', animationClass)}
            style={i === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
        {label}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      {...name}
      className={cn('dndev-skeleton', animationClass, className)}
      style={style}
      {...props}
    >
      {label}
    </div>
  );
}

export default Skeleton;
