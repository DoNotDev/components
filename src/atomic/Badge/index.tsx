// packages/components/src/atomic/Badge/index.tsx

/**
 * @fileoverview Badge component
 * @description Status indicator component with semantic variants.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import {
  createElement,
  forwardRef,
  type ElementType,
  type ComponentPropsWithRef,
} from 'react';

import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

/**
 * Badge variant constants - THEME_VARIANT + Badge-specific variants
 * Used for badge styling via data-variant attribute
 */
export const BADGE_VARIANT = {
  ...THEME_VARIANT,
  OUTLINE: 'outline',
} as const;

const badgeVariants = cva('dndev-badge-base dndev-surface', {
  variants: {
    variant: {
      [THEME_VARIANT.DEFAULT]: '',
      [THEME_VARIANT.MUTED]: '',
      [THEME_VARIANT.PRIMARY]: '',
      [THEME_VARIANT.SECONDARY]: '',
      [THEME_VARIANT.ACCENT]: '',
      [THEME_VARIANT.SUCCESS]: '',
      [THEME_VARIANT.WARNING]: '',
      [THEME_VARIANT.DESTRUCTIVE]: '',
      [BADGE_VARIANT.OUTLINE]: '',
    },
  },
  defaultVariants: {
    variant: THEME_VARIANT.DEFAULT,
  },
});

/** Union of available Badge variant values. */
export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

/**
 * Badge-specific props (styling directives)
 */
export interface BadgeOwnProps extends VariantProps<typeof badgeVariants> {
  /**
   * Element type to render as
   * @default 'div'
   * @example 'div' - Block-level badge (default)
   * @example 'span' - Inline badge (for text content)
   * @example 'mark' - Semantic highlight/mark (for emphasized content)
   */
  as?: 'div' | 'span' | 'mark';

  /**
   * Tooltip text to show on hover
   */
  tooltip?: string;
}

/**
 * Polymorphic Badge props
 * Combines Badge-specific props with native element props based on 'as' prop
 */
export type BadgeProps<T extends ElementType = 'div'> = BadgeOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof BadgeOwnProps | 'title'>;

/**
 * Status indicator component with semantic variants.
 *
 * **Polymorphic Component**: Can render as `div`, `span`, or `mark` based on context.
 * Defaults to `div` for block-level badges. Use `span` for inline badges within text.
 * Use `mark` for semantic highlighting of important content.
 *
 * @component
 * @example
 * ```tsx
 * // Block-level badge (default)
 * <Badge variant="secondary">New</Badge>
 * ```
 *
 * @example
 * ```tsx
 * // Inline badge within text
 * <p>
 *   This is a <Badge as="span" variant="accent">featured</Badge> item.
 * </p>
 * ```
 *
 * @example
 * ```tsx
 * // Semantic highlight
 * <Badge as="mark" variant="accent">Important</Badge>
 * ```
 *
 * @param {BadgeProps} props - The props for the badge
 * @returns {JSX.Element} The rendered badge
 */
const Badge = forwardRef<HTMLElement, BadgeProps>(function Badge(
  { as = 'div', className, variant, tooltip, ...props },
  ref
) {
  const Component = as;
  const variantAttrs = getVariantDataAttrs({ variant });

  return createElement(Component, {
    ref,
    className: cn(badgeVariants({ variant }), className),
    ...variantAttrs,
    title: tooltip,
    ...props,
  });
});

Badge.displayName = 'Badge';

export default Badge;
export { badgeVariants };
