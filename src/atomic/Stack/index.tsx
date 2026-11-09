// packages/components/src/atomic/Stack/index.tsx

/**
 * @fileoverview Stack component
 * @description Polymorphic flexbox layout primitive for linear organization (vertical or horizontal).
 * Replaces redundant `div className="dndev-flex ..."` usage.
 *
 * @example
 * ```tsx
 * // Vertical stack (default div)
 * <Stack>
 *   <Label>Email</Label>
 *   <Input />
 * </Stack>
 *
 * // Semantic navigation
 * <Stack as="nav" direction="row" aria-label="Pagination">
 *   <Button>Previous</Button>
 *   <Button>Next</Button>
 * </Stack>
 *
 * // Semantic section
 * <Stack as="section" direction="column">
 *   <Heading>Features</Heading>
 *   <Text>Content</Text>
 * </Stack>
 *
 * // Centered, fit-content width with start-aligned items
 * <Stack align="start" width="fit" centered>
 *   <Label>Item 1</Label>
 *   <Label>Item 2</Label>
 * </Stack>
 * ```
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

import { GAP_VARIANT } from '../../styles/componentConstants';
import type { TextAlign } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import './Stack.css';

/**
 * Stack-specific props (layout directives)
 */
export interface StackOwnProps {
  /**
   * Element type to render as
   * @default 'div'
   * @example 'nav', 'section', 'article', 'aside', 'header', 'footer'
   */
  as?: ElementType;

  /**
   * Layout direction
   * @default 'column'
   */
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';

  /**
   * Flex alignment (align-items)
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';

  /**
   * Flex justification (justify-content)
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

  /**
   * Spacing between items
   * @default 'medium'
   */
  gap?: 'none' | 'tight' | 'medium' | 'large';

  /**
   * Flex wrap behavior
   * @default 'nowrap'
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';

  /**
   * Overflow behavior for children when direction="row" and wrap="nowrap"
   * @default 'hidden' (prevents wrapping, hides overflow)
   * Set to 'visible' to allow overflow/wrapping when needed
   */
  overflow?: 'hidden' | 'visible' | 'auto' | 'scroll';

  /**
   * Flex shorthand (flex-grow flex-shrink flex-basis)
   * Common values: "1" (grow to fill), "0" (no grow), "auto"
   * @example flex="1" - Grow to fill available space
   */
  flex?: string | number;

  /**
   * Prevent children from shrinking below content width
   * @default false
   */
  rigid?: boolean;

  /**
   * Prevent text wrapping in children
   * @default false
   */
  nowrap?: boolean;

  /**
   * Force children to respect parent alignment (override align-self)
   * @default false
   */
  force?: boolean;

  /**
   * Container width behavior
   * @default 'full' (100% width)
   * @example 'fit' - Shrink to fit content (fit-content)
   * @example 'auto' - Auto width (auto)
   */
  width?: 'full' | 'fit' | 'auto';

  /**
   * Text alignment (text-align) — propagates to children via CSS inheritance
   * No default — inherits from parent
   */
  textAlign?: TextAlign;

  /**
   * Center container horizontally (margin-inline: auto)
   * @default false
   */
  centered?: boolean;

  /** Content */
  children: ReactNode;
}

/**
 * Polymorphic Stack props
 * Combines Stack-specific props with native element props based on 'as' prop
 */
export type StackProps<T extends ElementType = 'div'> = StackOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof StackOwnProps>;

/**
 * Stack Component
 *
 * Polymorphic flexbox layout primitive for linear organization.
 * Can render as any HTML element while maintaining layout directives.
 *
 * Supports container width control (`width` prop) and horizontal centering (`centered` prop)
 * for common layout patterns like centered lists with start-aligned items.
 */
const StackComponent = forwardRef<HTMLElement, StackProps>(
  (
    {
      as = 'div',
      direction = 'column',
      align = 'stretch',
      justify = 'start',
      gap = GAP_VARIANT.MEDIUM,
      wrap = 'nowrap',
      overflow,
      flex,
      rigid = false,
      nowrap = false,
      force = false,
      width = 'full',
      textAlign,
      centered = false,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    const customStyle = {
      ...style,
      ...(flex !== undefined
        ? { flex: typeof flex === 'number' ? String(flex) : flex }
        : {}),
    };

    const layoutAttrs = {
      ...(rigid && { 'data-rigid': 'true' }),
      ...(nowrap && { 'data-nowrap': 'true' }),
      ...(force && { 'data-force': 'true' }),
    };

    return createElement(
      Component,
      {
        ref,
        className: cn('dndev-stack', className),
        'data-direction': direction,
        'data-align': align,
        'data-justify': justify,
        'data-gap': gap,
        'data-wrap': wrap,
        'data-overflow': overflow,
        'data-width': width,
        'data-text-align': textAlign || undefined,
        'data-centered': centered ? 'true' : undefined,
        ...layoutAttrs,
        style: customStyle,
        ...props,
      },
      children
    );
  }
);

StackComponent.displayName = 'Stack';

const Stack = StackComponent as <T extends ElementType = 'div'>(
  props: StackProps<T>
) => React.ReactElement;

export { GAP_VARIANT };
/** Union of available gap variant values. */
export type GapVariant = (typeof GAP_VARIANT)[keyof typeof GAP_VARIANT];

export default Stack;
