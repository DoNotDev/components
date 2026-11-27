// packages/components/src/atomic/Text/index.tsx

/**
 * @fileoverview Text component
 * @description Typography component for consistent text styling. Supports headings, body text, and lists.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  createElement,
  forwardRef,
  type ElementType,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';

import { THEME_VARIANT, type TextAlign } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

/**
 * Text variant constants - THEME_VARIANT + CODE (Text-specific)
 * Color variants for text styling via data-variant attribute
 */
export const TEXT_VARIANT = {
  ...THEME_VARIANT,
  CODE: 'code',
} as const;

/**
 * Text-specific props (styling and typography directives)
 */
export interface TextOwnProps {
  /**
   * HTML element to render as
   * @default 'div'
   * @example 'h1' | 'h2' | 'h3' | 'h4' - Headings
   * @example 'p' - Paragraph text
   * @example 'span' - Inline text
   * @example 'div' - Block container (default)
   * @example 'li' | 'ul' | 'ol' - List elements
   * @example 'label' - Form label
   * @example 'code' - Inline code element
   * @example 's' - No longer accurate, struck through (a former price next to the new one)
   */
  as?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'p'
    | 'span'
    | 'div'
    | 'li'
    | 'ul'
    | 'ol'
    | 'label'
    | 'code'
    | 'strong'
    | 'em'
    | 's';

  /** Content to render. A link (`a`) inside text-level Text (`body` / `small` / `caption`, the default) is underlined, unless it is a framework control (`.dndev-interactive`); a link inside a heading level (`h1`-`h6`) is not. */
  children: ReactNode;

  /** Visual style variant - color based on theme values + code */
  variant?: (typeof TEXT_VARIANT)[keyof typeof TEXT_VARIANT];

  /**
   * Typographic scale level
   * @default Auto-mapped from 'as' prop if h1-h6, otherwise 'body'
   * @example 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'small' | 'caption'
   * @example <Text as="h1"> → level="h1" automatically
   * @example <Text as="h1" level="body"> → override to body
   * @example <Text level="h1"> → visual only, no semantic element
   */
  level?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body'
    | 'small'
    | 'caption';

  /**
   * Text alignment
   */
  textAlign?: TextAlign;

  /**
   * Font weight
   * @default From the level: h1 bold, h2 / h3 semibold, h4 medium, h5 / h6 semibold, body medium.
   * A Text nested in another Text, with no `level` and no `weight`, keeps its parent's weight
   * (a coloured phrase in a bold heading stays bold).
   * @example 'normal' | 'medium' | 'semibold' | 'bold'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /** Italic text */
  italic?: boolean;

  /**
   * Underlined text, for non-link text that must read as a link cue (a link
   * inside text-level Text is already underlined).
   * @example <Text underline>See details</Text>
   */
  underline?: boolean;

  /**
   * Clamp the text to this many lines, with an ellipsis. A positive integer;
   * anything else is ignored. Clamps only: no space is reserved. The element must be block-level.
   * @example <Text lines={2}>A long product name</Text>
   */
  lines?: number;
}

/**
 * Polymorphic Text props
 * Combines Text-specific props with native element props based on 'as' prop
 */
/** Heading tags that map the `as` prop to a typography level. */
const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingTag = (typeof HEADING_TAGS)[number];

/** Narrows an element tag to a heading tag (h1-h6). */
function isHeadingTag(tag: string): tag is HeadingTag {
  const headingTags: readonly string[] = HEADING_TAGS;
  return headingTags.includes(tag);
}

export type TextProps<T extends ElementType = 'div'> = TextOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof TextOwnProps>;

/**
 * Typography component for consistent text styling.
 * Supports headings, body text, and lists.
 *
 * **Polymorphic Component**: Can render as any text-related HTML element (`h1-h4`, `p`, `span`, `div`, `li`, `ul`, `ol`, `label`)
 * based on semantic needs. Full type inference ensures props match the selected element type.
 * Defaults to `div` for generic text containers.
 *
 * @component
 * @example
 * ```tsx
 * // Heading with semantic element (auto-maps as to level)
 * <Text as="h1">Title</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Override level while keeping semantic element
 * <Text as="h1" level="body">Accessible but visually body text</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Visual heading without semantic element
 * <Text level="h1">Visual heading</Text>
 * ```
 *
 * @example
 * ```tsx
 * // List item
 * <Text as="li" className="dndev-ml-lg">Item 1</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Muted text (defaults to div)
 * <Text variant="muted">Subtitle</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Inline span with variant
 * <Text as="span" variant="primary">Highlighted text</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Code variant (monospace + background + padding)
 * <Text variant="code">npm install</Text>
 * ```
 *
 * @example
 * ```tsx
 * // Code element + variant + level (semantic + visual + typography)
 * <Text as="code" variant="code" level="h3">npm install</Text>
 * ```
 *
 * @param {TextProps} props - The props for the text
 * @returns {JSX.Element} The rendered text component
 */
const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = 'div',
    children,
    variant = TEXT_VARIANT.DEFAULT,
    level,
    textAlign,
    weight,
    italic,
    underline,
    lines,
    className,
    style,
    ...props
  },
  ref
) {
  const Component = as;
  const variantAttrs = getVariantDataAttrs({ variant });

  // Auto-map as prop to level if level not explicitly provided
  // Only h1-h6 can map to level (p, span, div, etc. default to 'body')
  const effectiveLevel = level ?? (isHeadingTag(as) ? as : 'body');

  // data-level="body" is emitted only for an explicit level (needed to beat the
  // base.css h1-h6 element rules); the implicit body default keeps the DOM unchanged.
  const levelAttrs =
    effectiveLevel !== 'body' || level !== undefined
      ? { 'data-level': effectiveLevel }
      : {};

  // Clamp: positive integers only; the CSS reads --text-lines from data-lines.
  const clampLines =
    typeof lines === 'number' && Number.isInteger(lines) && lines > 0
      ? lines
      : undefined;
  const clampStyle =
    clampLines !== undefined || style
      ? { ...style, ...(clampLines !== undefined && { '--text-lines': clampLines }) }
      : undefined;

  // Handle newlines in string children (split and insert <br />)
  const processedChildren =
    typeof children === 'string' && children.includes('\n')
      ? children.split('\n').map((line, index, array) => (
          <span key={index}>
            {line}
            {index < array.length - 1 && <br />}
          </span>
        ))
      : children;

  return createElement(
    Component,
    {
      ref,
      className: cn('dndev-text-base', className),
      'data-text-align': textAlign,
      'data-font-weight': weight || undefined,
      'data-italic': italic || undefined,
      'data-underline': underline || undefined,
      'data-lines': clampLines,
      style: clampStyle,
      ...variantAttrs,
      ...levelAttrs,
      ...props,
    },
    processedChildren
  );
});

Text.displayName = 'Text';

export default Text;
/** Union of available Text variant values. */
export type TextVariant = (typeof TEXT_VARIANT)[keyof typeof TEXT_VARIANT];
