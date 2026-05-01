// packages/components/src/atomic/Label/LabelPrimitive.tsx

/**
 * @fileoverview Label Primitive
 * @description Low-level Radix UI label wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

/**
 * Label primitive props
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface LabelPrimitiveProps extends ComponentProps<
  typeof LabelPrimitive.Root
> {}

const LabelPrimitiveComponent = ({
  className,
  ...props
}: LabelPrimitiveProps) => {
  return <LabelPrimitive.Root className={cn(className)} {...props} />;
};

export { LabelPrimitiveComponent as LabelPrimitive };
