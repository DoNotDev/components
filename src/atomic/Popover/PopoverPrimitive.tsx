// packages/components/src/atomic/Popover/PopoverPrimitive.tsx

/**
 * @fileoverview Popover Primitive
 * @description Radix UI Popover primitives - low-level building blocks
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = ({
  className,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  collisionPadding = 8,
  onCloseAutoFocus,
  onInteractOutside,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content> & {
  onCloseAutoFocus?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
}) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        onCloseAutoFocus={onCloseAutoFocus}
        onInteractOutside={
          onInteractOutside
            ? (e) => {
                const target = e.target as HTMLElement;
                const content = e.currentTarget as HTMLElement;
                if (content.contains(target)) {
                  e.preventDefault();
                  return;
                }
                onInteractOutside(e);
              }
            : undefined
        }
        className={cn(className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
};

export { Popover as PopoverPrimitive };
export { PopoverTrigger, PopoverContent };
