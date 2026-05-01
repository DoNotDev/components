// packages/components/src/atomic/Grid/GridArea.tsx

/**
 * @fileoverview GridArea component
 * @description Wrapper component for CSS Grid named areas.
 * Use with Grid component's `areas` prop to create semantic grid layouts.
 *
 * **Polymorphic Component**: Can render as `div`, `aside`, `nav`, `section`, `header`, `footer`, or `article`
 * based on semantic needs. Defaults to `div` for generic grid areas. Use semantic elements for better HTML structure.
 *
 * @example
 * ```tsx
 * // Generic grid areas (default)
 * <Grid areas="left center right" cols=fr">
 *   <GridArea name="left">{leftContent}</GridArea>
 *   <GridArea name="center">{centerContent}</GridArea>
 *   <GridArea name="right">{rightContent}</GridArea>
 * </Grid>
 * ```
 *
 * @example
 * ```tsx
 * // Semantic grid layout
 * <Grid areas="header main sidebar footer" cols=r">
 *   <GridArea as="header" name="header">Header</GridArea>
 *   <GridArea as="main" name="main">Main Content</GridArea>
 *   <GridArea as="aside" name="sidebar">Sidebar</GridArea>
 *   <GridArea as="footer" name="footer">Footer</GridArea>
 * </Grid>
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

import { cn } from '../../utils/helpers';
import './Grid.css';

/**
 * GridArea-specific props (layout directives)
 */
interface GridAreaOwnProps {
  /**
   * Element type to render as
   * @default 'div'
   * @example 'div' - Generic grid area (default)
   * @example 'aside' - Sidebar navigation area
   * @example 'nav' - Navigation area
   * @example 'section' - Content section area
   * @example 'header' - Header area
   * @example 'footer' - Footer area
   * @example 'article' - Article content area
   */
  as?: 'div' | 'aside' | 'nav' | 'section' | 'header' | 'footer' | 'article';

  /**
   * Grid area name (must match name in Grid's `areas` prop)
   * @example "left", "center", "right", "header", "sidebar"
   */
  name: string;

  /**
   * Justify self alignment (horizontal alignment within grid cell)
   * @default 'stretch'
   */
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Align self alignment (vertical alignment within grid cell)
   * @default 'stretch'
   */
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Overflow behavior
   * @default 'hidden' (prevents wrapping, hides overflow)
   * Set to 'visible' to allow overflow/wrapping when needed
   */
  overflow?: 'hidden' | 'visible' | 'auto' | 'scroll';

  /**
   * Prevent GridArea from shrinking below content width
   * @default false
   */
  rigid?: boolean;

  /**
   * Minimum width for GridArea
   * @example "200px", "20rem", "fit-content"
   */
  min?: string;

  /** Content */
  children: ReactNode;
}

/**
 * Polymorphic GridArea props
 * Combines GridArea-specific props with native element props based on 'as' prop
 */
export type GridAreaProps<T extends ElementType = 'div'> = GridAreaOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof GridAreaOwnProps>;

/**
 * GridArea Component
 *
 * Wrapper for CSS Grid named areas.
 * Sets `data-grid-area` attribute which is styled via CSS.
 * Polymorphic component that can render as any semantic HTML element.
 */
const GridArea = forwardRef<HTMLElement, GridAreaProps>(
  (
    {
      as = 'div',
      name,
      justifySelf,
      alignSelf,
      overflow,
      rigid = false,
      min,
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
      gridArea: name,
      ...(justifySelf ? { justifySelf } : {}),
      ...(alignSelf ? { alignSelf } : {}),
      ...(overflow ? { overflow } : {}),
      ...(min ? { minWidth: min } : {}),
    };

    const layoutAttrs = {
      ...(rigid && { 'data-rigid': 'true' }),
    };

    return createElement(
      Component,
      {
        ref,
        className: cn('dndev-grid-area', className),
        'data-grid-area': name,
        'data-area': name,
        'data-overflow': overflow,
        ...layoutAttrs,
        style: customStyle,
        ...props,
      },
      children
    );
  }
);

GridArea.displayName = 'GridArea';

export default GridArea;
