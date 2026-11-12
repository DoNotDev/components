// packages/components/src/utils/responsiveImage.tsx

/**
 * @fileoverview Responsive image
 * @description Renders a full + thumbnail image pair so phones download the
 * thumbnail and larger screens the full image.
 *
 * @version 0.1.0
 * @since 0.2.3
 * @author AMBROISE PARK Consulting
 */

import type { ImgHTMLAttributes, ReactElement } from 'react';

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
 * URL of the rendition {@link ResponsiveImg} shows at the current viewport.
 * Client only (reads `matchMedia`); use it to preload the image a frame will show.
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
}

/**
 * `<img>` for an image pair: phones (below 768px) get the thumbnail, larger
 * screens the full image, via `<picture><source media>`. The browser downloads
 * one rendition only. A single rendition renders a plain `<img>`.
 *
 * `className` and `style` go on the `<img>`. The `<picture>` wrapper is an
 * unstyled inline box, so the `<img>` lays out against the same container.
 *
 * @example
 * ```tsx
 * <ResponsiveImg image={product.images[0]} alt={product.name} loading="lazy" />
 * ```
 */
export function ResponsiveImg({
  image,
  ...imgProps
}: ResponsiveImgProps): ReactElement {
  const { fullUrl, thumbUrl } = image;
  if (!thumbUrl || thumbUrl === fullUrl) {
    return <img src={fullUrl} {...imgProps} />;
  }
  return (
    <picture>
      <source media={THUMBNAIL_MEDIA} srcSet={thumbUrl} />
      <img src={fullUrl} {...imgProps} />
    </picture>
  );
}
