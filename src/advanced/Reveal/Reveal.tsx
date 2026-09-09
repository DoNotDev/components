// packages/components/src/advanced/Reveal/Reveal.tsx

/**
 * @fileoverview Reveal Component
 * @description Reveal component for staggered animations. Features viewport-based visibility detection, directional animations, customizable stagger delays, and support for string arrays or ReactNode arrays.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ReactNode, ComponentType, CSSProperties } from 'react';

import { useViewportVisibility } from '../../hooks/useViewportVisibility';
import { cn } from '../../utils/helpers';

/** Props for the Reveal component -- scroll-triggered entrance animations. */
export interface RevealProps {
  items: string[] | ReactNode[];
  direction?:
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'fade-in'
    | 'alternate-h' // horizontal alternating (left/right)
    | 'alternate-v'; // vertical alternating (top/bottom)
  stagger?: number; // milliseconds between items
  threshold?: number;
  distance?: number; // animation distance in pixels
  duration?: number; // animation duration in milliseconds
  once?: boolean; // if true, only animate once
  viewport?: boolean; // if true, only animate items in viewport
  overrides?: Array<{
    index: number;
    direction: 'left' | 'right' | 'top' | 'bottom' | 'fade-in';
  }>;
  className?: string;
  children?: ReactNode;
}

/**
 * Industry-standard reveal animation component
 * Based on patterns from Framer Motion, AOS, and modern design systems
 *
 * Features:
 * - SSR-safe with progressive enhancement
 * - Hardware-accelerated animations
 * - Reduced motion support
 * - Proper stagger timing
 * - 100% Lighthouse compliant
 */
const Reveal: ComponentType<RevealProps> = ({
  items = [],
  direction = 'fade-in',
  stagger = 100,
  threshold,
  distance,
  duration,
  once = false, // Default to false for re-triggering
  viewport = true, // Default to true for viewport-based animation
  overrides = [],
  className,
  children,
}) => {
  const {
    ref: containerRef,
    isVisible,
    hasTriggered,
    visibleItems,
    isItemVisible,
  } = useViewportVisibility({
    threshold,
    once,
    trackItems: viewport,
    enableScrollListener: viewport,
  });

  // Calculate direction for each item
  const getItemDirection = (index: number): string => {
    // Check for override first
    const override = overrides.find((o) => o.index === index);
    if (override) return override.direction;

    // Apply pattern-based direction
    switch (direction) {
      case 'alternate-h':
        return index % 2 === 0 ? 'left' : 'right';
      case 'alternate-v':
        return index % 2 === 0 ? 'top' : 'bottom';
      default:
        return direction;
    }
  };

  // Render items with proper stagger timing
  // Always wrap in div - no cloneElement needed (React 19 compatible)
  const renderItems = () =>
    items.map((item, index) => {
      const itemDirection = getItemDirection(index);
      const delayMs = index * stagger;
      const shouldAnimate = viewport ? isItemVisible(index) : isVisible;

      return (
        <div
          // Index keys are intentional — items don't have stable IDs and the list
          // order is fixed for animation stagger purposes.
          key={index}
          className="dndev-reveal-item"
          data-direction={itemDirection}
          data-visible={shouldAnimate}
          style={
            {
              '--reveal-delay': `${delayMs}ms`,
              '--reveal-index': index,
              ...(distance !== undefined && {
                '--reveal-distance': `${distance}vw`,
              }),
              ...(duration !== undefined && {
                '--reveal-duration': `${duration}ms`,
              }),
            } as CSSProperties
          }
        >
          {item}
        </div>
      );
    });

  return (
    <div
      ref={containerRef}
      className={cn(
        'dndev-reveal-container',
        isVisible && 'dndev-reveal-visible',
        className
      )}
      data-direction={direction}
      data-stagger={stagger}
    >
      {items.length > 0 ? renderItems() : children}
    </div>
  );
};

export default Reveal;
