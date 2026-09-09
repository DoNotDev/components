// packages/components/src/atomic/Blockquote/index.tsx

/**
 * @fileoverview Blockquote component
 * @description Semantic blockquote component for quotes and testimonials
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '../../utils/helpers';
import Stack from '../Stack';
import Text, { TEXT_VARIANT } from '../Text';

/**
 * Blockquote variant constants - Industry-standard patterns
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const BLOCKQUOTE_VARIANT = {
  /** Documentation style - Left border, subtle bg, optimized for technical content */
  DEFAULT: 'default',
  /** Editorial style - Serif, italic, optimized for long-form articles */
  EDITORIAL: 'editorial',
  /** Testimonial style - Elevated card with decorative quote, optimized for marketing */
  TESTIMONIAL: 'testimonial',
} as const;

/** Props for the Blockquote component. */
export interface BlockquoteProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'cite'
> {
  /** The quote text content */
  children: ReactNode;
  /** Author name (rendered in <cite>) */
  author?: string;
  /** Source or context (e.g., book title, company) */
  source?: string;
  /** Source URL (semantic cite attribute) */
  cite?: string;
  /** Visual variant */
  variant?: (typeof BLOCKQUOTE_VARIANT)[keyof typeof BLOCKQUOTE_VARIANT];
}

/**
 * Semantic blockquote component for quotes and testimonials.
 * Uses accessible <figure> + <blockquote> + <figcaption> pattern.
 *
 * Three variants optimized for different use cases:
 * - default: Documentation style - technical content, tutorials
 * - editorial: Editorial style - long-form articles and blogs
 * - testimonial: Marketing style - landing pages and testimonials
 *
 * @component
 * @example
 * ```tsx
 * // Documentation quote (default)
 * <Blockquote>
 *   The web is inclusive by default.
 * </Blockquote>
 * ```
 *
 * @example
 * ```tsx
 * // Editorial quote with attribution
 * <Blockquote variant="editorial" author="Technology Leader">
 *   The best way to predict the future is to invent it.
 * </Blockquote>
 * ```
 *
 * @example
 * ```tsx
 * // Testimonial with source link
 * <Blockquote variant="testimonial" author="Customer Name" source="Company" cite="https://example.com">
 *   This framework saved us weeks of development time.
 * </Blockquote>
 * ```
 *
 * @param {BlockquoteProps} props - The props for the blockquote
 * @returns {JSX.Element} The rendered blockquote
 */
const Blockquote = forwardRef<HTMLElement, BlockquoteProps>(function Blockquote(
  {
    children,
    author,
    source,
    cite,
    variant = BLOCKQUOTE_VARIANT.DEFAULT,
    className,
    ...props
  },
  ref
) {
  const hasAttribution = author || source;

  return (
    <figure
      ref={ref}
      className={cn('dndev-blockquote', className)}
      data-variant={variant}
      {...props}
    >
      <blockquote cite={cite}>
        <p className="dndev-blockquote-content">{children}</p>
      </blockquote>

      {hasAttribution && (
        <figcaption className="dndev-blockquote-caption">
          {author && <cite className="dndev-blockquote-author">{author}</cite>}
          {source && (
            <Text
              as="span"
              variant={TEXT_VARIANT.MUTED}
              className="dndev-blockquote-source"
            >
              {author ? `, ${source}` : source}
            </Text>
          )}
        </figcaption>
      )}
    </figure>
  );
});

Blockquote.displayName = 'Blockquote';

export default Blockquote;
/** Union of available Blockquote variant values. */
export type BlockquoteVariant =
  (typeof BLOCKQUOTE_VARIANT)[keyof typeof BLOCKQUOTE_VARIANT];
