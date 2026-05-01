// packages/components/src/advanced/Marquee/Marquee.tsx

/**
 * @fileoverview Marquee Component
 * @description Marquee component with lazy loading built-in. Features smooth CSS animations with hardware acceleration, pause on hover, RTL language support, configurable speed and direction, and responsive gap spacing.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Suspense, lazy } from 'react';

import MarqueeSkeleton from './MarqueeSkeleton';
import { GAP_VARIANT } from '../../styles/componentConstants';

import type { ComponentProps } from 'react';

// Re-export props from MarqueeContent
export type { MarqueeProps } from './MarqueeContent';

// Lazy load the actual marquee implementation
const MarqueeContent = lazy(() => import('./MarqueeContent'));

/**
 * Marquee Component with lazy loading built-in
 *
 * Features:
 * - Smooth CSS animations with hardware acceleration
 * - Pause on hover
 * - RTL language support
 * - Configurable speed and direction
 * - Responsive gap spacing
 * - Lazy loading by default
 *
 * Perfect for showcasing partner logos, testimonials, or any repeating content
 */

const Marquee = (props: ComponentProps<typeof MarqueeContent>) => {
  const { gap = GAP_VARIANT.MEDIUM, direction = 'auto', ...otherProps } = props;

  // Determine if vertical for skeleton
  const isVertical = direction === 'up' || direction === 'down';

  return (
    <Suspense
      fallback={
        <MarqueeSkeleton
          itemCount={8}
          gap={gap}
          direction={isVertical ? 'vertical' : 'horizontal'}
        />
      }
    >
      <MarqueeContent gap={gap} direction={direction} {...otherProps} />
    </Suspense>
  );
};

export default Marquee;
