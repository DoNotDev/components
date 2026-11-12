'use client';
// packages/components/src/advanced/ImageGallery/ImageGallery.tsx

/**
 * @fileoverview ImageGallery component
 * @description Image gallery: swipeable main view, arrows, keyboard navigation, wrapping
 * thumbnails and a full-screen zoomable lightbox.
 *
 * @version 0.2.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import { flushSync } from 'react-dom';

import Dialog from '../../atomic/Dialog';
import { handleImageError } from '../../utils/imageRetry';
import { ResponsiveImg } from '../../utils/responsiveImage';
import { GalleryArrows } from './GalleryArrows';
import { LightboxViewer, prepareFrame } from './LightboxViewer';
import { blockContextMenu } from './protectImages';
import {
  arrowStep,
  isNearSlide,
  scrollToSlide,
  useCurrentSlide,
} from './snapStrip';
import './ImageGallery.css';

/** Image source data for ImageGallery. */
export interface ImageData {
  fullUrl?: string;
  thumbUrl?: string;
  /** Per-image override of the gallery `fit` (e.g. `'contain'` for a cut-out packshot). */
  fit?: ImageFit;
}

/** `'cover'` crops to fill the frame; `'contain'` shows the whole image on the muted frame. */
export type ImageFit = 'cover' | 'contain';

/** Props for the ImageGallery component -- thumbnail strip with main image preview. */
export interface ImageGalleryProps {
  /** Array of images - can be objects with fullUrl/thumbUrl or plain strings */
  images: Array<ImageData | string>;
  /** Aspect ratio for main image (default: '16/9') */
  aspectRatio?: string;
  /** Alt text prefix for images */
  altPrefix?: string;
  /** Callback when image changes */
  onImageChange?: (index: number) => void;
  /**
   * Set to opt out of the full-size image dialog (no click-to-enlarge).
   * Omit for default behavior (lightbox on).
   */
  nobox?: boolean;
  /**
   * How images fill the main frame and thumbnails. Overridden per image by `ImageData.fit`.
   * @default 'cover'
   */
  fit?: ImageFit;
}

/** `view-transition-name` of the image morphing between the gallery and the lightbox. */
const MORPH_NAME = 'image-gallery-image';

/**
 * Whether open / close can morph: view transitions supported and motion allowed.
 * Same conditions as the CSS that turns the dialog's own fade off.
 */
function canMorph(): boolean {
  return (
    typeof document.startViewTransition === 'function' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Normalize image data to consistent format
 */
function normalizeImage(
  img: ImageData | string,
  fit: ImageFit
): {
  full: string;
  thumb: string;
  fit: ImageFit;
} {
  if (typeof img === 'string') {
    return { full: img, thumb: img, fit };
  }
  return {
    full: img.fullUrl || img.thumbUrl || '',
    thumb: img.thumbUrl || img.fullUrl || '',
    fit: img.fit ?? fit,
  };
}

/**
 * ImageGallery - Full-featured image gallery component
 *
 * Features:
 * - Main view swipes natively (CSS scroll-snap, browser-driven scrolling)
 * - Previous/Next buttons, keyboard navigation (← → Home End)
 * - Wrapping thumbnail grid
 * - Lightbox on main image click (opt out with `nobox`): the image morphs into it and
 *   back (view transition); swipe to page, swipe up/down to close, pinch / double-tap /
 *   ctrl+wheel to zoom, drag to pan with momentum and elastic edges
 * - Current and neighbouring images load eagerly, the rest lazily
 *
 * @example
 * ```tsx
 * <ImageGallery
 *   images={[
 *     { fullUrl: '/img1-full.jpg', thumbUrl: '/img1-thumb.jpg' },
 *     '/img2.jpg',
 *   ]}
 *   aspectRatio="16/9"
 * />
 * ```
 */
export function ImageGallery({
  images,
  aspectRatio = '16/9',
  altPrefix = 'Image',
  onImageChange,
  nobox,
  fit = 'cover',
}: ImageGalleryProps): ReactElement {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const lightboxFrameRef = useRef<HTMLDivElement>(null);

  const normalizedImages = useMemo(
    () => images.map((img) => normalizeImage(img, fit)),
    [images, fit]
  );
  const count = normalizedImages.length;
  const hasMultiple = count > 1;
  const clampedIndex = Math.min(selectedIndex, Math.max(count - 1, 0));

  // Clamp selectedIndex when images array shrinks
  useEffect(() => {
    if (count > 0 && selectedIndex >= count) {
      setSelectedIndex(count - 1);
    }
  }, [count, selectedIndex]);

  /** Updates the current index; reports it when it changed. */
  const commitIndex = (index: number): void => {
    if (index === clampedIndex) return;
    setSelectedIndex(index);
    onImageChange?.(index);
  };

  /** Navigation from buttons, keys, thumbnails and the lightbox. Wraps around. */
  const goToImage = (raw: number, instant = false): number => {
    const index = (raw + count) % count;
    commitIndex(index);
    if (stripRef.current) scrollToSlide(stripRef.current, index, instant);
    return index;
  };

  // Swipes / trackpad scrolls are native: the slide that is mostly visible is current.
  useCurrentSlide(stripRef, count, commitIndex);

  /**
   * Opens / closes the lightbox. With view transitions, the current image morphs:
   * gallery slide -> lightbox frame on open, back on close (whatever closes it: swipe,
   * background tap, close button, Esc). One element carries the name at a time.
   */
  const setLightbox = (open: boolean): void => {
    if (open === lightboxOpen) return;
    const slide = stripRef.current?.children[clampedIndex];
    const from = open ? slide : lightboxFrameRef.current;
    if (!canMorph() || !(from instanceof HTMLElement)) {
      setLightboxOpen(open);
      return;
    }
    from.style.viewTransitionName = MORPH_NAME;
    let to: HTMLElement | null = null;
    const transition = document.startViewTransition(async () => {
      from.style.viewTransitionName = '';
      flushSync(() => setLightboxOpen(open));
      const target = open ? lightboxFrameRef.current : slide;
      if (!(target instanceof HTMLElement)) return;
      if (open) await prepareFrame(target);
      target.style.viewTransitionName = MORPH_NAME;
      to = target;
    });
    void transition.finished.then(() => {
      if (to) to.style.viewTransitionName = '';
    });
  };

  const handleMainAreaClick = (e: MouseEvent<HTMLDivElement>): void => {
    if (nobox) return;
    if ((e.target as HTMLElement).closest('.image-gallery__nav')) return;
    setLightbox(true);
  };

  useEffect(() => {
    if (count === 0) setLightboxOpen(false);
  }, [count]);

  useEffect(() => {
    if (nobox) setLightboxOpen(false);
  }, [nobox]);

  // Keyboard navigation; focus follows the selected thumbnail (tablist pattern).
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (!hasMultiple || lightboxOpen) return;
    const step = arrowStep(e);
    let target: number;
    if (step !== 0) target = clampedIndex + step;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = count - 1;
    else return;
    e.preventDefault();
    const thumbnail = thumbnailsRef.current?.children[goToImage(target)];
    if (thumbnail instanceof HTMLElement) thumbnail.focus();
  };

  if (count === 0) {
    return (
      <div
        className="image-gallery image-gallery--empty"
        style={{ aspectRatio }}
      >
        <span className="image-gallery__placeholder">No images</span>
      </div>
    );
  }

  return (
    <div
      className="image-gallery"
      onKeyDown={handleKeyDown}
      onContextMenu={blockContextMenu}
      tabIndex={0}
      role="region"
      aria-label="Image gallery"
      aria-roledescription="carousel"
    >
      {/* Main view */}
      <div
        className={`image-gallery__main${nobox ? '' : ' image-gallery__main--lightbox'}`}
        style={{ aspectRatio }}
        onClick={handleMainAreaClick}
      >
        <div ref={stripRef} className="image-gallery__strip">
          {normalizedImages.map((img, index) => {
            // Current and neighbours load now, so a swipe never reveals an empty slide.
            const loading = isNearSlide(index, clampedIndex, count)
              ? 'eager'
              : 'lazy';
            return (
              <div
                key={index}
                className="image-gallery__slide"
                aria-hidden={index === clampedIndex ? undefined : true}
              >
                {/* Cached thumbnail under the full image: instant content while it loads.
                    Cover only: a contained (transparent) image would show it through. */}
                {img.fit === 'cover' && img.full !== img.thumb && (
                  <img
                    src={img.thumb}
                    alt=""
                    className="image-gallery__slide-img image-gallery__slide-placeholder"
                    loading={loading}
                    decoding="async"
                    draggable={false}
                    onError={handleImageError}
                  />
                )}
                {/* Phones get the thumbnail, larger screens the full image;
                    the lightbox always shows the full image. */}
                <ResponsiveImg
                  image={{ fullUrl: img.full, thumbUrl: img.thumb }}
                  alt={`${altPrefix} ${index + 1} of ${count}`}
                  className="image-gallery__slide-img"
                  data-fit={img.fit}
                  loading={loading}
                  decoding="async"
                  draggable={false}
                  onError={handleImageError}
                />
              </div>
            );
          })}
        </div>

        {hasMultiple && (
          <GalleryArrows
            onPrev={() => goToImage(clampedIndex - 1)}
            onNext={() => goToImage(clampedIndex + 1)}
          />
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div
          ref={thumbnailsRef}
          className="image-gallery__thumbnails"
          role="tablist"
          aria-label="Image thumbnails"
        >
          {normalizedImages.map((img, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === clampedIndex}
              aria-label={`View image ${index + 1}`}
              className={`image-gallery__thumbnail ${
                index === clampedIndex
                  ? 'image-gallery__thumbnail--selected'
                  : ''
              }`}
              onClick={() => goToImage(index)}
            >
              <img
                src={img.thumb}
                alt=""
                className="image-gallery__thumbnail-image"
                data-fit={img.fit}
                draggable={false}
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}

      {!nobox && (
        <Dialog
          open={lightboxOpen}
          onOpenChange={setLightbox}
          showClose
          noSwipe
          className="image-gallery__lightbox"
        >
          <LightboxViewer
            images={normalizedImages}
            index={clampedIndex}
            onIndexChange={(index) => goToImage(index, true)}
            onClose={() => setLightbox(false)}
            altPrefix={altPrefix}
            frameRef={lightboxFrameRef}
          />
        </Dialog>
      )}
    </div>
  );
}

export default ImageGallery;
