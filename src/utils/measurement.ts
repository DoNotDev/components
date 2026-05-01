// packages/components/src/utils/measurement.ts

/**
 * @fileoverview Element Measurement Utilities
 * @description Element measurement utilities for components. Provides reusable functions for measuring element dimensions and content with ResizeObserver support.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

/**
 * Options for element measurement
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface MeasurementOptions {
  /**
   * Whether to measure immediately or wait for next frame
   * @default false
   */
  immediate?: boolean;

  /**
   * Whether to include padding in measurements
   * @default false
   */
  includePadding?: boolean;

  /**
   * Whether to include borders in measurements
   * @default false
   */
  includeBorders?: boolean;
}

/**
 * Element dimensions interface
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export interface ElementDimensions {
  width: number;
  height: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
  offsetWidth: number;
  offsetHeight: number;
}

/**
 * Measure an element's dimensions
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function measureElement(
  element: Element | null,
  options: MeasurementOptions = {}
): ElementDimensions | null {
  if (!element || typeof window === 'undefined') return null;

  const { includePadding = false, includeBorders = false } = options;

  try {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    // Cast to HTMLElement for offset properties
    const htmlElement = element as HTMLElement;

    // getBoundingClientRect includes padding + borders by default.
    // Start from content-box by subtracting both, then add back per options.
    const paddingH =
      (parseFloat(computedStyle.paddingLeft) || 0) +
      (parseFloat(computedStyle.paddingRight) || 0);
    const paddingV =
      (parseFloat(computedStyle.paddingTop) || 0) +
      (parseFloat(computedStyle.paddingBottom) || 0);
    const borderH =
      (parseFloat(computedStyle.borderLeftWidth) || 0) +
      (parseFloat(computedStyle.borderRightWidth) || 0);
    const borderV =
      (parseFloat(computedStyle.borderTopWidth) || 0) +
      (parseFloat(computedStyle.borderBottomWidth) || 0);

    let width = rect.width - paddingH - borderH;
    let height = rect.height - paddingV - borderV;

    if (includePadding) {
      width += paddingH;
      height += paddingV;
    }

    if (includeBorders) {
      width += borderH;
      height += borderV;
    }

    return {
      width,
      height,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      offsetWidth: htmlElement.offsetWidth,
      offsetHeight: htmlElement.offsetHeight,
    };
  } catch (error) {
    // Silent error handling for production
    if (process.env.NODE_ENV === 'development') {
      console.warn('Measurement error:', error);
    }
    return null;
  }
}

/**
 * Measure content height of an element (scrollHeight)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function measureContentHeight(element: Element | null): number {
  if (!element || typeof window === 'undefined') return 0;
  try {
    return element.scrollHeight;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Content height measurement error:', error);
    }
    return 0;
  }
}

/**
 * Measure visible height of an element (clientHeight)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function measureVisibleHeight(element: Element | null): number {
  if (!element || typeof window === 'undefined') return 0;
  try {
    return element.clientHeight;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Visible height measurement error:', error);
    }
    return 0;
  }
}

/**
 * Create a ResizeObserver for measuring element dimensions
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function createMeasurementObserver(
  element: Element | null,
  callback: (dimensions: ElementDimensions) => void,
  options: MeasurementOptions = {}
): () => void {
  if (!element || typeof window === 'undefined') return () => {};

  const measure = () => {
    const dimensions = measureElement(element, options);
    if (dimensions) {
      callback(dimensions);
    }
  };

  if (options.immediate) {
    measure();
  } else {
    requestAnimationFrame(measure);
  }

  const resizeObserver = new ResizeObserver(() => {
    measure();
  });

  resizeObserver.observe(element);

  return () => resizeObserver.disconnect();
}

/**
 * Create a measurement observer that tracks both container and content dimensions
 * Batches DOM reads to minimize forced reflows
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export function createDualMeasurementObserver(
  container: Element | null,
  content: Element | null,
  callback: (containerHeight: number, contentHeight: number) => void,
  options: MeasurementOptions = {}
): () => void {
  if (!container || !content || typeof window === 'undefined') return () => {};

  // Batch all DOM reads in single frame to avoid multiple reflows
  const measure = () => {
    try {
      // Read both in one go - single reflow
      const containerHeight = container.clientHeight;
      const contentHeight = content.scrollHeight;
      callback(containerHeight, contentHeight);
    } catch {
      callback(0, 0);
    }
  };

  if (options.immediate) {
    measure();
  } else {
    requestAnimationFrame(measure);
  }

  // Debounce ResizeObserver callback to avoid rapid-fire measurements
  let rafId: number | null = null;
  const resizeObserver = new ResizeObserver(() => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(measure);
  });

  resizeObserver.observe(container);
  resizeObserver.observe(content);

  return () => {
    if (rafId) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
  };
}

/**
 * Schedule a measurement callback to run in the next animation frame
 * Use this to batch multiple measurements together
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
let pendingMeasurements: Array<() => void> = [];
let measurementFrameId: number | null = null;

export function scheduleMeasurement(callback: () => void): void {
  pendingMeasurements.push(callback);

  if (measurementFrameId === null) {
    measurementFrameId = requestAnimationFrame(() => {
      const callbacks = pendingMeasurements;
      pendingMeasurements = [];
      measurementFrameId = null;

      // Execute all measurements in single frame
      for (const cb of callbacks) {
        try {
          cb();
        } catch {
          // Silent fail for individual measurements
        }
      }
    });
  }
}
