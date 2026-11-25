'use client';
// packages/components/src/atomic/Progress/ProgressPrimitive.tsx

/**
 * @fileoverview Progress Primitive
 * @description Low-level Radix UI progress wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as ProgressPrimitive from '@radix-ui/react-progress';
import type { ComponentProps } from 'react';

import { cn, getVariantDataAttrs } from '../../utils/helpers';

export interface ProgressPrimitiveProps extends ComponentProps<
  typeof ProgressPrimitive.Root
> {
  /**
   * Visual variant of the progress bar.
   * @default 'default'
   */
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'destructive';
}

/**
 * Accessible progress bar component built on Radix UI Progress.
 *
 * @component
 * @example
 * ```tsx
 * <Progress value={50} variant="success" />
 * // Unknown duration (indeterminate): no `value`
 * <Progress aria-label="Loading" />
 * ```
 * @param {ProgressPrimitiveProps} props - The props for the progress bar
 * @returns {JSX.Element} The rendered progress bar
 */
const ProgressPrimitiveComponent = ({
  className,
  value,
  variant = 'default',
  ...props
}: ProgressPrimitiveProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });

  return (
    <ProgressPrimitive.Root value={value} className={cn(className)} {...props}>
      <ProgressPrimitive.Indicator
        {...variantAttrs}
        style={
          typeof value === 'number'
            ? { transform: `translateX(-${100 - value}%)` }
            : undefined
        }
      />
    </ProgressPrimitive.Root>
  );
};

export { ProgressPrimitiveComponent as ProgressPrimitive };
