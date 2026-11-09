// packages/components/src/atomic/Card/cover.tsx

/**
 * @fileoverview Card cover region
 * @description Cover media for Card: fit, alt, hover view and loading priority.
 */

import type { CSSProperties, ReactNode } from 'react';

/**
 * How a string `cover` is displayed. Ignored for ReactNode covers (the consumer
 * owns the media element).
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
  /** Second image URL revealed on hover / focus-within (always `fit: cover`). */
  hover?: string;
  /** Load eagerly with high fetch priority (above-the-fold covers). @default false */
  eager?: boolean;
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
 * - `string` cover → renders a safe `<img>` with `loading="lazy"`,
 *   `decoding="async"`, `referrerpolicy="no-referrer"`; `media` sets fit,
 *   alt (decorative by default), a hover view and eager loading.
 * - `ReactNode` cover → passthrough; child `<img>`/`<video>` auto-fill via CSS.
 *
 * Overlay is absolutely positioned over the cover AND over the body slot,
 * anchored by `overlayPosition` with a theme-token inset.
 */
export function renderCardCover(
  cover: string | ReactNode | undefined,
  coverAspect: CSSProperties['aspectRatio'] | undefined,
  hasBody: boolean,
  media: CardCoverMedia = {}
): ReactNode {
  if (!cover) return null;

  const isStringCover = typeof cover === 'string';
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
      data-has-hover={isStringCover && hover ? 'true' : undefined}
      style={coverStyle}
    >
      {isStringCover ? (
        <img
          src={cover}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : undefined}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="dndev-card-cover-media">{cover}</div>
      )}
      {isStringCover && hover && (
        // Decorative second view (e.g. lifestyle shot behind a packshot):
        // revealed on hover / keyboard focus, hidden from assistive tech.
        <img
          className="dndev-card-cover-hover"
          src={hover}
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
