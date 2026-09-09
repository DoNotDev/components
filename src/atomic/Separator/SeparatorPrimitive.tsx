// packages/components/src/atomic/Separator/SeparatorPrimitive.tsx

/**
 * @fileoverview Separator Primitive
 * @description Radix UI Separator wrapper - internal use only
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

export interface SeparatorPrimitiveProps extends ComponentProps<
  typeof SeparatorPrimitive.Root
> {}

const SeparatorPrimitiveComponent = ({
  className,
  ...props
}: SeparatorPrimitiveProps) => {
  return (
    <SeparatorPrimitive.Root
      className={cn('dndev-separator', className)}
      {...props}
    />
  );
};

export { SeparatorPrimitiveComponent as SeparatorPrimitive };
