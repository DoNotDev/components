// packages/components/src/atomic/Card/index.tsx

/**
 * @fileoverview Card component
 * @description Premium card component with behavioral variants and elevation
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { VariantProps } from 'class-variance-authority';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

import type { IconType } from '../../types';
import { SURFACE_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import { useLinkRenderer } from '../../utils/linkComponent';
import { surfaceVariants } from '../../utils/variants';
import Icon from '../Icons/Icon';
import List from '../List';
import Slot from '../Slot';
import Stack from '../Stack';
import Text from '../Text';
import { renderCardCover } from './cover';
import type { CardCoverImage, CardCoverMedia } from './cover';

export { renderCardCover } from './cover';
export type { CardCoverImage, CardCoverMedia } from './cover';

/** Corner anchor for the overlay element layered on the card cover. */
export type CardOverlayPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/**
 * Unified content type for all card components.
 * - `string` → renders as Text
 * - `string[]` → renders as List (consumer controls icons via List directly)
 * - `ReactNode` → passthrough (full control)
 */
export type CardContent = string | string[] | ReactNode;

/**
 * Converts CardContent to ReactNode.
 * Use this when rendering CardContent outside of Card component.
 *
 * @param content - CardContent to convert
 * @returns ReactNode ready for rendering
 *
 * @example
 * ```tsx
 * import { renderCardContent, type CardContent } from '@donotdev/components';
 *
 * const MyComponent = ({ content }: { content: CardContent }) => (
 *   <div>{renderCardContent(content)}</div>
 * );
 * ```
 */
export function renderCardContent(content: CardContent | undefined): ReactNode {
  if (!content) return null;
  if (typeof content === 'string') {
    return (
      <Text as="p" level="small">
        {content}
      </Text>
    );
  }
  if (Array.isArray(content)) {
    if (content.length === 1 && typeof content[0] === 'string') {
      return (
        <Text as="p" level="small">
          {content[0]}
        </Text>
      );
    }
    return (
      <List
        items={content}
        gap="tight"
        style={{ listStyle: 'none', paddingInlineStart: 0 }}
      />
    );
  }
  return content;
}

/**
 * Renders card header with icon, title, and subtitle.
 * Groups icon+title+subtitle with no gap (trusts lineHeight).
 *
 * @param icon - Optional icon to display inline with title
 * @param title - Optional title (string or ReactNode for Trans)
 * @param subtitle - Optional subtitle (string or ReactNode for Trans)
 * @returns ReactNode ready for rendering
 *
 * @example
 * ```tsx
 * import { renderCardHeader } from '@donotdev/components';
 *
 * // Plain string
 * const header = renderCardHeader(Zap, 'Lightning Fast', 'Build in minutes');
 *
 * // With Trans for rich text
 * const richHeader = renderCardHeader(Zap, <Trans ns="home" i18nKey="title" />);
 * ```
 */
export function renderCardHeader(
  icon?: IconType,
  title?: string | ReactNode,
  subtitle?: string | ReactNode
): ReactNode {
  if (!icon && !title && !subtitle) return null;

  return (
    <div className="dndev-card-header">
      {icon && title ? (
        <Stack direction="row" align="center" gap="tight">
          <Icon icon={icon} ariaHidden />
          <Text as="div" level="h3" className="dndev-card-title">
            {title}
          </Text>
        </Stack>
      ) : title ? (
        <Text as="div" level="h3" className="dndev-card-title">
          {title}
        </Text>
      ) : icon ? (
        <Icon icon={icon} ariaHidden />
      ) : null}
      {subtitle && (
        <Text as="div" level="h4" className="dndev-card-subtitle">
          {subtitle}
        </Text>
      )}
    </div>
  );
}

/**
 * Card variant constants - re-exported from shared SURFACE_VARIANT
 * Matches .dndev-surface CSS class
 */
export const CARD_VARIANT = SURFACE_VARIANT;

/**
 * Card variants - uses surfaceVariants + adds .dndev-card grid layout
 */
export type CardVariant = VariantProps<typeof surfaceVariants>['variant'];

/** Props for the Card component. */
export interface CardProps
  extends
    Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'content'>,
    VariantProps<typeof surfaceVariants> {
  /**
   * Whether to render as a child element (Radix Slot).
   * @default false
   */
  asChild?: boolean;
  /** Optional icon to display inline with title */
  icon?: IconType;
  /** Main title (string or ReactNode for Trans rich text) */
  title?: string | ReactNode;
  /** Subtitle displayed below the title (string or ReactNode for Trans) */
  subtitle?: string | ReactNode;
  /**
   * Main content - string, string[], or ReactNode.
   * - string → renders as Text
   * - string[] → renders as List
   * - ReactNode → passthrough
   */
  content?: CardContent;
  /** Footer content */
  footer?: ReactNode;
  /** Tooltip text */
  tooltip?: string;
  /** Click handler. Ignored when `href` is set (the link navigates). */
  onClick?: () => void;
  /**
   * Destination of the card: renders a real `<a href>` (the title; its hit area
   * stretches over the whole card) through the app router's link, so crawlers
   * follow it and clicks navigate client-side. Buttons and inputs inside the card
   * stay clickable. Without a title, give the card an `aria-label`.
   */
  href?: string;
  /**
   * Whether the card is clickable (enables hover styles).
   * Set to true when wrapped in Link or when onClick is provided.
   * @default false (auto-detected from onClick / href)
   */
  clickable?: boolean;
  /**
   * Whether the card has elevation/shadow.
   * @default false
   */
  elevated?: boolean;
  /**
   * Optional full-bleed cover.
   * - `string` → rendered as a safe `<img>` (lazy, async-decoded, no-referrer,
   *   empty `alt` = decorative). Cover fills the region via `object-fit: cover`.
   * - `{ fullUrl, thumbUrl }` (a CRUD `Picture`) → same `<img>`; phones
   *   (below 768px) download the thumbnail, larger screens the full image.
   * - `ReactNode` → passthrough (consumer supplies `<img alt="...">`, `<video>`,
   *   `<picture>`, etc.). Child media auto-fills via CSS.
   *
   * Sits flush to the card's rounded corners (no padding gutter). When the
   * card has no body content (title/subtitle/icon/content/footer/children),
   * the body slot collapses completely and the cover fills the card using
   * `coverAspect`. When the card does have body content, the cover occupies
   * a top header region sized by `coverAspect`.
   */
  cover?: CardCoverImage | ReactNode;
  /**
   * Aspect-ratio for the cover region. Any valid CSS aspect-ratio value.
   * When body content is present, applied to the cover header region.
   * When body content is absent (cover-only card), applied to the card itself.
   * @default '4 / 5'
   */
  coverAspect?: CSSProperties['aspectRatio'];
  /**
   * How a string `cover` fits its region: `'cover'` crops to fill (default),
   * `'contain'` shows the whole image (cut-out packshots).
   * @default 'cover'
   */
  coverFit?: CardCoverMedia['fit'];
  /** Alt text for a string `cover`. Omit for a decorative cover. */
  coverAlt?: string;
  /**
   * Second image crossfaded in on hover / keyboard focus (image covers only),
   * e.g. a lifestyle shot behind a packshot.
   */
  coverHover?: CardCoverImage;
  /**
   * Load a string `cover` eagerly with high fetch priority. Set on above-the-fold
   * cards only (hero tiles, first row); others stay lazy.
   * @default false
   */
  coverEager?: boolean;
  /**
   * Optional content absolutely positioned on top of the cover.
   * Anchored by `overlayPosition` with theme-token inset. Overlay sits above
   * both the cover and the body slot (z-index 2, or z-index 4 when fullOverlay
   * is also set so it appears above the scrim).
   */
  overlay?: ReactNode;
  /**
   * Corner anchor for `overlay`.
   * @default 'top-left'
   */
  overlayPosition?: CardOverlayPosition;
  /**
   * Optional full-card scrim rendered as `position:absolute; inset:0` at the
   * card root level. Participates in the card's CSS transform (hover lift,
   * etc.) because it is a direct child of `.dndev-card`.
   *
   * Use for status overlays (sold, reserved, signed) that must cover the
   * entire card surface. Clipped to the card's border-radius via
   * `overflow:hidden`. `pointer-events:none` — card click-through is
   * preserved. z-index 3 (above body, below `overlay` at z-index 4).
   */
  fullOverlay?: ReactNode;
  /**
   * Background treatment for the body slot (the padded region holding
   * title/subtitle/icon/content/footer/children, if any).
   *
   * - `'transparent'` (default) — body background is transparent. Use for
   *   editorial cards where body sits directly on the card surface.
   * - `'solid'` — body renders on `var(--card)` background. Use when mixing
   *   cover + body content and the body needs a clear separation surface.
   *
   * No effect when the body slot is empty (collapsed cover-only card).
   * @default 'transparent'
   */
  bodyBackground?: 'transparent' | 'solid';
  /** React 19: ref is a regular prop */
  ref?: Ref<HTMLDivElement>;
}

/**
 * Premium card component with behavioral variants and elevation.
 * Supports header, content, and footer sections with automatic grid layout.
 *
 * @component
 * @example
 * ```tsx
 * // Classic card: icon + title + subtitle + body
 * <Card
 *   title="Notifications"
 *   subtitle="Manage your preferences"
 *   icon={Bell}
 *   elevated
 * >
 *   <p>Content goes here</p>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Editorial tile: full-bleed cover + bottom-left overlay, no body.
 * // Body slot collapses — card is pure photo with layered text.
 * <Card
 *   cover="/villa.jpg"
 *   coverAspect="4 / 5"
 *   overlay={
 *     <Stack gap="none">
 *       <Text variant="accent">Settle In</Text>
 *       <Text level="h2">Villa Arrival</Text>
 *     </Stack>
 *   }
 *   overlayPosition="bottom-left"
 *   clickable
 *   onClick={() => navigate('/services?occasion=villa-arrival')}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Product card: cover as header, body below with solid surface.
 * <Card
 *   cover="/product.jpg"
 *   coverAspect="16 / 9"
 *   title="Sunset Cruise"
 *   subtitle="From €450 / person"
 *   bodyBackground="solid"
 *   clickable
 *   onClick={() => navigate('/services/sunset-cruise')}
 * />
 * ```
 *
 * @param {CardProps} props - The props for the card
 * @returns {JSX.Element} The rendered card
 */
const Card = ({
  className,
  variant,
  asChild = false,
  icon,
  title,
  subtitle,
  content,
  footer,
  children,
  tooltip,
  onClick,
  href,
  clickable,
  elevated,
  cover,
  coverAspect,
  coverFit,
  coverAlt,
  coverHover,
  coverEager,
  overlay,
  overlayPosition = 'top-left',
  fullOverlay,
  bodyBackground = 'transparent',
  style,
  ref,
  ...props
}: CardProps) => {
  const Comp = asChild ? Slot : 'div';

  const variantAttrs = getVariantDataAttrs({ variant });
  const isClickable =
    clickable !== undefined ? clickable : !!onClick || !!href;
  const LinkComponent = useLinkRenderer();
  const hasLink = !!href && !asChild;

  const header = renderCardHeader(
    icon,
    hasLink && title ? (
      <LinkComponent href={href} className="dndev-card-link">
        {title}
      </LinkComponent>
    ) : (
      title
    ),
    subtitle
  );
  const contentNode = renderCardContent(content);
  const hasContent = Boolean(contentNode || children);
  const hasBody = Boolean(header || hasContent || footer);
  const coverNode = renderCardCover(cover, coverAspect, hasBody, {
    fit: coverFit,
    alt: coverAlt,
    hover: coverHover,
    eager: coverEager,
  });

  const cardAttrs = {
    ...variantAttrs,
    'data-role': 'card',
    ...(elevated !== undefined && {
      'data-elevated': elevated ? 'true' : 'false',
    }),
    ...(isClickable && { 'data-clickable': 'true' }),
    ...(hasLink && { 'data-has-link': 'true' }),
    ...(cover !== undefined && { 'data-has-cover': 'true' }),
    ...(cover !== undefined && !hasBody && { 'data-cover-only': 'true' }),
    ...(overlay !== undefined && { 'data-overlay-position': overlayPosition }),
    ...(fullOverlay !== undefined && { 'data-has-full-overlay': 'true' }),
  };

  // When cover-only, the card itself owns the aspectRatio so the cover fills it.
  // Drop `height: 100%` in cover-only mode so aspectRatio drives height from width.
  const isCoverOnly = Boolean(cover) && !hasBody;
  const rootStyle: CSSProperties = {
    width: '100%',
    ...(isCoverOnly
      ? { aspectRatio: coverAspect ?? '4 / 5' }
      : { height: '100%' }),
    ...style,
  };

  // asChild: Slot requires exactly one child (React.Children.only).
  // Skip internal structure — just merge Card props onto the single child.
  if (asChild) {
    return (
      <Comp
        ref={ref}
        className={cn('dndev-card', surfaceVariants({ variant }), className)}
        style={rootStyle}
        {...cardAttrs}
        onClick={onClick}
        title={tooltip}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      ref={ref}
      className={cn('dndev-card', surfaceVariants({ variant }), className)}
      style={rootStyle}
      {...cardAttrs}
      onClick={hasLink ? undefined : onClick}
      title={tooltip}
      {...props}
    >
      {hasLink && !title && (
        <LinkComponent
          href={href}
          className="dndev-card-link"
          aria-label={props['aria-label']}
        />
      )}
      {coverNode}
      {fullOverlay && (
        <div className="dndev-card-full-overlay">{fullOverlay}</div>
      )}
      {overlay && <div className="dndev-card-overlay">{overlay}</div>}
      {hasBody && (
        <div className="dndev-card-body" data-body-background={bodyBackground}>
          {header}
          {hasContent && (
            <div className="dndev-card-content">
              {contentNode}
              {children}
            </div>
          )}
          {footer && <div className="dndev-card-footer">{footer}</div>}
        </div>
      )}
    </Comp>
  );
};

export default Card;
