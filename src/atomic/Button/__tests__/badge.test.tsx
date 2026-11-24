import { act, cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { trackFlight } from '../../../utils/flights';
import Button from '../index';

const animate = vi.fn();
let reducedMotion = false;

beforeEach(() => {
  animate.mockReset();
  reducedMotion = false;
  Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true, writable: true });
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  Reflect.deleteProperty(HTMLElement.prototype, 'animate');
});

const cart = (badge: number | string) => <Button icon="ShoppingCart" badge={badge} aria-label="Cart" />;
const bubbleOf = (container: HTMLElement) => container.querySelector('.dndev-interactive-badge');

describe('Button badge bump', () => {
  it('never pops on the first render (server or hydration)', () => {
    expect(renderToString(cart(3))).toContain('dndev-interactive-badge');
    const { container } = render(cart(3));
    expect(bubbleOf(container)?.textContent).toBe('3');
    expect(animate).not.toHaveBeenCalled();
  });

  it('pops the bubble on an increase, including 0 → 1, with transform only', () => {
    const { container, rerender } = render(cart(0));
    expect(bubbleOf(container)).toBeNull();
    rerender(cart(1));
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(bubbleOf(container));
    const keyframes = animate.mock.calls[0][0] as Keyframe[];
    for (const frame of keyframes) {
      expect(Object.keys(frame).filter((key) => key !== 'offset')).toEqual(['transform']);
    }
    rerender(cart(4));
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('does not pop on a decrease, an unchanged value or a text badge', () => {
    const { rerender } = render(cart(5));
    rerender(cart(2));
    rerender(cart(2));
    rerender(cart('99+'));
    rerender(cart(0));
    expect(animate).not.toHaveBeenCalled();
  });

  it('does not pop under prefers-reduced-motion', () => {
    reducedMotion = true;
    const { rerender } = render(cart(1));
    rerender(cart(2));
    expect(animate).not.toHaveBeenCalled();
  });

  it('renders the anchor at 0 so a flight can find it, without the bubble', () => {
    const { container } = render(cart(0));
    expect(container.querySelector('.dndev-interactive-icon-anchor')).not.toBeNull();
    expect(bubbleOf(container)).toBeNull();
  });

  it('keeps a badge-less button without the bubble island markup', () => {
    const { container } = render(<Button icon="ShoppingCart" aria-label="Cart" />);
    expect(container.querySelector('.dndev-interactive-icon-anchor')).toBeNull();
  });
});

/** A flight heading to `target`: an event target standing in for the WAAPI Animation. */
function flight(target: Element) {
  const animation = new EventTarget() as Animation;
  trackFlight(target, animation);
  return {
    land: () => act(async () => { animation.dispatchEvent(new Event('finish')); }),
    cancel: () => act(async () => { animation.dispatchEvent(new Event('cancel')); }),
  };
}
const buttonOf = (container: HTMLElement) => container.querySelector('button')!;

describe('Button badge with a flight heading to it', () => {
  it('holds the previous count until the image lands, then shows the latest and pops', async () => {
    const { container, rerender } = render(cart(2));
    const plane = flight(buttonOf(container));
    rerender(cart(3));
    rerender(cart(5)); // the count keeps moving while the image flies
    expect(bubbleOf(container)?.textContent).toBe('2');
    expect(animate).not.toHaveBeenCalled();
    await plane.land();
    expect(bubbleOf(container)?.textContent).toBe('5');
    expect(animate).toHaveBeenCalledTimes(1);
    expect(animate.mock.contexts[0]).toBe(bubbleOf(container));
  });

  it('0 → 1: the bubble appears only on landing', async () => {
    const { container, rerender } = render(cart(0));
    const plane = flight(buttonOf(container));
    rerender(cart(1));
    expect(bubbleOf(container)).toBeNull();
    await plane.land();
    expect(bubbleOf(container)?.textContent).toBe('1');
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('a cancelled flight shows the latest count without a pop', async () => {
    const { container, rerender } = render(cart(1));
    const plane = flight(buttonOf(container));
    rerender(cart(2));
    rerender(cart(1)); // the failed write rolls the count back: shown at once
    expect(bubbleOf(container)?.textContent).toBe('1');
    await plane.cancel();
    expect(bubbleOf(container)?.textContent).toBe('1');
    expect(animate).not.toHaveBeenCalled();
  });

  it('each of several landings shows the latest count and pops', async () => {
    const { container, rerender } = render(cart(1));
    const first = flight(buttonOf(container));
    rerender(cart(2));
    const second = flight(buttonOf(container));
    rerender(cart(3));
    expect(bubbleOf(container)?.textContent).toBe('1');
    await first.land();
    expect(bubbleOf(container)?.textContent).toBe('3');
    await second.land();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('pops at once without a flight, and a flight elsewhere does not hold it', () => {
    const { container, rerender } = render(cart(1));
    flight(document.createElement('button'));
    rerender(cart(2));
    expect(bubbleOf(container)?.textContent).toBe('2');
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('ignores a landing after unmount', async () => {
    const { container, rerender, unmount } = render(cart(1));
    const plane = flight(buttonOf(container));
    rerender(cart(2));
    unmount();
    await plane.land();
    expect(animate).not.toHaveBeenCalled();
  });
});
