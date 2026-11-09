'use client';
// packages/components/src/advanced/ImageGallery/ImageGallery.tsx

/**
 * @fileoverview ImageGallery component
 * @description Full-featured image gallery with keyboard navigation, arrows, and wrapping thumbnails
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
} from 'react';

import Dialog from '../../atomic/Dialog';
import { handleImageError } from '../../utils/imageRetry';
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
 * - Keyboard navigation (← → arrows)
 * - Previous/Next buttons on main image
 * - Wrapping thumbnail grid
 * - Focus management for accessibility
 * - Lightbox on main image click (opt out with `nobox`)
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
  const [loadedFullUrls, setLoadedFullUrls] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxPanelRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // Track whether the index changed via user navigation (not initial mount)
  const isUserNavigationRef = useRef(false);

  const normalizedImages = images.map((img) => normalizeImage(img, fit));
  const hasMultiple = normalizedImages.length > 1;

  // Trim stale refs when the image list shrinks
  thumbnailRefs.current = thumbnailRefs.current.slice(
    0,
    normalizedImages.length
  );

  // Clamp selectedIndex when images array shrinks
  useEffect(() => {
    if (
      normalizedImages.length > 0 &&
      selectedIndex >= normalizedImages.length
    ) {
      setSelectedIndex(normalizedImages.length - 1);
    }
  }, [normalizedImages.length, selectedIndex]);

  const goToImage = useCallback(
    (index: number) => {
      const newIndex =
        (index + normalizedImages.length) % normalizedImages.length;
      isUserNavigationRef.current = true;
      setSelectedIndex(newIndex);
      onImageChange?.(newIndex);

      // Preload full image if not already loaded
      const image = normalizedImages[newIndex];
      if (
        image &&
        image.full !== image.thumb &&
        !loadedFullUrls.has(newIndex)
      ) {
        const img = new Image();
        img.onload = () => {
          setLoadedFullUrls((prev) => new Set(prev).add(newIndex));
        };
        img.onerror = () => {
          // Mark as loaded so we stop retrying — the thumbnail remains visible as fallback
          setLoadedFullUrls((prev) => new Set(prev).add(newIndex));
        };
        img.src = image.full;
      }
    },
    [normalizedImages, onImageChange, loadedFullUrls]
  );

  const goNext = useCallback(
    () => goToImage(selectedIndex + 1),
    [goToImage, selectedIndex]
  );
  const goPrev = useCallback(
    () => goToImage(selectedIndex - 1),
    [goToImage, selectedIndex]
  );

  const handleMainAreaClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (nobox) return;
      if ((e.target as HTMLElement).closest('.image-gallery__nav')) return;
      setLightboxOpen(true);
    },
    [nobox]
  );

  const handleLightboxKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!hasMultiple) return;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        default:
          break;
      }
    },
    [hasMultiple, goPrev, goNext]
  );

  useEffect(() => {
    if (normalizedImages.length === 0) setLightboxOpen(false);
  }, [normalizedImages.length]);

  useEffect(() => {
    if (nobox) setLightboxOpen(false);
  }, [nobox]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const id = requestAnimationFrame(() => {
      lightboxPanelRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [lightboxOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!hasMultiple) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goNext();
          break;
        case 'Home':
          e.preventDefault();
          goToImage(0);
          break;
        case 'End':
          e.preventDefault();
          goToImage(normalizedImages.length - 1);
          break;
      }
    },
    [hasMultiple, goPrev, goNext, goToImage, normalizedImages.length]
  );

  // Focus thumbnail only on user-driven navigation, not on initial mount (WCAG)
  useEffect(() => {
    if (!isUserNavigationRef.current) return;
    isUserNavigationRef.current = false;
    thumbnailRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  if (normalizedImages.length === 0) {
    return (
      <div
        className="image-gallery image-gallery--empty"
        style={{ aspectRatio }}
      >
        <span className="image-gallery__placeholder">No images</span>
      </div>
    );
  }

  const clampedIndex = Math.min(selectedIndex, normalizedImages.length - 1);
  const currentImage = normalizedImages[clampedIndex]!;
  // Contained images (cut-out packshots) sit inset from the frame edges.
  const containInset: CSSProperties =
    currentImage.fit === 'contain'
      ? { boxSizing: 'border-box', padding: '6%' }
      : {};

  return (
    <div
      ref={containerRef}
      className="image-gallery"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image gallery"
      aria-roledescription="carousel"
    >
      {/* Main Image */}
      <div
        className={`image-gallery__main${nobox ? '' : ' image-gallery__main--lightbox'}`}
        style={{ aspectRatio }}
        onClick={handleMainAreaClick}
      >
        {/* Thumbnail shown immediately for instant feedback */}
        {currentImage.full !== currentImage.thumb && (
          <img
            src={currentImage.thumb}
            alt=""
            className="image-gallery__main-image"
            onError={handleImageError}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: currentImage.fit,
              ...containInset,
              opacity: loadedFullUrls.has(clampedIndex) ? 0 : 1,
              transition: 'opacity 0.3s ease',
              zIndex: 1,
            }}
          />
        )}
        {/* Full resolution image - fades in when loaded */}
        <img
          src={currentImage.full}
          alt={`${altPrefix} ${clampedIndex + 1} of ${normalizedImages.length}`}
          className="image-gallery__main-image"
          style={{
            position:
              currentImage.full !== currentImage.thumb
                ? 'absolute'
                : 'relative',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: currentImage.fit,
            ...containInset,
            opacity:
              loadedFullUrls.has(clampedIndex) ||
              currentImage.full === currentImage.thumb
                ? 1
                : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 2,
          }}
          onError={handleImageError}
          onLoad={() => {
            if (currentImage.full !== currentImage.thumb) {
              setLoadedFullUrls((prev) => new Set(prev).add(clampedIndex));
            }
          }}
        />

        {/* Navigation Arrows */}
        {hasMultiple && (
          <>
            <button
              type="button"
              className="image-gallery__nav image-gallery__nav--prev"
              onClick={goPrev}
              aria-label="Previous image"
            >
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="image-gallery__nav image-gallery__nav--next"
              onClick={goNext}
              aria-label="Next image"
            >
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div
          className="image-gallery__thumbnails"
          role="tablist"
          aria-label="Image thumbnails"
        >
          {normalizedImages.map((img, index) => (
            <button
              key={index}
              ref={(el) => {
                thumbnailRefs.current[index] = el;
              }}
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
                onError={handleImageError}
              />
            </button>
          ))}
        </div>
      )}

      {!nobox && (
        <Dialog
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          showClose
          className="image-gallery__lightbox"
        >
          <div
            ref={lightboxPanelRef}
            className="image-gallery__lightbox-body"
            onKeyDown={handleLightboxKeyDown}
            tabIndex={-1}
          >
            <img
              src={currentImage.full}
              alt={`${altPrefix} ${clampedIndex + 1} of ${normalizedImages.length}`}
              className="image-gallery__lightbox-img"
              onError={handleImageError}
            />
            {hasMultiple && (
              <>
                <button
                  type="button"
                  className="image-gallery__nav image-gallery__nav--prev image-gallery__lightbox-nav"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                  aria-label="Previous image"
                >
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
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="image-gallery__nav image-gallery__nav--next image-gallery__lightbox-nav"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                  aria-label="Next image"
                >
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
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default ImageGallery;
