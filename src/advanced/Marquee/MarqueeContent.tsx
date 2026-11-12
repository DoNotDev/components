// packages/components/src/advanced/Marquee/MarqueeContent.tsx

/**
 * @fileoverview Marquee Content Component
 * @description Production-grade marquee with accessibility, reduced motion support, and smart behavior detection
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useRef, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

import Stack from '../../atomic/Stack';
import { GAP_VARIANT } from '../../styles/componentConstants';
import { addEventListener } from '../../utils/eventListener';
import { cn } from '../../utils/helpers';
import { observeElement } from '../../utils/intersectionObserver';
import { withCssVars } from '../../utils/cssVars';

/** Props for the Marquee component -- infinitely scrolling content strip. */
export type MarqueeProps<T = unknown> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  gap?: 'none' | 'tight' | 'medium' | 'large';
  speed?: number; // px per second
  direction?: 'left' | 'right' | 'up' | 'down' | 'auto';
  pauseOnHover?: boolean;
  ariaLabel?: string;
  // Framework-quality additions
  reducedMotion?: 'respect' | 'ignore';
  behavior?: 'bounce' | 'infinite' | 'auto';
  pauseOnFocusWithin?: boolean;
  easing?: 'linear' | 'ease-in-out' | 'ease-out';
};

const GAP_VALUES: Record<NonNullable<MarqueeProps['gap']>, number> = {
  none: 0,
  tight: 8,
  medium: 16,
  large: 32,
};

const GAP_CLASS: Record<NonNullable<MarqueeProps['gap']>, string> = {
  none: 'dndev-gap-none',
  tight: 'dndev-gap-sm',
  medium: 'dndev-gap-md',
  large: 'dndev-gap-lg',
};

const EASING_VALUES = {
  linear: 'linear',
  'ease-in-out': 'ease-in-out',
  'ease-out': 'ease-out',
} as const;

/**
 * Marquee Content Component - Core implementation
 *
 * This is the heavy implementation that gets lazy loaded.
 * The wrapper component handles Suspense and fallbacks.
 *
 * Production-grade marquee with:
 * - Perfect accessibility (WCAG 2.1 AA compliant)
 * - Reduced motion support
 * - Smart behavior detection
 * - Intersection Observer optimization
 * - SSR/CSR safe with graceful fallbacks
 */
function Marquee<T = unknown>({
  items,
  renderItem,
  className,
  itemClassName,
  gap = GAP_VARIANT.MEDIUM,
  speed = 48,
  direction = 'auto',
  pauseOnHover = true,
  ariaLabel,
  // Framework defaults
  reducedMotion = 'respect',
  behavior = 'auto',
  pauseOnFocusWithin = true,
  easing = 'ease-in-out',
}: MarqueeProps<T>) {
  const [isRTL, setIsRTL] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Read document.dir reactively after mount (SSR-safe)
  // Uses MutationObserver to react to runtime dir attribute changes (e.g., language switcher)
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const htmlEl = document.documentElement;
    setIsRTL(htmlEl.dir === 'rtl');

    const observer = new MutationObserver(() => {
      setIsRTL(htmlEl.dir === 'rtl');
    });
    observer.observe(htmlEl, { attributes: true, attributeFilter: ['dir'] });

    return () => observer.disconnect();
  }, []);

  // Determine final direction
  let finalDirection = direction;
  if (direction === 'auto') {
    finalDirection = isRTL ? 'right' : 'left';
  }

  // Check if vertical scrolling
  const isVertical = finalDirection === 'up' || finalDirection === 'down';

  // Smart behavior detection
  const shouldAnimate = reducedMotion === 'ignore' || !prefersReducedMotion;
  let finalBehavior = behavior;
  if (behavior === 'auto') {
    // Auto-detect: bounce for small item counts, infinite for many items
    finalBehavior = items.length <= 20 ? 'bounce' : 'infinite';
  }

  // State for dynamic calculations
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cycleMs, setCycleMs] = useState<number>(8000);
  const [scrollDistance, setScrollDistance] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [contentOverflows, setContentOverflows] = useState<boolean>(false);

  // Intersection Observer for performance optimization
  useEffect(() => {
    if (!containerRef.current) return;

    const cleanup = observeElement(
      containerRef.current,
      (entry) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    return cleanup;
  }, []);

  // Content measurement and resize handling
  useEffect(() => {
    if (
      !containerRef.current ||
      typeof window === 'undefined' ||
      !shouldAnimate
    )
      return;

    const container = containerRef.current;
    const track = container.querySelector(
      '[data-marquee-track]'
    ) as HTMLElement | null;
    if (!track) return;

    const measureContent = () => {
      const containerSize = isVertical
        ? container.clientHeight
        : container.clientWidth;
      const contentSize = isVertical ? track.scrollHeight : track.scrollWidth;
      const overflow = Math.max(0, contentSize - containerSize);

      setContentOverflows(overflow > 0);

      if (overflow > 0) {
        const pxPerSec = Math.min(512, Math.max(12, speed));

        if (finalBehavior === 'bounce') {
          // Bounce animation: go to end, then return (2x distance)
          const durationMs = ((overflow * 2) / pxPerSec) * 1000;
          setCycleMs(Math.max(2000, Math.floor(durationMs)));
          setScrollDistance(overflow);
        } else {
          // Infinite scroll: use full content width for seamless loop
          const durationMs =
            ((contentSize + GAP_VALUES[gap]) / pxPerSec) * 1000;
          setCycleMs(Math.max(2000, Math.floor(durationMs)));
          setScrollDistance(contentSize + GAP_VALUES[gap]);
        }
      } else {
        // Content fits in container - no animation needed
        setCycleMs(0);
        setScrollDistance(0);
      }
    };

    // Initial measurement
    const initialMeasure = () => requestAnimationFrame(measureContent);
    initialMeasure();

    // Responsive resize handling with feature detection
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(measureContent);
      });

      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    } else {
      // Fallback for older browsers
      const handleResize = () => requestAnimationFrame(measureContent);
      return addEventListener(window, 'resize', handleResize);
    }
  }, [items, speed, isVertical, shouldAnimate, finalBehavior, gap]);

  // Determine CSS animation direction
  const getAnimationDirection = () => {
    if (isVertical) {
      return finalDirection === 'up' ? 'normal' : 'reverse';
    } else {
      return finalDirection === 'left' ? 'normal' : 'reverse';
    }
  };

  // Render content - handle both bounce and infinite behaviors
  const renderContent = () => {
    if (finalBehavior === 'infinite' && contentOverflows) {
      // Infinite scroll: duplicate content for seamless loop
      return [...items, ...items].map((item, idx) => (
        <div key={idx} className={cn('dndev-flex-shrink-0', itemClassName)}>
          {renderItem(item as T, idx % items.length)}
        </div>
      ));
    } else {
      // Bounce or no-overflow: single set of items
      return items.map((item, idx) => (
        <div key={idx} className={cn('dndev-flex-shrink-0', itemClassName)}>
          {renderItem(item as T, idx)}
        </div>
      ));
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'dndev-relative dndev-overflow-hidden',
        pauseOnHover && 'group',
        pauseOnFocusWithin && 'focus-within:group',
        className
      )}
      role="region"
      aria-label={
        ariaLabel ||
        `${finalBehavior === 'infinite' ? 'Scrolling' : 'Bouncing'} content with ${items.length} items`
      }
      aria-live={shouldAnimate && isVisible ? 'off' : 'polite'}
    >
      <Stack
        className="marquee-track"
        direction={isVertical ? 'column' : 'row'}
        align={!isVertical ? 'center' : undefined}
        gap={gap}
        data-marquee-track
        data-marquee-direction={isVertical ? 'vertical' : 'horizontal'}
        data-marquee-behavior={finalBehavior}
        data-marquee-reduced-motion={!shouldAnimate}
        style={withCssVars({
          '--marquee-duration':
            shouldAnimate && isVisible && contentOverflows
              ? `${cycleMs}ms`
              : '0ms',
          '--marquee-direction': getAnimationDirection(),
          '--marquee-distance': isVertical
            ? `${scrollDistance}px`
            : `${scrollDistance}px`,
          '--marquee-easing': EASING_VALUES[easing],
          // Pause animation when not visible or reduced motion is preferred
          animationPlayState:
            !shouldAnimate || !isVisible ? 'paused' : 'running',
        })}
      >
        {renderContent()}
      </Stack>
    </div>
  );
}

export default Marquee;
