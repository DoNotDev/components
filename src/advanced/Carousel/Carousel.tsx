// packages/components/src/advanced/Carousel/Carousel.tsx

/**
 * @fileoverview Carousel Component
 * @description Premium carousel component with lazy loading built-in. Features opt-in infinite circular loop, hardware-accelerated animations, swipe/touch gestures, opt-in autoplay (pauses on hover/focus), translatable labels and the WAI-ARIA carousel pattern.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Suspense, lazy } from 'react';

import type { CarouselProps } from './CarouselContent';
import CarouselSkeleton from './CarouselSkeleton';

// Re-export props and ref types from CarouselContent
export type { CarouselRef } from './CarouselContent';

export type { CarouselProps };

// Lazy load the actual carousel implementation
const CarouselContent = lazy(() => import('./CarouselContent'));

/**
 * Premium Carousel Component with lazy loading built-in
 *
 * Features:
 * - Opt-in infinite circular loop (`infinite`)
 * - Hardware-accelerated animations
 * - Swipe/touch gestures
 * - Opt-in autoplay (pauses on hover/focus, off under reduced motion)
 * - Lazy loading by default
 * - WAI-ARIA carousel pattern: labelled region, focusable controls, off-screen
 *   slides inert, polite announcements (silent while autoplay rotates)
 * - Labels translated by the component (`dndev:carousel.*`); `previousLabel`, `nextLabel`, `slideLabel`, ... override
 * - SSR/CSR compatible
 * - Responsive and RTL-aware
 *
 * Simply pass items and renderItem - everything else is handled automatically!
 */
function Carousel<T = unknown>(props: CarouselProps<T>) {
  const {
    showArrows = true,
    showDots = false,
    showProgress = true,
    loadingLabel,
  } = props;

  return (
    <Suspense
      fallback={
        <CarouselSkeleton
          showArrows={showArrows}
          showDots={showDots}
          showProgress={showProgress}
          loadingLabel={loadingLabel}
        />
      }
    >
      {/* why: React.lazy erases the generic; the item type is checked at this call site */}
      <CarouselContent {...(props as CarouselProps)} />
    </Suspense>
  );
}

export default Carousel;
