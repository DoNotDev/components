'use client';
// packages/components/src/atomic/ActionBar/index.tsx

/**
 * @fileoverview ActionBar component
 * @description Page action bar fixed to the bottom of the viewport (e.g. price + add to cart on a
 * phone product page). Optionally hidden from a breakpoint up, and optionally shown only once a
 * reference element (the buy card) has scrolled up out of view.
 *
 * @version 0.1.0
 * @since 0.3.5
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useState } from 'react';
import type { HTMLAttributes, ReactNode, RefObject } from 'react';

import { cn } from '../../utils/helpers';
import { PortalPrimitive } from '../Portal/PortalPrimitive';

import './ActionBar.css';

/** Custom property on `<html>` holding the shown bar's height (e.g. `64px`); absent while hidden. */
const HEIGHT_VAR = '--action-bar-height';

/**
 * Breakpoint from which ActionBar is not shown (framework breakpoints: tablet >= 768px,
 * laptop >= 1024px, desktop >= 1440px). `mobile` is excluded: it would never show.
 */
export type ActionBarBreakpoint = 'tablet' | 'laptop' | 'desktop';

/** Props for ActionBar. Other div attributes (`aria-label`, `role`, `id`, ...) go to the bar. */
export interface ActionBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Bar content, composed by the app (Stack, Text, Button, QuantityStepper...). */
  children: ReactNode;
  /**
   * Breakpoint from which the bar is not shown (CSS media query, no JS).
   * @example 'laptop' - phones and tablets only
   * @default undefined - shown at every width
   */
  hideFrom?: ActionBarBreakpoint;
  /**
   * Ref to a reference element (e.g. the buy card). The bar shows only while that element
   * has scrolled up out of view (above the visible area), and hides while any part of it is
   * visible or while it is still below the visible area (not reached yet).
   * The element must be mounted when ActionBar mounts.
   * @default undefined - always shown
   */
  revealAfter?: RefObject<Element | null>;
}

/**
 * Bar fixed to the bottom of the viewport, portalled to `<body>` (a `contain: layout` or
 * scrolling ancestor such as the layout `<main>` would otherwise capture `position: fixed`).
 *
 * - Reserved space: while shown, its measured height (ResizeObserver) is set as
 *   `--action-bar-height` on `<html>`, removed when it hides, unmounts or is `display: none`
 *   (`hideFrom`). DnDevLayout pads its bottom with it, so the end of the page and the footer
 *   scroll above the bar instead of under it; content above the reading position does not
 *   move. A custom scroll container outside DnDevLayout reserves it the same way:
 *   `padding-block-end: var(--action-bar-height, 0px)`. Above page chrome (`--z-header`),
 *   below sheets, modals, floating menus and toasts. Bottom safe area (iOS home indicator)
 *   is padded when the app sets `viewport-fit=cover`.
 * - One shown bar per page: bars share the bottom edge and the reserved-space property.
 * - SSR: renders nothing on the server and on the hydration render (no mismatch, property
 *   absent); mounts after hydration, hidden when `revealAfter` is set (nothing reserved at
 *   load, no layout shift).
 * - Hidden state: slid below the viewport, `visibility: hidden`, `inert` and `aria-hidden`
 *   (not focusable, not announced). The slide is off under `prefers-reduced-motion`.
 * - Not a landmark by default: pass `role="region"` and a translated `aria-label` to make it one.
 *
 * Visibility uses one IntersectionObserver: it reacts when the reference element enters or
 * leaves the visible area, so an instant jump from "scrolled past" to "not reached yet" with no
 * frame where the element is visible keeps the bar shown until the element next crosses an edge.
 *
 * @component
 * @example
 * ```tsx
 * const buyCard = useRef<HTMLDivElement>(null);
 * <Card ref={buyCard}>...</Card>
 * <ActionBar hideFrom="laptop" revealAfter={buyCard}>
 *   <Stack direction="row" align="center" justify="between">
 *     <Text weight="bold">{price}</Text>
 *     <Button onClick={add}>{t('cart.add')}</Button>
 *   </Stack>
 * </ActionBar>
 * ```
 */
function ActionBar({
  children,
  hideFrom,
  revealAfter,
  className,
  ...props
}: ActionBarProps) {
  const [shown, setShown] = useState(!revealAfter);
  // State, not a ref: the portal mounts the bar after hydration, a render after this one.
  const [bar, setBar] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!revealAfter) {
      setShown(true);
      return;
    }
    setShown(false);
    const target = revealAfter.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      // Out of view: above (scrolled past) when its bottom is in the upper half of the
      // viewport. A scrolling ancestor clips it below the viewport top (e.g. under a header),
      // so the viewport top itself is not the edge to compare with.
      setShown(
        !entry.isIntersecting &&
          entry.boundingClientRect.bottom < window.innerHeight / 2
      );
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [revealAfter]);

  // Reserve the bar's height while shown (border box, safe-area padding included; the slide
  // transform does not change it). 0 = `display: none` from hideFrom: nothing to reserve.
  useEffect(() => {
    if (!shown || !bar) return;
    const rootStyle = document.documentElement.style;
    const observer = new ResizeObserver(() => {
      const height = bar.offsetHeight;
      if (height) rootStyle.setProperty(HEIGHT_VAR, `${height}px`);
      else rootStyle.removeProperty(HEIGHT_VAR);
    });
    observer.observe(bar);
    return () => {
      observer.disconnect();
      rootStyle.removeProperty(HEIGHT_VAR);
    };
  }, [shown, bar]);

  return (
    <PortalPrimitive asChild>
      <div
        {...props}
        ref={setBar}
        className={cn('dndev-action-bar', className)}
        data-hide-from={hideFrom}
        data-open={shown ? '' : undefined}
        aria-hidden={shown ? undefined : true}
        inert={!shown}
      >
        {children}
      </div>
    </PortalPrimitive>
  );
}

export default ActionBar;
