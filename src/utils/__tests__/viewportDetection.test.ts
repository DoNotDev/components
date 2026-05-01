import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  isElementInViewport,
  getVisibleItems,
  createViewportHandler,
} from '../viewportDetection';

// --- Helpers ---

function mockWindowDimensions(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    writable: true,
    configurable: true,
  });
}

function createMockElement(rect: Partial<DOMRect>): Element {
  const el = document.createElement('div');
  el.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  });
  return el;
}

beforeEach(() => {
  mockWindowDimensions(1024, 768);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- isElementInViewport ---

describe('isElementInViewport', () => {
  it('returns true for element fully in viewport', () => {
    const el = createMockElement({
      top: 100,
      bottom: 300,
      left: 50,
      right: 400,
    });

    expect(isElementInViewport(el)).toBe(true);
  });

  it('returns false for element fully above viewport', () => {
    const el = createMockElement({
      top: -200,
      bottom: -50,
      left: 50,
      right: 400,
    });

    expect(isElementInViewport(el)).toBe(false);
  });

  it('returns false for element fully below viewport', () => {
    const el = createMockElement({
      top: 900,
      bottom: 1100,
      left: 50,
      right: 400,
    });

    expect(isElementInViewport(el)).toBe(false);
  });

  it('returns false for element fully to the left', () => {
    const el = createMockElement({
      top: 100,
      bottom: 300,
      left: -500,
      right: -200,
    });

    expect(isElementInViewport(el)).toBe(false);
  });

  it('returns false for element fully to the right', () => {
    const el = createMockElement({
      top: 100,
      bottom: 300,
      left: 1200,
      right: 1500,
    });

    expect(isElementInViewport(el)).toBe(false);
  });

  it('returns true for element partially visible with default threshold', () => {
    // Element overlaps viewport sufficiently
    // threshold=0.1, window 1024x768
    // verticalVisible: top < 768*0.9=691.2 AND bottom > 768*0.1=76.8
    const el = createMockElement({
      top: 600,
      bottom: 800,
      left: 50,
      right: 400,
    });

    expect(isElementInViewport(el)).toBe(true);
  });

  it('respects custom threshold', () => {
    // With threshold=0.5, window 768 height
    // verticalVisible: top < 768*0.5=384 AND bottom > 768*0.5=384
    const el = createMockElement({
      top: 400,
      bottom: 600,
      left: 50,
      right: 400,
    });

    // top(400) < 384 is false, so element is NOT visible at 0.5 threshold
    expect(isElementInViewport(el, 0.5)).toBe(false);
  });

  it('handles threshold of 0 (any overlap counts)', () => {
    // threshold=0: top < 768*1=768 AND bottom > 768*0=0
    const el = createMockElement({
      top: 760,
      bottom: 770,
      left: 50,
      right: 400,
    });

    expect(isElementInViewport(el, 0)).toBe(true);
  });

  it('handles zero-size element at viewport boundary', () => {
    const el = createMockElement({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    });

    // bottom(0) > 768*0.1(76.8) is false
    expect(isElementInViewport(el)).toBe(false);
  });
});

// --- getVisibleItems ---

describe('getVisibleItems', () => {
  it('returns empty set when no items match selector', () => {
    const container = document.createElement('div');
    const result = getVisibleItems(container);
    expect(result.size).toBe(0);
  });

  it('returns indices of visible items', () => {
    const container = document.createElement('div');

    // Add 3 items, make the second one visible
    for (let i = 0; i < 3; i++) {
      const item = document.createElement('div');
      item.classList.add('dndev-reveal-item');
      // Mock getBoundingClientRect per item
      if (i === 1) {
        item.getBoundingClientRect = () => ({
          top: 100,
          bottom: 300,
          left: 50,
          right: 400,
          width: 350,
          height: 200,
          x: 50,
          y: 100,
          toJSON: () => {},
        });
      } else {
        item.getBoundingClientRect = () => ({
          top: -500,
          bottom: -400,
          left: 50,
          right: 400,
          width: 350,
          height: 100,
          x: 50,
          y: -500,
          toJSON: () => {},
        });
      }
      container.appendChild(item);
    }

    const result = getVisibleItems(container);
    expect(result.has(1)).toBe(true);
    expect(result.has(0)).toBe(false);
    expect(result.has(2)).toBe(false);
  });

  it('uses custom selector', () => {
    const container = document.createElement('div');
    const item = document.createElement('div');
    item.classList.add('custom-item');
    item.getBoundingClientRect = () => ({
      top: 100,
      bottom: 300,
      left: 50,
      right: 400,
      width: 350,
      height: 200,
      x: 50,
      y: 100,
      toJSON: () => {},
    });
    container.appendChild(item);

    const result = getVisibleItems(container, '.custom-item');
    expect(result.has(0)).toBe(true);
  });
});

// --- createViewportHandler ---

describe('createViewportHandler', () => {
  it('returns handler with expected methods', () => {
    const handler = createViewportHandler();
    expect(typeof handler.handleIntersection).toBe('function');
    expect(typeof handler.handleScroll).toBe('function');
    expect(typeof handler.getState).toBe('function');
  });

  it('initial state is not visible and not triggered', () => {
    const handler = createViewportHandler();
    const state = handler.getState();
    expect(state.isVisible).toBe(false);
    expect(state.hasTriggered).toBe(false);
    expect(state.visibleItems.size).toBe(0);
  });

  it('sets isVisible and hasTriggered on intersecting entry', () => {
    const handler = createViewportHandler({ trackItems: false });

    const entry = {
      isIntersecting: true,
    } as IntersectionObserverEntry;

    const result = handler.handleIntersection(entry);
    expect(result.isVisible).toBe(true);
    expect(result.hasTriggered).toBe(true);
  });

  it('clears visibility on non-intersecting entry (once=false)', () => {
    const handler = createViewportHandler({ trackItems: false });

    // First make visible
    handler.handleIntersection({
      isIntersecting: true,
    } as IntersectionObserverEntry);

    // Then make not visible
    const result = handler.handleIntersection({
      isIntersecting: false,
    } as IntersectionObserverEntry);

    expect(result.isVisible).toBe(false);
    expect(result.hasTriggered).toBe(true);
  });

  it('stays visible when once=true after first trigger', () => {
    const handler = createViewportHandler({ once: true, trackItems: false });

    handler.handleIntersection({
      isIntersecting: true,
    } as IntersectionObserverEntry);

    // Non-intersecting should not clear when once=true
    const result = handler.handleIntersection({
      isIntersecting: false,
    } as IntersectionObserverEntry);

    expect(result.isVisible).toBe(true);
    expect(result.hasTriggered).toBe(true);
  });

  it('does not re-trigger when once=true and already triggered', () => {
    const handler = createViewportHandler({ once: true, trackItems: false });

    handler.handleIntersection({
      isIntersecting: true,
    } as IntersectionObserverEntry);

    // Second intersection should be ignored
    const result = handler.handleIntersection({
      isIntersecting: true,
    } as IntersectionObserverEntry);

    expect(result.isVisible).toBe(true);
  });

  it('handleScroll returns current state when not visible', () => {
    const handler = createViewportHandler();
    const container = document.createElement('div');

    const result = handler.handleScroll(container);
    expect(result.isVisible).toBe(false);
  });
});
