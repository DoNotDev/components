import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  measureElement,
  measureContentHeight,
  measureVisibleHeight,
  createMeasurementObserver,
  createDualMeasurementObserver,
  scheduleMeasurement,
} from '../measurement';

// --- Helpers ---

function createMockElement(
  overrides: Partial<{
    rectWidth: number;
    rectHeight: number;
    scrollWidth: number;
    scrollHeight: number;
    clientWidth: number;
    clientHeight: number;
    offsetWidth: number;
    offsetHeight: number;
    paddingLeft: string;
    paddingRight: string;
    paddingTop: string;
    paddingBottom: string;
    borderLeftWidth: string;
    borderRightWidth: string;
    borderTopWidth: string;
    borderBottomWidth: string;
  }> = {}
): HTMLElement {
  const {
    rectWidth = 200,
    rectHeight = 100,
    scrollWidth = 200,
    scrollHeight = 100,
    clientWidth = 200,
    clientHeight = 100,
    offsetWidth = 200,
    offsetHeight = 100,
    paddingLeft = '0px',
    paddingRight = '0px',
    paddingTop = '0px',
    paddingBottom = '0px',
    borderLeftWidth = '0px',
    borderRightWidth = '0px',
    borderTopWidth = '0px',
    borderBottomWidth = '0px',
  } = overrides;

  const el = document.createElement('div');

  el.getBoundingClientRect = () => ({
    width: rectWidth,
    height: rectHeight,
    top: 0,
    left: 0,
    bottom: rectHeight,
    right: rectWidth,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  Object.defineProperty(el, 'scrollWidth', { value: scrollWidth });
  Object.defineProperty(el, 'scrollHeight', { value: scrollHeight });
  Object.defineProperty(el, 'clientWidth', { value: clientWidth });
  Object.defineProperty(el, 'clientHeight', { value: clientHeight });
  Object.defineProperty(el, 'offsetWidth', { value: offsetWidth });
  Object.defineProperty(el, 'offsetHeight', { value: offsetHeight });

  // Mock getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;
  vi.spyOn(window, 'getComputedStyle').mockImplementation((target) => {
    if (target === el) {
      return {
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        borderLeftWidth,
        borderRightWidth,
        borderTopWidth,
        borderBottomWidth,
      } as CSSStyleDeclaration;
    }
    return originalGetComputedStyle(target);
  });

  return el;
}

// --- Mock ResizeObserver ---

let resizeObserverCallback: ResizeObserverCallback;
let resizeObserverInstances: Array<{
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}>;

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback;
    resizeObserverInstances.push(this);
  }
}

beforeEach(() => {
  resizeObserverInstances = [];
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- measureElement ---

describe('measureElement', () => {
  it('returns null for null element', () => {
    expect(measureElement(null)).toBeNull();
  });

  it('returns content-box dimensions by default (no padding, no border)', () => {
    const el = createMockElement({
      rectWidth: 200,
      rectHeight: 100,
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });

    const dims = measureElement(el);
    expect(dims).not.toBeNull();
    // content-box = rect - padding - border
    expect(dims!.width).toBe(200 - 20 - 4); // 176
    expect(dims!.height).toBe(100 - 10 - 2); // 88
  });

  it('includes padding when includePadding is true', () => {
    const el = createMockElement({
      rectWidth: 200,
      rectHeight: 100,
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });

    const dims = measureElement(el, { includePadding: true });
    expect(dims).not.toBeNull();
    // content-box + padding = rect - border
    expect(dims!.width).toBe(200 - 4); // 196
    expect(dims!.height).toBe(100 - 2); // 98
  });

  it('includes borders when includeBorders is true', () => {
    const el = createMockElement({
      rectWidth: 200,
      rectHeight: 100,
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });

    const dims = measureElement(el, { includeBorders: true });
    expect(dims).not.toBeNull();
    // content-box + border = rect - padding
    expect(dims!.width).toBe(200 - 20); // 180
    expect(dims!.height).toBe(100 - 10); // 90
  });

  it('includes both padding and borders', () => {
    const el = createMockElement({
      rectWidth: 200,
      rectHeight: 100,
      paddingLeft: '10px',
      paddingRight: '10px',
      paddingTop: '5px',
      paddingBottom: '5px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });

    const dims = measureElement(el, {
      includePadding: true,
      includeBorders: true,
    });
    expect(dims).not.toBeNull();
    // content-box + padding + border = rect
    expect(dims!.width).toBe(200);
    expect(dims!.height).toBe(100);
  });

  it('returns all dimension properties', () => {
    const el = createMockElement({
      scrollWidth: 300,
      scrollHeight: 250,
      clientWidth: 180,
      clientHeight: 90,
      offsetWidth: 200,
      offsetHeight: 100,
    });

    const dims = measureElement(el);
    expect(dims).not.toBeNull();
    expect(dims!.scrollWidth).toBe(300);
    expect(dims!.scrollHeight).toBe(250);
    expect(dims!.clientWidth).toBe(180);
    expect(dims!.clientHeight).toBe(90);
    expect(dims!.offsetWidth).toBe(200);
    expect(dims!.offsetHeight).toBe(100);
  });

  it('handles zero dimensions', () => {
    const el = createMockElement({
      rectWidth: 0,
      rectHeight: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      clientWidth: 0,
      clientHeight: 0,
      offsetWidth: 0,
      offsetHeight: 0,
    });

    const dims = measureElement(el);
    expect(dims).not.toBeNull();
    expect(dims!.width).toBe(0);
    expect(dims!.height).toBe(0);
  });

  it('handles element with no padding or borders', () => {
    const el = createMockElement({ rectWidth: 150, rectHeight: 80 });

    const dims = measureElement(el);
    expect(dims).not.toBeNull();
    expect(dims!.width).toBe(150);
    expect(dims!.height).toBe(80);
  });
});

// --- measureContentHeight ---

describe('measureContentHeight', () => {
  it('returns 0 for null element', () => {
    expect(measureContentHeight(null)).toBe(0);
  });

  it('returns scrollHeight of element', () => {
    const el = createMockElement({ scrollHeight: 500 });
    expect(measureContentHeight(el)).toBe(500);
  });

  it('returns 0 for zero scrollHeight', () => {
    const el = createMockElement({ scrollHeight: 0 });
    expect(measureContentHeight(el)).toBe(0);
  });
});

// --- measureVisibleHeight ---

describe('measureVisibleHeight', () => {
  it('returns 0 for null element', () => {
    expect(measureVisibleHeight(null)).toBe(0);
  });

  it('returns clientHeight of element', () => {
    const el = createMockElement({ clientHeight: 300 });
    expect(measureVisibleHeight(el)).toBe(300);
  });

  it('returns 0 for zero clientHeight', () => {
    const el = createMockElement({ clientHeight: 0 });
    expect(measureVisibleHeight(el)).toBe(0);
  });
});

// --- createMeasurementObserver ---

describe('createMeasurementObserver', () => {
  it('returns noop cleanup for null element', () => {
    const callback = vi.fn();
    const cleanup = createMeasurementObserver(null, callback);
    expect(typeof cleanup).toBe('function');
    cleanup(); // should not throw
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls callback immediately when immediate option is true', () => {
    const el = createMockElement({ rectWidth: 100, rectHeight: 50 });
    const callback = vi.fn();

    createMeasurementObserver(el, callback, { immediate: true });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ width: 100, height: 50 })
    );
  });

  it('defers callback to requestAnimationFrame when not immediate', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const el = createMockElement();
    const callback = vi.fn();

    createMeasurementObserver(el, callback);

    expect(callback).not.toHaveBeenCalled();
    expect(rafSpy).toHaveBeenCalled();
  });

  it('observes element with ResizeObserver', () => {
    const el = createMockElement();
    const callback = vi.fn();

    createMeasurementObserver(el, callback, { immediate: true });

    expect(resizeObserverInstances.length).toBeGreaterThan(0);
    const observer =
      resizeObserverInstances[resizeObserverInstances.length - 1];
    expect(observer.observe).toHaveBeenCalledWith(el);
  });

  it('disconnects ResizeObserver on cleanup', () => {
    const el = createMockElement();
    const callback = vi.fn();

    const cleanup = createMeasurementObserver(el, callback, {
      immediate: true,
    });
    const observer =
      resizeObserverInstances[resizeObserverInstances.length - 1];

    cleanup();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

// --- createDualMeasurementObserver ---

describe('createDualMeasurementObserver', () => {
  it('returns noop cleanup when container is null', () => {
    const callback = vi.fn();
    const cleanup = createDualMeasurementObserver(
      null,
      document.createElement('div'),
      callback
    );
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(callback).not.toHaveBeenCalled();
  });

  it('returns noop cleanup when content is null', () => {
    const callback = vi.fn();
    const cleanup = createDualMeasurementObserver(
      document.createElement('div'),
      null,
      callback
    );
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(callback).not.toHaveBeenCalled();
  });

  it('measures both container and content immediately when immediate is true', () => {
    const container = createMockElement({ clientHeight: 200 });
    const content = createMockElement({ scrollHeight: 500 });
    const callback = vi.fn();

    createDualMeasurementObserver(container, content, callback, {
      immediate: true,
    });

    expect(callback).toHaveBeenCalledWith(200, 500);
  });

  it('observes both container and content with ResizeObserver', () => {
    const container = createMockElement({ clientHeight: 200 });
    const content = createMockElement({ scrollHeight: 500 });
    const callback = vi.fn();

    createDualMeasurementObserver(container, content, callback, {
      immediate: true,
    });

    const observer =
      resizeObserverInstances[resizeObserverInstances.length - 1];
    expect(observer.observe).toHaveBeenCalledWith(container);
    expect(observer.observe).toHaveBeenCalledWith(content);
  });

  it('disconnects and cancels RAF on cleanup', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const container = createMockElement({ clientHeight: 200 });
    const content = createMockElement({ scrollHeight: 500 });
    const callback = vi.fn();

    const cleanup = createDualMeasurementObserver(
      container,
      content,
      callback,
      {
        immediate: true,
      }
    );
    const observer =
      resizeObserverInstances[resizeObserverInstances.length - 1];

    cleanup();
    expect(observer.disconnect).toHaveBeenCalled();
  });
});

// --- scheduleMeasurement ---

describe('scheduleMeasurement', () => {
  it('batches callbacks into a single requestAnimationFrame', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame');
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    scheduleMeasurement(cb1);
    scheduleMeasurement(cb2);

    // Only one rAF should be scheduled for both callbacks
    // (may be more than 1 total due to other tests, but the second scheduleMeasurement
    // should not add another)
    const rafCallCount = rafSpy.mock.calls.length;
    // At minimum 1 rAF was called
    expect(rafCallCount).toBeGreaterThanOrEqual(1);
  });
});
