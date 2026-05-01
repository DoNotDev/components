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
interface TextOwnProps {
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
    | 'em';

  /** Content to render */
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
   * Preferred prop — use this over `align`
   */
  textAlign?: TextAlign;

  /**
   * @deprecated Use `textAlign` instead. Kept for backward compatibility.
   */
  align?: TextAlign;

  /**
   * Font weight
   * @default Inherits from level (h1/h2=h3=bold/semibold, h4=medium, body=medium)
   * @example 'normal' | 'medium' | 'semibold' | 'bold'
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';

  /** Italic text */
  italic?: boolean;
}

/**
 * Polymorphic Text props
 * Combines Text-specific props with native element props based on 'as' prop
 */
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
    align,
    weight,
    italic,
    className,
    ...props
  },
  ref
) {
  const Component = as;
  const variantAttrs = getVariantDataAttrs({ variant });

  // Auto-map as prop to level if level not explicitly provided
  // Only h1-h6 can map to level (p, span, div, etc. default to 'body')
  const headingElements: readonly ('h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')[] =
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const effectiveLevel =
    level ??
    (headingElements.includes(as as any)
      ? (as as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')
      : 'body');

  const levelAttrs =
    effectiveLevel !== 'body' ? { 'data-level': effectiveLevel } : {};

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
      'data-text-align': textAlign ?? align ?? undefined,
      'data-font-weight': weight || undefined,
      'data-italic': italic || undefined,
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
