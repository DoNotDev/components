// packages/components/src/atomic/Popover/index.tsx

/**
 * @fileoverview Popover component
 * @description Accessible popover component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ReactNode } from 'react';

import {
  PopoverPrimitive,
  PopoverTrigger,
  PopoverContent,
} from './PopoverPrimitive';
import { FLOATING_VARIANT, type FloatingVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

/**
 * Popover subcomponents for advanced usage
 */
const PopoverRoot = PopoverPrimitive;
const PopoverTriggerComponent = PopoverTrigger;
const PopoverContentComponent = PopoverContent;

/**
 * Popover variant constants - re-exported from shared FLOATING_VARIANT
 * Matches .dndev-floating CSS class
 * Applies to all floating components (Popover, DropdownMenu, Select, HoverCard, Tooltip, etc.)
 */
export const POPOVER_VARIANT = FLOATING_VARIANT;

/** Props for the Popover component. */
export interface PopoverProps {
  /** Trigger element (button, text, etc.) */
  trigger?: ReactNode;
  /** Popover content */
  children?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Alignment relative to trigger */
  align?: 'start' | 'center' | 'end';
  /** Side to show popover */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Side offset in pixels */
  sideOffset?: number;
  /** Optional variant for themed popovers */
  variant?: FloatingVariant;
  /** Additional CSS classes */
  className?: string;
  /** Whether popover is modal (blocks interaction with rest of page) */
  modal?: boolean;
  /** Handler for outside click */
  onInteractOutside?: (event: Event) => void;
}

/**
 * Accessible popover component built on Radix UI primitives.
 * Displays rich content in a portal, triggered by a button.
 *
 * @component
 * @example
 * ```tsx
 * <Popover trigger={<Button>Open</Button>}>
 *   <div className="p-4">Popover content</div>
 * </Popover>
 * ```
 * @param {PopoverProps} props - The props for the popover
 * @returns {JSX.Element} The rendered popover
 */
const Popover = ({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  variant,
  className,
  modal = true,
  onInteractOutside,
}: PopoverProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });

  return (
    <PopoverPrimitive open={open} onOpenChange={onOpenChange} modal={modal}>
      {trigger && <PopoverTrigger asChild>{trigger}</PopoverTrigger>}
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn('dndev-floating', className)}
        {...variantAttrs}
        onInteractOutside={onInteractOutside}
      >
        {children}
      </PopoverContent>
    </PopoverPrimitive>
  );
};

Popover.Root = PopoverRoot;
Popover.Trigger = PopoverTriggerComponent;
Popover.Content = PopoverContentComponent;

export default Popover as typeof Popover & {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTriggerComponent;
  Content: typeof PopoverContentComponent;
};
