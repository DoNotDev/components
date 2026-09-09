// packages/components/src/atomic/Tooltip/TooltipPrimitive.tsx

/**
 * @fileoverview Tooltip component
 * @description Accessible tooltip component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const TooltipProvider = TooltipPrimitive.Provider;
const TooltipPrimitiveComponent = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps extends ComponentProps<
  typeof TooltipPrimitive.Content
> {
  className?: string;
  sideOffset?: number;
}

function TooltipContent({
  className,
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        'dndev-notification dndev-tooltip',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
}

export { TooltipPrimitiveComponent as TooltipPrimitive };
export { TooltipTrigger, TooltipContent, TooltipProvider };
