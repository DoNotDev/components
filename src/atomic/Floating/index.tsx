'use client';
// packages/components/src/atomic/Floating/index.tsx

/**
 * @fileoverview Floating component
 * @description Container for one small control (a back link, a help button) that stays on
 * screen while the page scrolls, at a corner of the page content area.
 *
 * @version 0.2.0
 * @since 0.3.5
 * @author AMBROISE PARK Consulting
 */

import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/helpers';
import { PortalPrimitive } from '../Portal/PortalPrimitive';

import './Floating.css';

/** Corner of the page content area the control sits in (logical: `start` / `end` follow RTL). */
export type FloatingPlacement =
  'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/** Props for Floating. Other div attributes (`className`, `aria-*`, `id`, ...) go to the container. */
export interface FloatingProps extends HTMLAttributes<HTMLDivElement> {
  /** The control, composed by the app (Button, Link...). */
  children: ReactNode;
  /**
   * Corner the control sits in.
   * @default 'top-start'
   */
  placement?: FloatingPlacement;
}

/**
 * Container for one small control that stays on screen while the page scrolls. It is as
 * wide as its content; the rest of the page stays clickable. Layer `--z-header`, as
 * ActionBar: above the page, below sheets, modals, floating menus and toasts. No motion.
 * Not a landmark: give the control its own accessible name (visible text or `aria-label`).
 *
 * Top placements (`top-start`, `top-end`): in the page flow, `position: sticky`.
 * - Place it first in the page (first child of `PageContainer`, before the first `Section`).
 * - At rest: `--gap-md` above (below the header) and `--gap-md` below, then the page content:
 *   a ghost `Section` right after it drops its own top padding (Section.css), so the gap
 *   above the control and the gap to the Section's first line are both `--gap-md`, at every
 *   width. It takes its own space: nothing sits under it.
 * - While scrolling: sticks `--gap-md` below the top of the scroll container (the layout
 *   `<main>`, under the header), until the end of its parent (the page).
 * - Inline: the Section content gutter (`--section-gutter`: `--gap-md`, `--gap-lg` from 1024px); inside
 *   `PageContainer`, which already pads `--gap-md`, only the rest. Logical: RTL-aware.
 * - SSR: rendered in place, in the server HTML; hydrates without a mismatch, shifts nothing.
 *
 * Bottom placements (`bottom-start`, `bottom-end`): `position: fixed`, portalled to `<body>`
 * (a `contain: layout` or scrolling ancestor such as the layout `<main>` would otherwise
 * capture `position: fixed`); they take no space, so leave room at the end of the page.
 * - Block: `--gap-md` above the bottom edge, above the bottom safe area (iOS home indicator,
 *   with `viewport-fit=cover`) and above a shown `ActionBar` (`--action-bar-height`).
 * - Inline: the Section gutter, after the sidebar on the start side (`--sidebar-width`),
 *   never inside the side safe areas.
 * - SSR: renders nothing on the server and on the hydration render (the portal needs
 *   `document`); mounts right after hydration. Fixed, so its arrival shifts no layout.
 *
 * @component
 * @example
 * ```tsx
 * <PageContainer>
 *   <Floating placement="top-start">
 *     <Button variant="outline" onClick={() => navigate('/catalogue')}>
 *       {t('catalogue.back')}
 *     </Button>
 *   </Floating>
 *   <Section>...</Section>
 * </PageContainer>
 * ```
 */
function Floating({
  children,
  placement = 'top-start',
  className,
  ...props
}: FloatingProps) {
  const container = (
    <div
      {...props}
      className={cn('dndev-floating-control', className)}
      data-placement={placement}
    >
      {children}
    </div>
  );

  if (placement === 'top-start' || placement === 'top-end') return container;

  return <PortalPrimitive asChild>{container}</PortalPrimitive>;
}

export default Floating;
