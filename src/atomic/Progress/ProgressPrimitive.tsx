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
    <ProgressPrimitive.Root
      value={value}
      aria-valuenow={value ?? 0}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        {...variantAttrs}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};

export { ProgressPrimitiveComponent as ProgressPrimitive };
