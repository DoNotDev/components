// packages/components/src/atomic/ScrollArea/index.tsx

/**
 * @fileoverview ScrollArea Component - Props-based API
 * @description Scrollable area component with props-based API
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  ScrollAreaPrimitive,
  ScrollAreaViewportPrimitive,
  ScrollAreaCornerPrimitive,
  ScrollBarPrimitive,
} from './ScrollAreaPrimitive';
import { cn } from '../../utils/helpers';

import type { ComponentProps, ReactNode } from 'react';

/** Props for the ScrollArea component -- custom cross-browser scrollbars. */
export interface ScrollAreaProps extends ComponentProps<
  typeof ScrollAreaPrimitive
> {
  children?: ReactNode;
  /**
   * Show horizontal scrollbar.
   * @default false
   */
  showHorizontal?: boolean;
  /**
   * Show vertical scrollbar.
   * @default true
   */
  showVertical?: boolean;
  /**
   * Position scrollbar on the end side (right in LTR, left in RTL).
   * @default false
   */
  end?: boolean;
}

/**
 * Scrollable area component with cross-browser custom scrollbars.
 * Built on Radix UI ScrollArea.
 *
 * @component
 * @example
 * ```tsx
 * <ScrollArea className="h-[200px]">
 *   <div>Long content...</div>
 * </ScrollArea>
 * ```
 * @param {ScrollAreaProps} props - The props for the scroll area
 * @returns {JSX.Element} The rendered scroll area
 */
const ScrollArea = ({
  className,
  children,
  showHorizontal = false,
  showVertical = true,
  end = false,
  ...props
}: ScrollAreaProps) => {
  return (
    <ScrollAreaPrimitive
      className={cn(
        'dndev-scroll-area',
        end && 'dndev-scroll-area-end',
        className
      )}
      {...props}
    >
      <ScrollAreaViewportPrimitive className="dndev-scroll-area-viewport">
        {children}
      </ScrollAreaViewportPrimitive>
      {showVertical && <ScrollBarPrimitive orientation="vertical" />}
      {showHorizontal && <ScrollBarPrimitive orientation="horizontal" />}
      <ScrollAreaCornerPrimitive />
    </ScrollAreaPrimitive>
  );
};

export default ScrollArea;
export { ScrollBarPrimitive as ScrollBar } from './ScrollAreaPrimitive';
export type { ScrollBarPrimitiveProps as ScrollBarProps } from './ScrollAreaPrimitive';
