// packages/components/src/atomic/Card/cover.tsx

/**
 * @fileoverview Card cover region
 * @description Cover media for Card: fit, alt, hover view and loading priority.
 */

import type { CSSProperties, ReactNode } from 'react';

import { isResponsiveImage, ResponsiveImg } from '../../utils/responsiveImage';
import type { ResponsiveImage } from '../../utils/responsiveImage';

/** An image cover: a URL, or a full + thumbnail pair (CRUD `Picture`). */
export type CardCoverImage = string | ResponsiveImage;

/**
 * How an image `cover` (URL or {@link ResponsiveImage}) is displayed. Ignored for
 * ReactNode covers (the consumer owns the media element).
 */
export interface CardCoverMedia {
  /**
   * `'cover'` fills the region and crops (photography). `'contain'` shows the whole
   * image on the muted cover background (cut-out packshots, logos).
   * @default 'cover'
   */
  fit?: 'cover' | 'contain';
  /** Alt text. Empty (default) marks the cover as decorative. */
  alt?: string;
  /** Second image revealed on hover / focus-within (always `fit: cover`). */
  hover?: CardCoverImage;
  /** Load eagerly with high fetch priority (above-the-fold covers). @default false */
  eager?: boolean;
}

/** Image pair for a URL (one rendition) or a {@link ResponsiveImage}. */
function toImage(image: CardCoverImage): ResponsiveImage {
  return typeof image === 'string' ? { fullUrl: image } : image;
}

/**
 * Renders the card cover region with optional overlay.
 *
 * Architecture: cover is a relative-positioned header region that sits flush
 * to the card's rounded corners (no negative-margin hack). When the card has
 * body content, the cover's height comes from `coverAspect`. When the card is
 * cover-only (no body), the cover stretches to fill the card — the card
 * itself picks up `coverAspect` via its container.
 *
 * - `string` or {@link ResponsiveImage} cover → renders a safe `<img>` with
 *   `loading="lazy"`, `decoding="async"`, `referrerpolicy="no-referrer"`;
 *   `media` sets fit, alt (decorative by default), a hover view and eager
 *   loading. An image pair shows the thumbnail on phones, the full image above
 *   ({@link ResponsiveImg}).
 * - `ReactNode` cover → passthrough; child `<img>`/`<video>` auto-fill via CSS.
 *
 * Overlay is absolutely positioned over the cover AND over the body slot,
 * anchored by `overlayPosition` with a theme-token inset.
 */
export function renderCardCover(
  cover: CardCoverImage | ReactNode | undefined,
  coverAspect: CSSProperties['aspectRatio'] | undefined,
  hasBody: boolean,
  media: CardCoverMedia = {}
): ReactNode {
  if (!cover) return null;

  const image: CardCoverImage | null =
    typeof cover === 'string' || isResponsiveImage(cover) ? cover : null;
  const { fit = 'cover', alt = '', hover, eager = false } = media;

  // When body is present the cover owns the top region sized by coverAspect.
  // When body is absent the cover fills the card (card owns the aspect-ratio).
  const coverStyle: CSSProperties = hasBody
    ? { aspectRatio: coverAspect ?? '4 / 5' }
    : {};

  return (
    <div
      className="dndev-card-cover"
      data-has-body={hasBody ? 'true' : undefined}
      data-fit={fit}
      data-has-hover={image && hover ? 'true' : undefined}
      style={coverStyle}
    >
      {image ? (
        <ResponsiveImg
          image={toImage(image)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="dndev-card-cover-media">{cover as ReactNode}</div>
      )}
      {image && hover && (
        // Decorative second view (e.g. lifestyle shot behind a packshot):
        // revealed on hover / keyboard focus, hidden from assistive tech.
        <ResponsiveImg
          className="dndev-card-cover-hover"
          image={toImage(hover)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
