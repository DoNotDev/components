// packages/components/src/utils/flyTo.ts

/**
 * @fileoverview Fly-to animation
 * @description Flies a copy of an element (e.g. a product image) onto a named target
 * (e.g. the header cart): add-to-cart feedback without text.
 *
 * @version 0.1.0
 * @since 0.3.5
 * @author AMBROISE PARK Consulting
 */

import { trackFlight } from './flights';

/** Options of {@link flyTo}. */
export interface FlyToOptions {
  /** Flight time in ms. @default 650 */
  duration?: number;
}

const targets = new Map<string, Set<Element>>();
const targetRefs = new Map<string, (element: Element | null) => (() => void) | undefined>();

/**
 * Callback ref that registers its element as the fly target `name` (React 19: unregistered
 * by the ref cleanup). Stable per name, so it never re-registers on re-render. Several
 * elements may share a name (e.g. a mobile and a desktop header cart): {@link flyTo} picks
 * the first one on screen. Plain function, no hook: usable anywhere a ref is.
 *
 * @example
 * ```tsx
 * <Button icon={ShoppingCart} badge={count} ref={flyTarget('cart')} aria-label={label} />
 * ```
 */
export function flyTarget(name: string): (element: Element | null) => (() => void) | undefined {
  let ref = targetRefs.get(name);
  if (!ref) {
    ref = (element) => {
      if (!element) return undefined;
      let registered = targets.get(name);
      if (!registered) targets.set(name, (registered = new Set()));
      registered.add(element);
      const set = registered;
      return () => {
        set.delete(element);
      };
    };
    targetRefs.set(name, ref);
  }
  return ref;
}

/** A rendered (laid out, not `display: none`) box. */
function rendered(rect: DOMRect): boolean {
  return rect.width > 0 && rect.height > 0;
}

/** A rendered box that intersects the viewport. */
function onScreen(rect: DOMRect): boolean {
  return (
    rendered(rect) &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

/** First registered, connected, on-screen element of `name`; drops detached ones. */
function resolveTarget(name: string): Element | undefined {
  const registered = targets.get(name);
  if (!registered) return undefined;
  for (const element of registered) {
    // A ref composed by a library without React 19 cleanup support leaves detached nodes.
    if (!element.isConnected) registered.delete(element);
    else if (onScreen(element.getBoundingClientRect())) return element;
  }
  return undefined;
}

/**
 * Start corner of a flight from `rect`: its own when it intersects the viewport, otherwise
 * clamped just beyond the nearest viewport edge(s), so the clone enters from the source's side.
 */
function startOf(rect: DOMRect): { top: number; left: number } {
  if (onScreen(rect)) return { top: rect.top, left: rect.left };
  return {
    top: Math.min(Math.max(rect.top, -rect.height), window.innerHeight),
    left: Math.min(Math.max(rect.left, -rect.width), window.innerWidth),
  };
}

/**
 * Flies a copy of `source` from its box onto the target (a {@link flyTarget} name or an
 * element), shrinking and fading on the way: a fixed-position clone in `<body>`, animated
 * with the Web Animations API on transform and opacity only (compositor, no layout shift),
 * removed when the flight finishes or is cancelled. An `<img>` source flies its displayed
 * rendition (`currentSrc`, already decoded: no new request) with the same `object-fit`.
 *
 * A source scrolled off screen still flies: the clone starts from its box clamped just
 * beyond the nearest viewport edge(s), entering from the source's side for the whole flight.
 *
 * While the flight is in the air, a Button `badge` inside the target holds its update: it
 * shows the new count and pops when the image lands (or shows it without a pop when the
 * flight is cancelled). QuantityStepper flies for you with `flyFrom` / `flyTo`.
 *
 * Call it from an interaction (it reads both boxes then), never during render. Returns the
 * animation (cancel it to abort the flight), or `null` and does nothing when motion is
 * reduced (`prefers-reduced-motion: reduce`), the Web Animations API is missing, the source
 * is missing, detached or unrendered (0 × 0, `display: none`), or the target is missing,
 * detached, unrendered or off-screen.
 *
 * @example
 * ```tsx
 * // From the add-to-cart click, before the write
 * flyTo(coverRef.current, 'cart');
 * ```
 */
export function flyTo(
  source: Element | null | undefined,
  target: string | Element | null | undefined,
  { duration = 650 }: FlyToOptions = {}
): Animation | null {
  if (typeof window === 'undefined' || !source?.isConnected || !target) return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const to = typeof target === 'string' ? resolveTarget(target) : target;
  if (!to?.isConnected) return null;
  const from = source.getBoundingClientRect();
  const end = to.getBoundingClientRect();
  if (!rendered(from) || !onScreen(end)) return null;
  const start = startOf(from);

  const clone = source.cloneNode(true) as HTMLElement;
  if (typeof clone.animate !== 'function') return null;
  if (source instanceof HTMLImageElement && clone instanceof HTMLImageElement) {
    clone.removeAttribute('srcset');
    clone.removeAttribute('sizes');
    clone.removeAttribute('loading');
    clone.src = source.currentSrc || source.src;
    clone.alt = '';
    // The source's classes may position it against its own container: style the clone alone.
    clone.removeAttribute('class');
    clone.style.objectFit = getComputedStyle(source).objectFit;
  }
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  Object.assign(clone.style, {
    // Viewport coordinates from getBoundingClientRect are physical, in RTL too.
    position: 'fixed',
    top: `${start.top}px`,
    left: `${start.left}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: '0',
    boxSizing: 'border-box',
    pointerEvents: 'none',
    zIndex: '2147483647',
    transformOrigin: 'center',
    willChange: 'transform, opacity',
  });
  document.body.append(clone);

  // Centre to centre, landing at about the target's size.
  const dx = end.left + end.width / 2 - (start.left + from.width / 2);
  const dy = end.top + end.height / 2 - (start.top + from.height / 2);
  const scale = Math.min(end.width / from.width, end.height / from.height);
  const animation = clone.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.2 },
    ],
    { duration, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
  );
  const remove = () => clone.remove();
  animation.addEventListener('finish', remove);
  animation.addEventListener('cancel', remove);
  trackFlight(to, animation);
  return animation;
}
