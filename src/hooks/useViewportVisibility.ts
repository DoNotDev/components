// packages/components/src/hooks/useViewportVisibility.ts

/**
 * @fileoverview Viewport Visibility Hook
 * @description React hook for viewport-based visibility detection. Provides visibility state for components like Reveal, StackedCards, and LazyImage.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';

import { observeElement } from '../utils/intersectionObserver';
import {
  createViewportHandler,
  type ViewportDetectionOptions,
  type ViewportDetectionResult,
} from '../utils/viewportDetection';

/**
 * Options for useViewportVisibility hook
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface UseViewportVisibilityOptions extends ViewportDetectionOptions {
  /**
   * Whether to enable scroll listener for item tracking
   * @default true
   */
  enableScrollListener?: boolean;
}

/**
 * Return type for useViewportVisibility hook
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface UseViewportVisibilityReturn extends ViewportDetectionResult {
  /**
   * Ref to attach to the container element
   */
  ref: React.RefObject<HTMLDivElement | null>;

  /**
   * Whether a specific item is visible
   */
  isItemVisible: (index: number) => boolean;
}

/**
 * Hook for viewport-based visibility detection
 *
 * Provides reusable viewport detection logic for components like:
 * - Reveal (staggered animations)
 * - StackedCards (progressive reveal)
 * - LazyImage (lazy loading)
 * - ScrollTrigger (scroll-based effects)
 *
 * @example Basic usage
 * ```tsx
 * const { ref, isVisible, visibleItems } = useViewportVisibility({
 *   threshold: 0.1,
 *   trackItems: true
 * });
 *
 * return (
 *   <div>
 *     {items.map((item, index) => (
 *       <div key={index} className={isItemVisible(index) ? 'visible' : 'hidden'}>
 *         {item}
 *       </div>
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @example With scroll listener
 * ```tsx
 * const { ref, isVisible, visibleItems } = useViewportVisibility({
 *   trackItems: true,
 *   enableScrollListener: true
 * });
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function useViewportVisibility(
  options: UseViewportVisibilityOptions = {}
): UseViewportVisibilityReturn {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    once = false,
    trackItems = true,
    enableScrollListener = true,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());

  // Create viewport handler once, recreate only when options change
  const viewportHandler = useMemo(
    () =>
      createViewportHandler({
        threshold,
        rootMargin,
        once,
        trackItems,
      }),
    [threshold, rootMargin, once, trackItems]
  );

  // Intersection observer callback
  const handleIntersection = useCallback(
    (entry: IntersectionObserverEntry) => {
      const handler = viewportHandler;
      const result = handler.handleIntersection(
        entry,
        containerRef.current || undefined
      );

      setIsVisible(result.isVisible);
      setHasTriggered(result.hasTriggered);
      setVisibleItems(result.visibleItems);
    },
    [viewportHandler]
  );

  // Scroll handler for item visibility tracking
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isVisible) return;

    const handler = viewportHandler;
    const result = handler.handleScroll(containerRef.current);

    setVisibleItems(result.visibleItems);
  }, [isVisible, viewportHandler]);

  // Set up intersection observer
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const cleanup = observeElement(element, handleIntersection, {
      threshold,
      rootMargin,
    });

    return cleanup;
  }, [handleIntersection, threshold, rootMargin]);

  // Set up scroll listener for item tracking
  useEffect(() => {
    if (!enableScrollListener || !trackItems || typeof window === 'undefined')
      return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollListener, trackItems, handleScroll]);

  // Check if specific item is visible
  const isItemVisible = useCallback(
    (index: number): boolean => {
      return visibleItems.has(index);
    },
    [visibleItems]
  );

  return {
    ref: containerRef,
    isVisible,
    hasTriggered,
    visibleItems,
    isItemVisible,
  };
}
