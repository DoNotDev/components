// packages/components/src/advanced/ImageGallery/snapStrip.ts

/**
 * @fileoverview Scroll-snap strip helpers
 * @description The one paging engine of ImageGallery (inline view and lightbox): a CSS
 * scroll-snap strip, one slide per snap point. The browser owns swipes, momentum and
 * snapping; these helpers only move the strip from code and read which slide is shown.
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useEffectEvent } from 'react';
import type { KeyboardEvent, RefObject } from 'react';

/** Share of a slide that must be visible in its strip for it to become current. */
const CURRENT_SLIDE_THRESHOLD = 0.6;

/**
 * Whether slide `index` is the current slide or one of its neighbours (wrapping around).
 * These load at once, so paging never reveals an empty slide.
 */
export function isNearSlide(
  index: number,
  current: number,
  count: number
): boolean {
  const distance = Math.abs(index - current);
  return Math.min(distance, count - distance) <= 1;
}

/**
 * Scrolls a strip to slide `index`. Animated when the slide is at most one slide away
 * from where the strip is now, instant for a longer jump or when `instant` is set.
 * The animation is the strip's CSS `scroll-behavior` (off under reduced motion).
 * Direction-agnostic: a slide's `offsetLeft` is its scroll offset in LTR and RTL
 * (the strip is the slides' offset parent).
 */
export function scrollToSlide(
  strip: HTMLElement,
  index: number,
  instant = false
): void {
  const slide = strip.children[index];
  if (!(slide instanceof HTMLElement)) return;
  const left = slide.offsetLeft;
  const near = Math.abs(left - strip.scrollLeft) <= strip.clientWidth + 1;
  strip.scrollTo({ left, behavior: instant || !near ? 'instant' : 'auto' });
}

/**
 * Logical paging step of a physical arrow key: `1` (next) or `-1` (previous), `0` for
 * any other key. In RTL, ArrowLeft is next.
 */
export function arrowStep(e: KeyboardEvent<HTMLElement>): number {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return 0;
  const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
  return (e.key === 'ArrowRight') === rtl ? -1 : 1;
}

/**
 * Reports the slide a strip shows, whatever moved it (swipe, trackpad, momentum,
 * `scrollToSlide`). One IntersectionObserver, no scroll listener.
 *
 * @param stripRef - The strip element; its children are the slides
 * @param count - Number of slides (the observer re-subscribes when it changes)
 * @param onChange - Called with the index of the slide that became mostly visible
 */
export function useCurrentSlide(
  stripRef: RefObject<HTMLElement | null>,
  count: number,
  onChange: (index: number) => void
): void {
  const report = useEffectEvent(onChange);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || count < 2) return;
    const slides = Array.from(strip.children);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= CURRENT_SLIDE_THRESHOLD) {
            report(slides.indexOf(entry.target));
          }
        }
      },
      { root: strip, threshold: CURRENT_SLIDE_THRESHOLD }
    );
    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, [stripRef, count]);
}
