// packages/components/src/atomic/Section/index.tsx

/**
 * @fileoverview Section component
 * @description Minimal layout section with title, optional separator, and tone backgrounds.
 * Content width is automatically constrained by PageContainer's --content-width variable.
 *
 * @example
 * ```tsx
 * // Fixed 3 columns
 * <Section title="Features" gridCols={[1,1,3,3]}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Section>
 *
 * // Responsive: [mobile, tablet, laptop, desktop]
 * <Section title="Features" gridCols={[1, 1, 2, 3]}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Section>
 *
 * // Full-width bleed — content breaks out of PageContainer constraints
 * // Use for hero images, maps, galleries, videos, or any full-viewport content
 * <Section bleed>
 *   <ImageGallery images={listing.images} />
 * </Section>
 *
 * // Collapsible section
 * <Section title="Details" collapsible defaultOpen={false}>
 *   <Card />
 *   <Card />
 * </Section>
 * ```
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { CirclePlus, CircleMinus } from 'lucide-react';
import {
  createElement,
  forwardRef,
  useState,
  type ElementType,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { GAP_VARIANT } from '../../styles/componentConstants';
import { TONE, type Tone, type TextAlign } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import {
  CollapsiblePrimitive,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../Collapsible/CollapsiblePrimitive';
import Grid, { type GridCols } from '../Grid';
import Separator, { SEPARATOR_VARIANT } from '../Separator';
import Stack from '../Stack';
import Text from '../Text';

import './Section.css';

/**
 * Content width presets — mirrors PageContainer variant widths
 * Background stays full-width, only inner content is constrained
 */
export const CONTENT_WIDTH = {
  STANDARD: 'standard',
  DOCS: 'docs',
  NARROW: 'narrow',
} as const;

/** Union of available content width presets for Section. */
export type ContentWidth = (typeof CONTENT_WIDTH)[keyof typeof CONTENT_WIDTH];

/**
 * Section-specific props
 */
interface SectionOwnProps {
  /**
   * Element type to render as
   * @default 'section'
   */
  as?: 'section' | 'article' | 'aside' | 'div' | 'main';

  /** Section content */
  children: ReactNode;

  /** Section title (small, uppercase, accent color) */
  title?: string;

  /** Show separator above section @default false */
  separator?: boolean;

  /** Tone system for visual rhythm */
  tone?: Tone;

  /**
   * Text alignment (text-align)
   * @default 'center'
   */
  textAlign?: TextAlign;

  /**
   * Item alignment (align-items on content container)
   * When `gridCols` is set, also passed to the inner Grid
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Content justification (justify-content on content container)
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /**
   * Built-in responsive grid — renders an inner `<Grid>` around children.
   * Same API as `<Grid cols={...}>`: number, string template, or responsive
   * `[mobile, tablet, laptop, desktop]` tuple. Use this instead of nesting
   * a `<Grid>` inside Section — it handles gap and alignment for you.
   *
   * @example 3 - always 3 equal columns
   * @example "1fr 3fr" - custom column template
   * @example [1, 1, 2, 3] - responsive: 1 col mobile/tablet, 2 laptop, 3 desktop
   * @example [1, 2, 2, 4] - stats row: 1 col mobile, 2 tablet/laptop, 4 desktop
   */
  gridCols?: GridCols;

  /**
   * Gap between grid items (only applies when `gridCols` is set).
   * Same values as `<Grid gap={...}>`.
   * @default 'medium'
   */
  gridGap?: 'none' | 'tight' | 'medium' | 'large';

  /**
   * Full-width bleed — content breaks out of content-width constraints
   * to span the full viewport width. Useful for hero images, maps, videos.
   * @default false
   */
  bleed?: boolean;

  /**
   * Whether the section is collapsible
   * @default false
   */
  collapsible?: boolean;

  /**
   * Controlled open state (when collapsible)
   */
  open?: boolean;

  /**
   * Callback when open state changes (when collapsible)
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Default open state (uncontrolled, when collapsible)
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Content width constraint — the tone background stays full-width
   * while inner content narrows to the specified width, matching
   * PageContainer variants: `'standard'` (~1200px), `'docs'` (~900px),
   * `'narrow'` (~720px). Use when a Section needs a different content
   * width than its parent PageContainer.
   */
  contentWidth?: ContentWidth;
}

/**
 * Polymorphic Section props
 */
export type SectionProps<T extends ElementType = 'section'> = SectionOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof SectionOwnProps>;

/**
 * Layout section with title, tone backgrounds, built-in grid, and full-width bleed.
 *
 * **Grid:** Pass `gridCols` to lay out children in a responsive grid (same API
 * as `<Grid cols>`). No need to nest a `<Grid>` inside Section.
 *
 * **Tone:** `tone` sets the section background (`'base'` = card bg, `'muted'` = muted bg,
 * `'ghost'` = transparent). Use alternating tones for visual rhythm between sections.
 *
 * **Content width:** `contentWidth` constrains inner content independently of
 * PageContainer (`'standard'` / `'docs'` / `'narrow'`). Background stays full-width.
 *
 * **Bleed:** `bleed` breaks out of PageContainer to span full viewport width.
 *
 * @component
 * @example
 * ```tsx
 * // Stats row — 4 cards in responsive grid with base background
 * <Section title="Overview" tone="base" gridCols={[1, 2, 2, 4]}>
 *   <Card>...</Card>
 *   <Card>...</Card>
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </Section>
 *
 * // Activity list — muted background, no grid
 * <Section title="Recent Activity" tone="muted">
 *   <Card><List items={...} /></Card>
 * </Section>
 *
 * // Full-width bleed for an image gallery
 * <Section bleed>
 *   <ImageGallery images={listing.images} />
 * </Section>
 * ```
 */
const Section = forwardRef<HTMLElement, SectionProps<'section'>>(
  function Section(
    {
      as = 'section',
      children,
      title,
      separator = false,
      tone = TONE.GHOST,
      textAlign = 'center',
      align,
      justify,
      bleed = false,
      gridCols,
      gridGap,
      collapsible = false,
      open,
      onOpenChange,
      defaultOpen = false,
      contentWidth,
      className,
      ...props
    },
    ref
  ) {
    const Component = as;

    const [internalOpen, setInternalOpen] = useState(() =>
      collapsible ? defaultOpen : false
    );
    const isControlled = collapsible && open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const handleOpenChange = isControlled ? onOpenChange : setInternalOpen;

    const content = gridCols ? (
      <Grid cols={gridCols} gap={gridGap || GAP_VARIANT.MEDIUM} align={align}>
        {children}
      </Grid>
    ) : (
      children
    );

    const titleElement =
      title &&
      (collapsible ? (
        <CollapsibleTrigger asChild>
          <Stack
            as="div"
            direction="row"
            align="center"
            justify="between"
            className="dndev-section-title-trigger"
          >
            <Text as="div" level="h2" className="dndev-section-title">
              {title}
            </Text>
            {isOpen ? (
              <CircleMinus className="dndev-section-icon" aria-hidden="true" />
            ) : (
              <CirclePlus className="dndev-section-icon" aria-hidden="true" />
            )}
          </Stack>
        </CollapsibleTrigger>
      ) : (
        <Text as="div" level="h2" className="dndev-section-title">
          {title}
        </Text>
      ));

    const sectionContent = collapsible ? (
      <CollapsiblePrimitive
        {...(isControlled
          ? { open: isOpen, onOpenChange: handleOpenChange }
          : { defaultOpen: defaultOpen, onOpenChange: handleOpenChange })}
      >
        {titleElement}
        <CollapsibleContent className="dndev-collapsible-content">
          {content}
        </CollapsibleContent>
      </CollapsiblePrimitive>
    ) : (
      <>
        {titleElement}
        {content}
      </>
    );

    return createElement(
      Component,
      {
        ref,
        'aria-label': props['aria-label'],
        className: cn(
          'dndev-section-full-width',
          bleed && 'dndev-section-bleed',
          className
        ),
        'data-tone': tone,
        'data-text-align': textAlign,
        ...props,
      },
      <>
        {separator && <Separator variant={SEPARATOR_VARIANT.ACCENT} />}

        <div
          className="dndev-section-content"
          data-content-width={contentWidth || undefined}
          data-align={align || undefined}
          data-justify={justify || undefined}
        >
          {sectionContent}
        </div>
      </>
    );
  }
);

Section.displayName = 'Section';

export default Section;
