// packages/components/src/atomic/ScrollArea/ScrollAreaPrimitive.tsx

/**
 * @fileoverview ScrollArea Primitive
 * @description Low-level Radix UI scroll area wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const ScrollAreaPrimitiveRoot = ScrollAreaPrimitive.Root;
const ScrollAreaViewportPrimitive = ScrollAreaPrimitive.Viewport;
const ScrollAreaCornerPrimitive = ScrollAreaPrimitive.Corner;

export interface ScrollBarPrimitiveProps extends ComponentProps<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
> {}

const ScrollBarPrimitive = ({
  className,
  orientation = 'vertical',
  ...props
}: ScrollBarPrimitiveProps) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    orientation={orientation}
    className={cn('dndev-scroll-bar', className)}
    data-orientation={orientation}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className="dndev-scroll-bar-thumb"
      data-orientation={orientation}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);

export { ScrollAreaPrimitiveRoot as ScrollAreaPrimitive };
export {
  ScrollAreaViewportPrimitive,
  ScrollAreaCornerPrimitive,
  ScrollBarPrimitive,
};
