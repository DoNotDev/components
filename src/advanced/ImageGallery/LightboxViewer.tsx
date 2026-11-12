'use client';
// packages/components/src/advanced/ImageGallery/LightboxViewer.tsx

/**
 * @fileoverview Lightbox viewer
 * @description Full-screen image viewer for ImageGallery.
 *
 * - Paging: a CSS scroll-snap strip (native swipe, momentum, snapping; no JS per frame).
 * - Swipe up/down to close, pinch / double-tap / click / ctrl+wheel to zoom, drag to
 *   pan: `lightboxGestures.ts`, attached to the current slide.
 * - React renders only when the index changes. Only the current image and its two
 *   neighbours are mounted, so the next image is already loaded when a swipe starts
 *   and decoded full-size images stay bounded at three. The current one is fetched at
 *   high priority, the neighbours at low.
 * - Each image sits in a frame over its cached thumbnail, so the viewer never shows an
 *   empty slide while a full-size image downloads. The frame takes the image's aspect
 *   ratio as soon as either rendition knows it (CSS sizes it), so it is exactly the
 *   image: the zoom / pan / hit-test target and the open / close morph target.
 *
 * @version 0.2.0
 * @since 0.2.2
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useEffectEvent, useLayoutEffect, useRef } from 'react';
import type { KeyboardEvent, ReactElement, RefObject, SyntheticEvent } from 'react';

import { handleImageError } from '../../utils/imageRetry';
import { GalleryArrows } from './GalleryArrows';
import { attachLightboxGestures } from './lightboxGestures';
import { blockContextMenu } from './protectImages';
import {
  arrowStep,
  isNearSlide,
  scrollToSlide,
  useCurrentSlide,
} from './snapStrip';

/**
 * Gives a frame the aspect ratio of `img` (any rendition), once. CSS then sizes the frame
 * to the image fitted in the slide.
 */
function sizeFrame(frame: HTMLElement, img: HTMLImageElement): void {
  if (frame.hasAttribute('data-sized') || img.naturalWidth === 0) return;
  frame.style.setProperty(
    '--image-ratio',
    String(img.naturalWidth / img.naturalHeight)
  );
  frame.setAttribute('data-sized', '');
}

/** Load handler of the frame images: size the frame; the full image hides the placeholder. */
function onFrameImageLoad(e: SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  const frame = img.parentElement;
  if (!frame) return;
  sizeFrame(frame, img);
  if (img.classList.contains('image-gallery__lightbox-img')) {
    frame.setAttribute('data-loaded', '');
  }
}

/**
 * Waits until a frame shows its image (the cached thumbnail decodes at once) and sizes
 * it. For the open morph: the new state must be captured with the image painted.
 * A decode failure (broken image) does not block: the frame is shown as it is.
 *
 * @param frame - The current frame (`frameRef`)
 */
export async function prepareFrame(frame: HTMLElement): Promise<void> {
  const img = frame.querySelector('img');
  if (!img) return;
  try {
    await img.decode();
  } catch {
    return;
  }
  sizeFrame(frame, img);
}

/** Props for {@link LightboxViewer}. */
export interface LightboxViewerProps {
  /** Images: full-size and thumbnail URLs */
  images: ReadonlyArray<{ full: string; thumb: string }>;
  /** Index of the image shown */
  index: number;
  /** Called with the new index after a page turn */
  onIndexChange: (index: number) => void;
  /** Called when a gesture (swipe up/down, background tap) closes the viewer */
  onClose: () => void;
  /** Alt text prefix for images */
  altPrefix: string;
  /** Set to the current image's frame (the open / close morph target) */
  frameRef: RefObject<HTMLDivElement | null>;
}

/**
 * Full-screen image viewer. Render it inside a dialog; it fills its container and
 * opens on `index`.
 *
 * Known limitation: a pinch that starts once a one-finger horizontal swipe is under way
 * is ignored (the browser owns that touch for scrolling); lift and pinch again.
 *
 * @param props - LightboxViewerProps
 * @returns The viewer
 */
export function LightboxViewer({
  images,
  index,
  onIndexChange,
  onClose,
  altPrefix,
  frameRef,
}: LightboxViewerProps): ReactElement {
  const count = images.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const openAtIndex = useEffectEvent(() => {
    if (stripRef.current) scrollToSlide(stripRef.current, index, true);
  });
  const close = useEffectEvent(onClose);

  // Open on the gallery's image, before paint, without animation. Focus the viewer so
  // the arrow keys work at once.
  useLayoutEffect(() => {
    openAtIndex();
    const id = requestAnimationFrame(() => rootRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, []);

  // Native swipes: the slide that is mostly visible becomes the index.
  useCurrentSlide(stripRef, count, onIndexChange);

  // Close / zoom / pan gestures act on the current slide. Re-attaching on a page turn
  // is what resets the zoom.
  useEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const slide = stripRef.current?.children[index];
    const frame = frameRef.current;
    const img = frame?.querySelector('.image-gallery__lightbox-img');
    if (
      !root ||
      !backdrop ||
      !frame ||
      !(slide instanceof HTMLElement) ||
      !(img instanceof HTMLImageElement)
    ) {
      return;
    }
    return attachLightboxGestures({
      root,
      backdrop,
      slide,
      frame,
      img,
      onClose: () => close(),
    });
  }, [index]);

  /** Page turn from a button or key. Wraps around. */
  const go = (step: number): void => {
    const target = (index + step + count) % count;
    onIndexChange(target);
    if (stripRef.current) scrollToSlide(stripRef.current, target);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const step = arrowStep(e);
    if (step === 0 || count < 2) return;
    e.preventDefault();
    go(step);
  };

  return (
    <div
      ref={rootRef}
      className="image-gallery__lightbox-stage"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onContextMenu={blockContextMenu}
    >
      <div ref={backdropRef} className="image-gallery__lightbox-backdrop" />
      <div
        ref={stripRef}
        className="image-gallery__strip image-gallery__lightbox-strip"
      >
        {images.map((image, i) => (
          <div
            key={i}
            className="image-gallery__slide image-gallery__lightbox-slide"
            aria-hidden={i === index ? undefined : true}
          >
            {isNearSlide(i, index, count) && (
              <div
                ref={i === index ? frameRef : undefined}
                className="image-gallery__lightbox-frame"
              >
                {image.thumb !== image.full && (
                  <img
                    src={image.thumb}
                    alt=""
                    className="image-gallery__lightbox-placeholder"
                    draggable={false}
                    onLoad={onFrameImageLoad}
                    onError={handleImageError}
                  />
                )}
                <img
                  src={image.full}
                  alt={`${altPrefix} ${i + 1} of ${count}`}
                  className="image-gallery__lightbox-img"
                  decoding="async"
                  fetchPriority={i === index ? 'high' : 'low'}
                  draggable={false}
                  onLoad={onFrameImageLoad}
                  onError={handleImageError}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <span className="image-gallery__lightbox-counter" aria-live="polite">
            {index + 1} / {count}
          </span>
          <GalleryArrows
            className="image-gallery__lightbox-nav"
            onPrev={() => go(-1)}
            onNext={() => go(1)}
          />
        </>
      )}
    </div>
  );
}
