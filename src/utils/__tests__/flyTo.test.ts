import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { landing } from '../flights';
import { flyTarget, flyTo } from '../flyTo';

type Listener = () => void;
let reducedMotion = false;
let animations: { element: Element; keyframes: Keyframe[]; listeners: Record<string, Listener[]> }[] = [];

function rect(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect;
}
function box(tag: string, r: DOMRect): HTMLElement {
  const element = document.createElement(tag);
  element.getBoundingClientRect = () => r;
  document.body.append(element);
  return element;
}

beforeEach(() => {
  reducedMotion = false;
  animations = [];
  Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    writable: true,
    value(this: Element, keyframes: Keyframe[]) {
      const entry = { element: this, keyframes, listeners: {} as Record<string, Listener[]> };
      animations.push(entry);
      return {
        addEventListener: (type: string, listener: Listener) => {
          (entry.listeners[type] ??= []).push(listener);
        },
      } as unknown as Animation;
    },
  });
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
    media: query,
  }) as MediaQueryList);
});
afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
  document.body.replaceChildren();
});

describe('flyTo', () => {
  it('flies a fixed clone of the image onto the registered target, transform/opacity only, and removes it on finish', () => {
    const source = box('img', rect(100, 400, 200, 200)) as HTMLImageElement;
    source.className = 'positioned-by-its-card';
    source.setAttribute('srcset', 'a.jpg 1x');
    source.src = 'https://cdn.test/packshot.jpg';
    const target = box('button', rect(900, 10, 40, 40));
    const cleanupRef = flyTarget('cart')(target);

    expect(flyTo(source, 'cart')).not.toBeNull();
    expect(animations).toHaveLength(1);
    const { element: clone, keyframes, listeners } = animations[0];
    expect(clone).not.toBe(source);
    expect(clone.parentElement).toBe(document.body);
    expect((clone as HTMLImageElement).getAttribute('srcset')).toBeNull();
    expect(clone.getAttribute('class')).toBeNull();
    expect(clone.getAttribute('aria-hidden')).toBe('true');
    expect((clone as HTMLElement).style.position).toBe('fixed');
    expect((clone as HTMLElement).style.pointerEvents).toBe('none');
    for (const frame of keyframes) {
      expect(Object.keys(frame).filter((key) => key !== 'offset').sort()).toEqual(['opacity', 'transform']);
    }
    // Centre (200, 500) to centre (920, 30), landing at the target's size (40 / 200).
    expect(keyframes.at(-1)?.transform).toBe('translate(720px, -470px) scale(0.2)');

    for (const listener of listeners.finish) listener();
    expect(clone.isConnected).toBe(false);
    cleanupRef?.();
  });

  it('also cleans up when the animation is cancelled', () => {
    const source = box('div', rect(0, 0, 100, 100));
    const target = box('button', rect(500, 0, 40, 40));
    flyTo(source, target);
    const { element: clone, listeners } = animations[0];
    expect(clone.isConnected).toBe(true);
    for (const listener of listeners.cancel) listener();
    expect(clone.isConnected).toBe(false);
  });

  it('does nothing under prefers-reduced-motion', () => {
    reducedMotion = true;
    const source = box('div', rect(0, 0, 100, 100));
    const target = box('button', rect(500, 0, 40, 40));
    expect(flyTo(source, target)).toBeNull();
    expect(animations).toHaveLength(0);
    expect(document.body.children).toHaveLength(2);
  });

  it('does nothing without a source, a target, or with an unregistered name', () => {
    const source = box('div', rect(0, 0, 100, 100));
    const target = box('button', rect(500, 0, 40, 40));
    expect(flyTo(null, target)).toBeNull();
    expect(flyTo(source, undefined)).toBeNull();
    expect(flyTo(source, 'nowhere')).toBeNull();
    expect(flyTo(document.createElement('div'), target)).toBeNull();
    expect(animations).toHaveLength(0);
  });

  it('does nothing when the target is off-screen or unrendered, or the source unrendered', () => {
    const source = box('div', rect(0, 0, 100, 100));
    expect(flyTo(source, box('button', rect(0, -60, 40, 40)))).toBeNull();
    expect(flyTo(source, box('button', rect(0, 0, 0, 0)))).toBeNull();
    expect(flyTo(box('div', rect(0, 900, 0, 0)), box('button', rect(0, 0, 40, 40)))).toBeNull();
    expect(animations).toHaveLength(0);
  });

  it('flies an off-screen source from its box clamped just beyond the nearest viewport edge(s)', () => {
    const target = box('button', rect(900, 10, 40, 40));
    // Below the fold (viewport 1000 × 800): enters from the bottom edge.
    expect(flyTo(box('div', rect(100, 2000, 100, 100)), target)).not.toBeNull();
    // Above and beyond the end: enters from the top-right corner.
    expect(flyTo(box('div', rect(1500, -600, 100, 100)), target)).not.toBeNull();
    const [below, corner] = animations.map(({ element }) => (element as HTMLElement).style);
    expect([below.top, below.left]).toEqual(['800px', '100px']);
    expect([corner.top, corner.left]).toEqual(['-100px', '1000px']);
    // Centre (150, 850) to centre (920, 30); centre (1050, -50) to centre (920, 30).
    expect(animations[0].keyframes.at(-1)?.transform).toBe('translate(770px, -820px) scale(0.4)');
    expect(animations[1].keyframes.at(-1)?.transform).toBe('translate(-130px, 80px) scale(0.4)');
  });

  it('registers each flight on its target until it lands or is cancelled', async () => {
    const source = box('div', rect(0, 0, 100, 100));
    const target = box('button', rect(500, 0, 40, 40));
    const inner = document.createElement('span');
    target.append(inner);
    expect(landing(inner)).toBeNull();

    flyTo(source, target);
    const landed = landing(inner);
    expect(landed).not.toBeNull();
    expect(landing(source)).toBeNull();
    for (const listener of animations[0].listeners.finish) listener();
    await expect(landed).resolves.toBe('landed');
    expect(landing(target)).toBeNull();

    flyTo(source, target);
    const cancelled = landing(target);
    for (const listener of animations[1].listeners.cancel) listener();
    await expect(cancelled).resolves.toBe('cancelled');
    expect(landing(target)).toBeNull();
  });

  it('picks the on-screen element of a name and forgets unregistered or detached ones', () => {
    const source = box('div', rect(0, 0, 100, 100));
    const hidden = box('button', rect(0, 0, 0, 0));
    const shown = box('button', rect(600, 0, 40, 40));
    const ref = flyTarget('header-cart');
    expect(flyTarget('header-cart')).toBe(ref);
    ref(hidden);
    const unregister = ref(shown);
    flyTo(source, 'header-cart');
    expect(animations).toHaveLength(1);
    unregister?.();
    expect(flyTo(source, 'header-cart')).toBeNull();
    const detached = box('button', rect(600, 0, 40, 40));
    ref(detached);
    detached.remove();
    expect(flyTo(source, 'header-cart')).toBeNull();
    expect(animations).toHaveLength(1);
  });
});
