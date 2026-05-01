// packages/components/src/atomic/Toggle/TogglePrimitive.tsx

/**
 * @fileoverview Toggle Primitive
 * @description Themed Radix UI toggle wrapper for power users and internal composition
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as TogglePrimitive from '@radix-ui/react-toggle';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ElementRef,
} from 'react';

import { cn } from '../../utils/helpers';

const TogglePrimitiveComponent = forwardRef<
  ElementRef<typeof TogglePrimitive.Root>,
  ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(className)} {...props} />
));

TogglePrimitiveComponent.displayName = 'TogglePrimitive';

export { TogglePrimitiveComponent as TogglePrimitive };
