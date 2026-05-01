// packages/components/src/advanced/Carousel/Carousel.tsx

/**
 * @fileoverview Carousel Component
 * @description Premium carousel component with lazy loading built-in. Features true infinite circular loop, hardware-accelerated animations, swipe/touch gestures, autoplay with pause-on-hover, and lazy loading by default.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Suspense, lazy } from 'react';

import CarouselSkeleton from './CarouselSkeleton';

// Re-export props and ref types from CarouselContent
export type { CarouselRef } from './CarouselContent';

import type { CarouselProps } from './CarouselContent';
export type { CarouselProps };

// Lazy load the actual carousel implementation
const CarouselContent = lazy(() => import('./CarouselContent'));

/**
 * Premium Carousel Component with lazy loading built-in
 *
 * Features:
 * - True infinite circular loop
 * - Hardware-accelerated animations
 * - Swipe/touch gestures
 * - Autoplay with pause-on-hover
 * - Lazy loading by default
 * - Full accessibility support
 * - SSR/CSR compatible
 * - Responsive and RTL-aware
 *
 * Simply pass items and renderItem - everything else is handled automatically!
 */
const Carousel = (props: CarouselProps) => {
  const { showArrows = true, showDots = false, showProgress = true } = props;

  return (
    <Suspense
      fallback={
        <CarouselSkeleton
          showArrows={showArrows}
          showDots={showDots}
          showProgress={showProgress}
        />
      }
    >
      <CarouselContent {...props} />
    </Suspense>
  );
};

export default Carousel;
