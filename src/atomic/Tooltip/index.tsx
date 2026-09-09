'use client';
// packages/components/src/atomic/Tooltip/index.tsx

/**
 * @fileoverview Tooltip component
 * @description Accessible tooltip built on Radix UI primitives.
 *
 * Positioning: prop > CSS --tooltip-side > 'bottom'
 * Smart hiding: Tooltip auto-hides when trigger has visible label
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  TooltipPrimitive,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './TooltipPrimitive';
import { FLOATING_VARIANT, type FloatingVariant } from '../../utils/constants';
import { getVariantDataAttrs } from '../../utils/helpers';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

/** Props for the Tooltip component. */
export interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  /** Tooltip position. Priority: prop > CSS --tooltip-side > 'bottom' */
  side?: TooltipSide;
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  variant?: FloatingVariant;
  /** Force tooltip open regardless of hover state */
  forceOpen?: boolean;
}

/**
 * Check if trigger element has a visible label.
 * Returns true if label exists and has width (not hidden).
 */
function hasVisibleLabel(element: HTMLElement | null): boolean {
  if (!element) return false;
  const label = element.querySelector('.dndev-interactive-label');
  return label instanceof HTMLElement && label.offsetWidth > 0;
}

/**
 * Accessible tooltip component.
 *
 * Auto-hides when trigger has visible label (e.g., button not in compact mode).
 * Only shows tooltip when label is hidden, avoiding redundant information.
 *
 * Positioning priority:
 * 1. Explicit `side` prop
 * 2. CSS `--tooltip-side` property (set by container like Sidebar)
 * 3. Default 'bottom'
 *
 * @example
 * // Explicit side
 * <Tooltip content="Help" side="right">...</Tooltip>
 *
 * @example
 * // Container-aware (sidebar sets --tooltip-side: right)
 * <Tooltip content="Help">...</Tooltip>
 */
function Tooltip({
  content,
  children,
  side,
  align = 'center',
  delayDuration = 300,
  variant,
  forceOpen,
}: TooltipProps) {
  const [mounted, setMounted] = useState(false);
  const [cssSide, setCssSide] = useState<TooltipSide | null>(null);
  const [open, setOpen] = useState(false);
  const triggerElement = useRef<HTMLElement | null>(null);

  // forceOpen overrides internal state
  const isOpen = forceOpen ?? open;

  // Callback ref - fires when element mounts, reads CSS var immediately
  const triggerRef = (node: HTMLElement | null) => {
    triggerElement.current = node;
    if (node) {
      setMounted(true);
      const val = getComputedStyle(node)
        .getPropertyValue('--tooltip-side')
        .trim() as TooltipSide | '';
      if (val) setCssSide(val);
    }
  };

  // Handle open change - skip if label is visible
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && hasVisibleLabel(triggerElement.current)) {
      return; // Label visible, don't show tooltip
    }
    setOpen(nextOpen);
  };

  // Priority: prop > CSS > 'bottom'
  const finalSide = side ?? cssSide ?? 'bottom';

  const variantAttrs = getVariantDataAttrs({
    variant: variant !== FLOATING_VARIANT.DEFAULT ? variant : undefined,
  });

  // Always pass open/onOpenChange to avoid controlled/uncontrolled switch
  // During SSR (!mounted), open=false keeps it controlled but closed
  return (
    <TooltipProvider>
      <TooltipPrimitive
        delayDuration={delayDuration}
        open={mounted ? isOpen : false}
        onOpenChange={handleOpenChange}
      >
        <TooltipTrigger asChild ref={triggerRef}>
          {children}
        </TooltipTrigger>
        {mounted && (
          <TooltipContent side={finalSide} align={align} {...variantAttrs}>
            {content}
          </TooltipContent>
        )}
      </TooltipPrimitive>
    </TooltipProvider>
  );
}

export default Tooltip;
export { TooltipProvider };
