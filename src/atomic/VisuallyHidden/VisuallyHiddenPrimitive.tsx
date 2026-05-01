// packages/components/src/atomic/VisuallyHidden/VisuallyHiddenPrimitive.tsx

/**
 * @fileoverview VisuallyHidden Primitive Component
 * @description Clean Radix UI wrapper for visually hidden content (screen reader only)
 */

import * as VisuallyHiddenRadix from '@radix-ui/react-visually-hidden';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

const VisuallyHiddenPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof VisuallyHiddenRadix.Root>) => (
  <VisuallyHiddenRadix.Root className={cn(className)} {...props} />
);

export { VisuallyHiddenPrimitive };
