// packages/components/src/utils/viewportDetection.ts

/**
 * @fileoverview Viewport Detection Utilities
 * @description Viewport detection utilities for scroll-based animations and visibility. Provides reusable functions for checking if elements are in viewport, tracking multiple elements' visibility, and performance-optimized scroll handling.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Options for viewport detection
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface ViewportDetectionOptions {
  /**
   * Threshold for intersection (0-1)
   * @default 0.1
   */
  threshold?: number;

  /**
   * Root margin for intersection observer
   * @default '50px'
   */
  rootMargin?: string;

  /**
   * Whether to only trigger once
   * @default false
   */
  once?: boolean;

  /**
   * Whether to track individual item visibility
   * @default true
   */
  trackItems?: boolean;
}

/**
 * Result of viewport detection
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface ViewportDetectionResult {
  /**
   * Whether the container is visible
   */
  isVisible: boolean;

  /**
   * Set of visible item indices (when trackItems is true)
   */
  visibleItems: Set<number>;

  /**
   * Whether the container has been triggered at least once
   */
  hasTriggered: boolean;
}

/**
 * Check if an element is in the viewport
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function isElementInViewport(
  element: Element,
  threshold: number = 0.1
): boolean {
  if (typeof window === 'undefined') return false;

  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || 0;
  const windowWidth = window.innerWidth || 0;

  const verticalVisible =
    rect.top < windowHeight * (1 - threshold) &&
    rect.bottom > windowHeight * threshold;
  const horizontalVisible =
    rect.left < windowWidth * (1 - threshold) &&
    rect.right > windowWidth * threshold;

  return verticalVisible && horizontalVisible;
}

/**
 * Check which items in a container are visible
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function getVisibleItems(
  container: Element,
  itemSelector: string = '.dndev-reveal-item',
  threshold: number = 0.1
): Set<number> {
  const visibleItems = new Set<number>();
  const itemElements = container.querySelectorAll(itemSelector);

  itemElements.forEach((element, index) => {
    if (isElementInViewport(element, threshold)) {
      visibleItems.add(index);
    }
  });

  return visibleItems;
}

/**
 * Create a viewport detection handler
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function createViewportHandler(options: ViewportDetectionOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    once = false,
    trackItems = true,
  } = options;

  let isVisible = false;
  let hasTriggered = false;
  let visibleItems = new Set<number>();

  return {
    /**
     * Handle intersection observer callback
     */
    handleIntersection: (
      entry: IntersectionObserverEntry,
      container?: Element
    ) => {
      const isIntersecting = entry.isIntersecting;

      if (isIntersecting && (!hasTriggered || !once)) {
        isVisible = true;
        hasTriggered = true;

        // Check individual item visibility if tracking items
        if (trackItems && container) {
          visibleItems = getVisibleItems(
            container,
            '.dndev-reveal-item',
            threshold
          );
        }
      } else if (!isIntersecting && !once) {
        isVisible = false;
        if (trackItems) {
          visibleItems.clear();
        }
      }

      return { isVisible, hasTriggered, visibleItems };
    },

    /**
     * Handle scroll event for item visibility tracking
     */
    handleScroll: (container: Element) => {
      if (isVisible && trackItems) {
        visibleItems = getVisibleItems(
          container,
          '.dndev-reveal-item',
          threshold
        );
      }

      return { isVisible, hasTriggered, visibleItems };
    },

    /**
     * Get current state
     */
    getState: () => ({ isVisible, hasTriggered, visibleItems }),
  };
}
