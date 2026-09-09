// packages/components/src/hooks/useSwipeToClose.ts

/**
 * @fileoverview useSwipeToClose Hook - Swipe Gesture Detection
 * @description Reusable hook for swipe-to-close functionality on mobile overlays
 *
 * **Features:**
 * - Velocity-based dismissal (fast swipe closes even with small distance)
 * - Distance threshold (50px minimum)
 * - Visual feedback during drag with resistance
 * - Respects scrollable content (only triggers at boundaries)
 * - Works on all devices (touch, mouse, pen)
 * - SSR safe
 *
 * **Performance:**
 * - Uses useRef for state (no re-renders)
 * - useCallback for stable handlers
 * - No manual event listeners (React handles cleanup)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, useCallback } from 'react';
import type { RefObject, PointerEvent } from 'react';

/** Options for the useSwipeToClose hook. */
export interface UseSwipeToCloseOptions {
  /** Direction of swipe to close ('down' | 'up' | 'left' | 'right' | 'both') */
  direction?: 'down' | 'up' | 'left' | 'right' | 'both';
  /** Distance threshold in pixels (default: 50) */
  distanceThreshold?: number;
  /** Velocity threshold in px/ms (default: 0.5) */
  velocityThreshold?: number;
  /** Whether to check scroll boundaries (default: true) */
  checkScrollBoundary?: boolean;
  /** Selector for scrollable content (default: '[class*="overflow"]') */
  scrollableSelector?: string;
  /** Ref to hidden close button (Radix Close component) */
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  /** Callback to close (alternative to closeButtonRef.click()) */
  onClose?: () => void;
  /** Whether swipe is enabled (default: true) */
  enabled?: boolean;
  /** Custom transform function (default: translateY/translateX based on direction) */
  getTransform?: (translateX: number, translateY: number) => string;
}

/** Return value of the useSwipeToClose hook. */
export interface UseSwipeToCloseReturn {
  /** Ref to attach to the element */
  ref: RefObject<HTMLDivElement | null>;
  /** Pointer down handler */
  onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  /** Pointer move handler */
  onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  /** Pointer up handler */
  onPointerUp: (e: PointerEvent<HTMLDivElement>) => void;
  /** Pointer cancel handler */
  onPointerCancel: (e: PointerEvent<HTMLDivElement>) => void;
}

/**
 * useSwipeToClose - Swipe gesture detection hook
 *
 * Provides swipe-to-close functionality for mobile overlays (sheets, dialogs).
 * Uses Pointer Events API for cross-device support (touch/mouse/pen).
 *
 * @param options - Configuration options
 * @returns Event handlers and ref to attach to element
 *
 * @example Sheet (top/bottom)
 * ```tsx
 * function SheetContent({ side }) {
 *   const closeRef = useRef<HTMLButtonElement>(null);
 *   const { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
 *     useSwipeToClose({
 *       direction: side === 'top' ? 'down' : 'up',
 *       closeButtonRef: closeRef,
 *     });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       onPointerDown={onPointerDown}
 *       onPointerMove={onPointerMove}
 *       onPointerUp={onPointerUp}
 *       onPointerCancel={onPointerCancel}
 *     >
 *       <SheetClose ref={closeRef} className="dndev-sr-only">Close</SheetClose>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Dialog (swipe down)
 * ```tsx
 * function DialogContent() {
 *   const closeRef = useRef<HTMLButtonElement>(null);
 *   const { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
 *     useSwipeToClose({
 *       direction: 'down',
 *       closeButtonRef: closeRef,
 *     });
 *
 *   return (
 *     <div
 *       ref={ref}
 *       onPointerDown={onPointerDown}
 *       onPointerMove={onPointerMove}
 *       onPointerUp={onPointerUp}
 *       onPointerCancel={onPointerCancel}
 *     >
 *       <DialogClose ref={closeRef} className="dndev-sr-only">Close</DialogClose>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useSwipeToClose(
  options: UseSwipeToCloseOptions
): UseSwipeToCloseReturn {
  const {
    direction = 'down',
    distanceThreshold = 50,
    velocityThreshold = 0.5,
    checkScrollBoundary = true,
    scrollableSelector = '[class*="overflow"]',
    closeButtonRef,
    onClose,
    enabled = true,
    getTransform,
  } = options;

  const contentRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    startTime: number;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!enabled || typeof window === 'undefined') {
        return;
      }

      const content = contentRef.current;
      if (!content) return;

      // Don't capture pointer events on interactive elements (buttons, links, inputs, dropdowns, command items, etc.)
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.hasAttribute('role') ||
        target.closest(
          'button, a, input, textarea, select, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], [role="tab"], [role="link"], [data-radix-collection-item], [data-radix-select-item]'
        );

      if (isInteractive) {
        return;
      }

      if (checkScrollBoundary) {
        const scrollableElements = content.querySelectorAll(scrollableSelector);
        const elementCount = scrollableElements.length;

        // Early exit if no scrollable elements
        if (elementCount > 0) {
          // Batch all DOM reads first to minimize reflows
          // Read all values in one pass before doing any comparisons
          const scrollData: Array<{
            scrollTop: number;
            scrollLeft: number;
            clientHeight: number;
            scrollHeight: number;
            clientWidth: number;
            scrollWidth: number;
          }> = [];

          for (let i = 0; i < elementCount; i++) {
            const el = scrollableElements[i] as HTMLElement;
            scrollData.push({
              scrollTop: el.scrollTop,
              scrollLeft: el.scrollLeft,
              clientHeight: el.clientHeight,
              scrollHeight: el.scrollHeight,
              clientWidth: el.clientWidth,
              scrollWidth: el.scrollWidth,
            });
          }

          // Now do comparisons without forcing additional reflows
          for (const data of scrollData) {
            const isAtTop = data.scrollTop === 0;
            const isAtBottom =
              data.scrollTop + data.clientHeight >= data.scrollHeight - 1;
            const isAtLeft = data.scrollLeft === 0;
            const isAtRight =
              data.scrollLeft + data.clientWidth >= data.scrollWidth - 1;

            // If we can scroll in this direction, don't allow swipe-to-close
            if (direction === 'down' && !isAtTop) return;
            if (direction === 'up' && !isAtBottom) return;
            if (direction === 'left' && !isAtRight) return;
            if (direction === 'right' && !isAtLeft) return;
            if (
              direction === 'both' &&
              !isAtTop &&
              !isAtBottom &&
              !isAtLeft &&
              !isAtRight
            )
              return;
          }
        }
      }

      dragStateRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        startTime: Date.now(),
      };

      content.setPointerCapture(e.pointerId);
      content.style.transition = 'none';
    },
    [enabled, direction, checkScrollBoundary, scrollableSelector]
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current?.isDragging) return;

      const content = contentRef.current;
      if (!content) return;

      const deltaX = e.clientX - dragStateRef.current.startX;
      const deltaY = e.clientY - dragStateRef.current.startY;

      const isSwipeAway =
        (direction === 'down' && deltaY > 0) ||
        (direction === 'up' && deltaY < 0) ||
        (direction === 'left' && deltaX < 0) ||
        (direction === 'right' && deltaX > 0) ||
        (direction === 'both' &&
          (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10));

      if (isSwipeAway) {
        const isVertical =
          direction === 'down' || direction === 'up' || direction === 'both';
        const isHorizontal = direction === 'left' || direction === 'right';
        const delta = isVertical ? Math.abs(deltaY) : Math.abs(deltaX);
        const resistance = Math.min(delta / 300, 0.8);

        const translateX = isHorizontal ? deltaX * (1 - resistance) : 0;
        const translateY = isVertical ? deltaY * (1 - resistance) : 0;

        if (getTransform) {
          content.style.transform = getTransform(translateX, translateY);
        } else {
          if (direction === 'down') {
            content.style.transform = `translateY(${Math.max(0, translateY)}px)`;
          } else if (direction === 'up') {
            content.style.transform = `translateY(${Math.min(0, translateY)}px)`;
          } else if (direction === 'left') {
            content.style.transform = `translateX(${Math.min(0, translateX)}px)`;
          } else if (direction === 'right') {
            content.style.transform = `translateX(${Math.max(0, translateX)}px)`;
          } else {
            content.style.transform = `translate(${translateX}px, ${translateY}px)`;
          }
        }
      }

      dragStateRef.current.currentX = e.clientX;
      dragStateRef.current.currentY = e.clientY;
    },
    [direction, getTransform]
  );

  const handlePointerUp = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current?.isDragging) return;

      const content = contentRef.current;
      if (!content) return;

      const deltaX =
        dragStateRef.current.currentX - dragStateRef.current.startX;
      const deltaY =
        dragStateRef.current.currentY - dragStateRef.current.startY;
      const deltaTime = Date.now() - dragStateRef.current.startTime;

      const isVertical =
        direction === 'down' || direction === 'up' || direction === 'both';
      const isHorizontal = direction === 'left' || direction === 'right';
      const delta = isVertical
        ? Math.abs(deltaY)
        : isHorizontal
          ? Math.abs(deltaX)
          : Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const velocity = deltaTime > 0 ? delta / deltaTime : 0;

      const isSwipeAway =
        (direction === 'down' && deltaY > 0) ||
        (direction === 'up' && deltaY < 0) ||
        (direction === 'left' && deltaX < 0) ||
        (direction === 'right' && deltaX > 0) ||
        (direction === 'both' &&
          (Math.abs(deltaY) > 10 || Math.abs(deltaX) > 10));

      const shouldClose =
        isSwipeAway &&
        (delta > distanceThreshold || velocity > velocityThreshold);

      content.style.transition = '';
      content.style.transform = '';

      if (shouldClose) {
        try {
          if (onClose) {
            onClose();
          } else if (
            closeButtonRef?.current &&
            !closeButtonRef.current.disabled
          ) {
            closeButtonRef.current.click();
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('[useSwipeToClose] Close action failed:', err);
          }
        }
      }

      dragStateRef.current = null;
      if (content.hasPointerCapture(e.pointerId)) {
        content.releasePointerCapture(e.pointerId);
      }
    },
    [direction, distanceThreshold, velocityThreshold, closeButtonRef, onClose]
  );

  const handlePointerCancel = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current?.isDragging) return;

    const content = contentRef.current;
    if (!content) return;

    content.style.transition = '';
    content.style.transform = '';
    dragStateRef.current = null;

    if (content.hasPointerCapture(e.pointerId)) {
      content.releasePointerCapture(e.pointerId);
    }
  }, []);

  return {
    ref: contentRef,
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  };
}
