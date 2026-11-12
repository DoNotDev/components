// packages/components/src/advanced/ImageGallery/GalleryArrows.tsx

/**
 * @fileoverview Gallery arrows
 * @description Previous / next buttons shared by the inline gallery and the lightbox.
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import type { ReactElement } from 'react';

/** Props for {@link GalleryArrows}. */
export interface GalleryArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  /** Extra class on both buttons */
  className?: string;
}

const chevron = (points: string): ReactElement => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points={points} />
  </svg>
);

const CHEVRON_PREV = chevron('15 18 9 12 15 6');
const CHEVRON_NEXT = chevron('9 18 15 12 9 6');

/**
 * Previous and next buttons, positioned over the nearest positioned ancestor.
 *
 * @param props - GalleryArrowsProps
 * @returns The two buttons
 */
export function GalleryArrows({
  onPrev,
  onNext,
  className = '',
}: GalleryArrowsProps): ReactElement {
  return (
    <>
      <button
        type="button"
        className={`image-gallery__nav image-gallery__nav--prev ${className}`}
        onClick={onPrev}
        aria-label="Previous image"
      >
        {CHEVRON_PREV}
      </button>
      <button
        type="button"
        className={`image-gallery__nav image-gallery__nav--next ${className}`}
        onClick={onNext}
        aria-label="Next image"
      >
        {CHEVRON_NEXT}
      </button>
    </>
  );
}
