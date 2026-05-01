// packages/components/src/utils/intersectionObserver.ts

/**
 * @fileoverview Intersection Observer Utilities
 * @description Centralized IntersectionObserver utility for framework components. Provides optimized, SSR-safe intersection observation with shared instances and polyfill support.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Polyfill for IntersectionObserver
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function polyfillIntersectionObserver(): void {
  if (typeof window === 'undefined' || 'IntersectionObserver' in window) {
    return;
  }

  // Simple polyfill for basic intersection detection.
  // Limitation: This mock fires the callback once on observe() but does NOT
  // re-fire on scroll/resize. unobserve() removes the element from the set
  // but cannot cancel an already-scheduled setTimeout callback.
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    private callback: IntersectionObserverCallback;
    private elements: Set<Element>;
    private options: IntersectionObserverOptions;

    constructor(
      callback: IntersectionObserverCallback,
      options: IntersectionObserverOptions = {}
    ) {
      this.callback = callback;
      this.elements = new Set();
      this.options = options;
    }

    observe(element: Element): void {
      this.elements.add(element);

      // Check if element is actually visible
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      const entry: IntersectionObserverEntry = {
        target: element,
        isIntersecting: isVisible,
        intersectionRatio: isVisible ? 1 : 0,
        boundingClientRect: rect,
        intersectionRect: isVisible ? rect : new DOMRect(),
        rootBounds: null,
        time: Date.now(),
      };

      // Use setTimeout to ensure DOM is ready
      setTimeout(() => this.callback([entry], this as any), 0);
    }

    unobserve(element: Element): void {
      this.elements.delete(element);
    }

    disconnect(): void {
      this.elements.clear();
    }
  };
}

/**
 * Centralized IntersectionObserver utility for framework components
 * Provides optimized, SSR-safe intersection observation with shared instances
 */

// Global observer cache for performance optimization
const observerCache = new Map<string, IntersectionObserver>();
const elementCallbacks = new Map<
  Element,
  Set<(entry: IntersectionObserverEntry) => void>
>();

/**
 * Options for IntersectionObserver
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
}

/**
 * Get or create a cached IntersectionObserver instance
 * This reduces the number of observers and improves performance for Lighthouse scores
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function getIntersectionObserver(
  options: IntersectionObserverOptions = {}
): IntersectionObserver {
  const { threshold = 0, root = null, rootMargin = '0px' } = options;
  const key = `${threshold}-${rootMargin}-${root?.toString() || 'null'}`;

  if (observerCache.has(key)) {
    return observerCache.get(key)!;
  }

  // Ensure polyfill is loaded for SSR safety
  if (typeof window !== 'undefined') {
    polyfillIntersectionObserver();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const callbacks = elementCallbacks.get(entry.target);
        if (callbacks) {
          callbacks.forEach((callback) => callback(entry));
        }
      });
    },
    {
      threshold,
      root,
      rootMargin,
    }
  );

  observerCache.set(key, observer);
  return observer;
}

/**
 * Subscribe an element to intersection observation
 * @param element Element to observe
 * @param callback Callback function for intersection changes
 * @param options IntersectionObserver options
 * @returns Cleanup function
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function observeElement(
  element: Element,
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {}
): () => void {
  // SSR safety check
  if (typeof window === 'undefined') {
    // SSR fallback - no DOM methods available, just return noop
    return () => {};
  }

  // Ensure polyfill is loaded
  polyfillIntersectionObserver();

  // Check if IntersectionObserver is available (after polyfill)
  if (!window.IntersectionObserver) {
    // Fallback for unsupported browsers - check actual visibility
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    const mockEntry: IntersectionObserverEntry = {
      target: element,
      isIntersecting: isVisible,
      intersectionRatio: isVisible ? 1 : 0,
      boundingClientRect: rect,
      intersectionRect: isVisible ? rect : new DOMRect(),
      rootBounds: null,
      time: Date.now(),
    };

    // Use setTimeout to ensure DOM is ready
    setTimeout(() => callback(mockEntry), 0);
    return () => {};
  }

  // Get cached observer
  const observer = getIntersectionObserver(options);

  // Add callback to element
  if (!elementCallbacks.has(element)) {
    elementCallbacks.set(element, new Set());
  }
  elementCallbacks.get(element)!.add(callback);

  // Observe element
  observer.observe(element);

  // Return cleanup function
  return () => {
    const callbacks = elementCallbacks.get(element);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        elementCallbacks.delete(element);
        observer.unobserve(element);
      }
    }
  };
}

/**
 * Create a simple intersection observer for basic visibility detection
 * Optimized for performance and SSR safety
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function createVisibilityObserver(
  element: Element | null,
  onVisible: (isVisible: boolean) => void,
  options: IntersectionObserverOptions = {}
): () => void {
  if (!element) return () => {};

  return observeElement(
    element,
    (entry) => onVisible(entry.isIntersecting),
    options
  );
}

/**
 * Cleanup all observers (useful for testing or app shutdown)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function cleanupAllObservers(): void {
  observerCache.forEach((observer) => observer.disconnect());
  observerCache.clear();
  elementCallbacks.clear();
}
