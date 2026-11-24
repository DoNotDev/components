// packages/components/src/utils/responsiveImage.tsx

/**
 * @fileoverview Responsive image
 * @description Renders a full + thumbnail image pair. Two modes: without
 * `renditions`, phones (below 768px) download the thumbnail and larger screens the
 * full image (`<picture><source media>`, by viewport). With `renditions`,
 * the browser picks by displayed size x device pixel ratio (`srcset` width
 * descriptors).
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import type { ImgHTMLAttributes, ReactElement, Ref } from 'react';

/**
 * A stored image in two renditions. Same shape as the CRUD `Picture` value of
 * `image` / `images` fields, so a field value passes straight through.
 */
export interface ResponsiveImage {
  /** Full-size rendition. */
  fullUrl: string;
  /** Thumbnail rendition. Omitted or equal to `fullUrl` = one rendition only. */
  thumbUrl?: string;
}

/**
 * Viewports that get the thumbnail: the `mobile` breakpoint (0-767px,
 * `BREAKPOINT_RANGES.mobile` in `@donotdev/core`).
 */
export const THUMBNAIL_MEDIA = '(max-width: 767px)';

/**
 * Whether `value` is a {@link ResponsiveImage} (has a string `fullUrl`), as
 * opposed to a URL string or a React node.
 */
export function isResponsiveImage(value: unknown): value is ResponsiveImage {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { fullUrl?: unknown }).fullUrl === 'string'
  );
}

/**
 * Size-based rendition picking for {@link ResponsiveImg}: the browser chooses
 * by displayed size x device pixel ratio (`srcset` width descriptors + `sizes`)
 * instead of by viewport.
 *
 * `thumbWidth` / `fullWidth` are the frame widths the image field's upload
 * config fits each rendition into: `thumbWidth` and `maxWidth` of
 * `options.fieldSpecific.image` (see `imageProcessing.ts` in `@donotdev/crud`).
 * Declared from config, not measured: nothing per image is stored. An image
 * uploaded under another config gets a slightly off pick (softer or heavier),
 * never a broken one. For `object-fit: contain` the frame width is the exact
 * math (rendition and display are both fits of the same image into a frame);
 * for `cover` crops it is approximate.
 */
export interface ImageRenditions {
  /** Width (px) of the frame the thumbnail is fitted into (`thumbWidth`). */
  thumbWidth: number;
  /** Width (px) of the frame the full rendition is fitted into (`maxWidth`). */
  fullWidth: number;
  /**
   * Displayed width of the image per breakpoint, as the `<img sizes>` value
   * (e.g. `'(min-width: 1024px) 20vw, 50vw'` or `'3.75rem'`). Replaces the
   * native `sizes` attribute when `renditions` is set.
   */
  sizes: string;
}

/**
 * URL of the rendition {@link ResponsiveImg} shows at the current viewport.
 * Client only (reads `matchMedia`); use it to preload the image a frame will show.
 *
 * Describes the media-switch mode only (no `renditions`). With `renditions` the browser
 * decides by displayed size and pixel ratio: read `img.currentSrc` instead.
 */
export function currentRenditionUrl(image: ResponsiveImage): string {
  const { fullUrl, thumbUrl } = image;
  if (!thumbUrl || thumbUrl === fullUrl) return fullUrl;
  return window.matchMedia(THUMBNAIL_MEDIA).matches ? thumbUrl : fullUrl;
}

/** Props of {@link ResponsiveImg}: the image pair + `<img>` attributes. */
export interface ResponsiveImgProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'srcSet'
> {
  /** The image pair (CRUD `Picture`). */
  image: ResponsiveImage;
  /**
   * Pick the rendition by displayed size instead of viewport (see
   * {@link ImageRenditions}). With it, the rendered `sizes` comes from
   * `renditions.sizes`. Absent: media-switch mode.
   */
  renditions?: ImageRenditions;
  /** React 19: ref is a regular prop; it reaches the `<img>`. */
  ref?: Ref<HTMLImageElement>;
}

/**
 * `<img>` for an image pair, in two modes.
 *
 * - No `renditions` (default): phones (below 768px) get the thumbnail, larger
 *   screens the full image, via `<picture><source media>`. The browser
 *   downloads one rendition only.
 * - `renditions`: a single `<img>`
 *   with `srcset="thumb {thumbWidth}w, full {fullWidth}w"` and `sizes`, so
 *   the browser picks by displayed size x pixel ratio, not by viewport. Use it
 *   where the displayed size is far from the viewport class (small tiles,
 *   multi-column grids).
 *
 * A single rendition renders a plain `<img>` in both modes.
 *
 * `className` and `style` go on the `<img>`. The `<picture>` wrapper (media
 * mode) is an unstyled inline box, so the `<img>` lays out against the same
 * container.
 *
 * @example
 * ```tsx
 * <ResponsiveImg image={product.images[0]} alt={product.name} loading="lazy" />
 * <ResponsiveImg
 *   image={product.images[0]}
 *   renditions={{ thumbWidth: 960, fullWidth: 2400, sizes: '(min-width: 1024px) 20vw, 50vw' }}
 *   alt={product.name}
 * />
 * ```
 */
export function ResponsiveImg({
  image,
  renditions,
  ...imgProps
}: ResponsiveImgProps): ReactElement {
  const { fullUrl, thumbUrl } = image;
  if (!thumbUrl || thumbUrl === fullUrl) {
    return <img src={fullUrl} {...imgProps} />;
  }
  if (renditions) {
    return (
      <img
        {...imgProps}
        src={fullUrl}
        srcSet={`${thumbUrl} ${renditions.thumbWidth}w, ${fullUrl} ${renditions.fullWidth}w`}
        sizes={renditions.sizes}
      />
    );
  }
  return (
    <picture>
      <source media={THUMBNAIL_MEDIA} srcSet={thumbUrl} />
      <img src={fullUrl} {...imgProps} />
    </picture>
  );
}
