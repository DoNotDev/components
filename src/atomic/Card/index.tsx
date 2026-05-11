// packages/components/src/atomic/Card/index.tsx

/**
 * @fileoverview Card component
 * @description Premium card component with behavioral variants and elevation
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { type VariantProps } from 'class-variance-authority';

import { SURFACE_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import { surfaceVariants } from '../../utils/variants';
import Icon from '../Icons/Icon';
import List from '../List';
import Slot from '../Slot';
import Stack from '../Stack';
import Text from '../Text';

import type { IconType } from '../../types';
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';

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
 * Renders the card cover region with optional overlay.
 *
 * Architecture: cover is a relative-positioned header region that sits flush
 * to the card's rounded corners (no negative-margin hack). When the card has
 * body content, the cover's height comes from `coverAspect`. When the card is
 * cover-only (no body), the cover stretches to fill the card — the card
 * itself picks up `coverAspect` via its container.
 *
 * - `string` cover → renders a safe `<img>` with `loading="lazy"`,
 *   `decoding="async"`, `referrerpolicy="no-referrer"`, `alt=""` (decorative).
 * - `ReactNode` cover → passthrough; child `<img>`/`<video>` auto-fill via CSS.
 *
 * Overlay is absolutely positioned over the cover AND over the body slot,
 * anchored by `overlayPosition` with a theme-token inset.
 */
export function renderCardCover(
  cover: string | ReactNode | undefined,
  coverAspect: CSSProperties['aspectRatio'] | undefined,
  hasBody: boolean
): ReactNode {
  if (!cover) return null;

  const isStringCover = typeof cover === 'string';

  // When body is present the cover owns the top region sized by coverAspect.
  // When body is absent the cover fills the card (card owns the aspect-ratio).
  const coverStyle: CSSProperties = hasBody
    ? { aspectRatio: coverAspect ?? '4 / 5' }
    : {};

  return (
    <div
      className="dndev-card-cover"
      data-has-body={hasBody ? 'true' : undefined}
      style={coverStyle}
    >
      {isStringCover ? (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="dndev-card-cover-media">{cover}</div>
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
  /** Click handler */
  onClick?: () => void;
  /**
   * Whether the card is clickable (enables hover styles).
   * Set to true when wrapped in Link or when onClick is provided.
   * @default false (auto-detected from onClick)
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
   * - `ReactNode` → passthrough (consumer supplies `<img alt="...">`, `<video>`,
   *   `<picture>`, etc.). Child media auto-fills via CSS.
   *
   * Sits flush to the card's rounded corners (no padding gutter). When the
   * card has no body content (title/subtitle/icon/content/footer/children),
   * the body slot collapses completely and the cover fills the card using
   * `coverAspect`. When the card does have body content, the cover occupies
   * a top header region sized by `coverAspect`.
   */
  cover?: string | ReactNode;
  /**
   * Aspect-ratio for the cover region. Any valid CSS aspect-ratio value.
   * When body content is present, applied to the cover header region.
   * When body content is absent (cover-only card), applied to the card itself.
   * @default '4 / 5'
   */
  coverAspect?: CSSProperties['aspectRatio'];
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
  clickable,
  elevated,
  cover,
  coverAspect,
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
  const isClickable = clickable !== undefined ? clickable : !!onClick;

  const header = renderCardHeader(icon, title, subtitle);
  const contentNode = renderCardContent(content);
  const hasContent = Boolean(contentNode || children);
  const hasBody = Boolean(header || hasContent || footer);
  const coverNode = renderCardCover(
    cover,
    coverAspect,
    hasBody
  );

  const cardAttrs = {
    ...variantAttrs,
    'data-role': 'card',
    ...(elevated !== undefined && {
      'data-elevated': elevated ? 'true' : 'false',
    }),
    ...(isClickable && { 'data-clickable': 'true' }),
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
      onClick={onClick}
      title={tooltip}
      {...props}
    >
      {coverNode}
      {fullOverlay && (
        <div className="dndev-card-full-overlay">{fullOverlay}</div>
      )}
      {overlay && <div className="dndev-card-overlay">{overlay}</div>}
      {hasBody && (
        <div
          className="dndev-card-body"
          data-body-background={bodyBackground}
        >
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
