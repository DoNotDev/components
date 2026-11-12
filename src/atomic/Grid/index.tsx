// packages/components/src/atomic/Grid/index.tsx

/**
 * @fileoverview Grid component
 * @description Polymorphic CSS Grid layout primitive with responsive columns.
 *
 * @example
 * ```tsx
 * // Fixed 3-column grid
 * <Grid cols={3}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 *
 * // Responsive equal columns: [mobile, tablet, laptop, desktop]
 * <Grid cols={[1, 1, 2, 3]}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 *
 * // Custom column template (static)
 * <Grid cols="1fr auto 1fr" areas="left center right">
 *   <GridArea name="left">{left}</GridArea>
 *   <GridArea name="center">{center}</GridArea>
 *   <GridArea name="right">{right}</GridArea>
 * </Grid>
 *
 * // Custom column template (responsive) + responsive areas
 * <Grid
 *   cols={["1fr", "1fr", "1fr 3fr", "1fr 3fr"]}
 *   areas={['"a" "b"', '"a" "b"', '"a b"', '"a b"']}
 * >
 *   <GridArea name="a">{left}</GridArea>
 *   <GridArea name="b">{right}</GridArea>
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

import { GAP_VARIANT } from '../../styles/componentConstants';
import type { TextAlign } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import type { CSSPropertiesWithVars } from '../../utils/cssVars';
import './Grid.css';

/**
 * Responsive columns array: [mobile, tablet, laptop, desktop]
 * @example [1, 1, 2, 3] - 1 col on mobile/tablet, 2 on laptop, 3 on desktop
 */
export type ResponsiveCols = [number, number, number, number];

/**
 * Responsive template array: [mobile, tablet, laptop, desktop]
 * @example ["1fr", "1fr", "1fr 3fr", "1fr 3fr"] - stacked on mobile/tablet, 1:3 ratio on laptop/desktop
 */
export type ResponsiveTemplate = [string, string, string, string];

/**
 * Unified column type: equal columns (number) or custom template (string), static or responsive
 */
export type GridCols = number | string | ResponsiveCols | ResponsiveTemplate;

/** Narrows GridCols to the 4-breakpoint equal-columns tuple. */
function isResponsiveCols(cols: GridCols): cols is ResponsiveCols {
  return Array.isArray(cols) && typeof cols[0] === 'number';
}

/** Narrows GridCols to the 4-breakpoint template tuple. */
function isResponsiveTemplate(cols: GridCols): cols is ResponsiveTemplate {
  return Array.isArray(cols) && typeof cols[0] === 'string';
}

/**
 * Grid-specific props (layout directives)
 */
export interface GridOwnProps {
  /**
   * Element type to render as
   * @default 'div'
   * @example 'section', 'article', 'aside', 'header', 'footer', 'main'
   */
  as?: ElementType;

  /**
   * Column layout — unified prop for all column patterns:
   * - number: fixed equal columns → repeat(N, 1fr)
   * - string: custom template → raw grid-template-columns value
   * - [number x4]: responsive equal columns per breakpoint
   * - [string x4]: responsive custom template per breakpoint
   * @default 1
   * @example 3 - always 3 equal columns
   * @example "1fr 3fr" - custom ratio
   * @example [1, 1, 2, 3] - responsive equal: 1 mobile/tablet, 2 laptop, 3 desktop
   * @example ["1fr", "1fr", "1fr 3fr", "1fr 3fr"] - responsive template: stacked mobile, 1:3 desktop
   */
  cols?: GridCols;

  /**
   * Spacing between items
   * @default 'medium'
   */
  gap?: 'none' | 'tight' | 'medium' | 'large';

  /**
   * Vertical alignment (align-items)
   * @default 'stretch'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Horizontal alignment (justify-items)
   * @default 'stretch'
   */
  justify?: 'start' | 'center' | 'end' | 'stretch';

  /**
   * Text alignment (text-align) — propagates to children via CSS inheritance
   * No default — inherits from parent
   */
  textAlign?: TextAlign;

  /**
   * Named grid areas (CSS grid-template-areas)
   * Use with GridArea component for semantic grid layouts
   * - string: static areas (same on all breakpoints)
   * - [mobile, tablet, laptop, desktop]: responsive areas per breakpoint
   * @example "left center right"
   * @example ['"a" "b"', '"a" "b"', '"a b"', '"a b"'] - stacked mobile, side-by-side desktop
   */
  areas?: string | ResponsiveTemplate;

  /** Content */
  children: ReactNode;
}

/**
 * Polymorphic Grid props
 * Combines Grid-specific props with native element props based on 'as' prop
 */
export type GridProps<T extends ElementType = 'div'> = GridOwnProps &
  Omit<ComponentPropsWithRef<T>, keyof GridOwnProps>;

/**
 * Grid Component
 *
 * Polymorphic CSS Grid layout primitive.
 * Can render as any HTML element while maintaining grid layout.
 */
const Grid = forwardRef<HTMLElement, GridProps>(
  (
    {
      as = 'div',
      cols = 1,
      gap = GAP_VARIANT.MEDIUM,
      align = 'stretch',
      justify = 'stretch',
      textAlign,
      areas,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const Component = as;

    // Detect which cols variant we're dealing with
    const isResponsiveEqual = isResponsiveCols(cols);
    const isResponsiveTpl = isResponsiveTemplate(cols);
    const isStaticTpl = typeof cols === 'string';
    const isResponsiveAreas = Array.isArray(areas);

    const customStyle: CSSPropertiesWithVars = {
      display: 'grid',
      width: '100%',
      ...style,
    };

    if (isResponsiveTpl) {
      const tpl = cols;
      customStyle['--grid-tpl-mobile'] = tpl[0];
      customStyle['--grid-tpl-tablet'] = tpl[1];
      customStyle['--grid-tpl-laptop'] = tpl[2];
      customStyle['--grid-tpl-desktop'] = tpl[3];
    } else if (isStaticTpl) {
      customStyle.gridTemplateColumns = cols;
    } else {
      const [m, t, l, d] = isResponsiveEqual ? cols : [cols, cols, cols, cols];
      customStyle['--grid-cols-mobile'] = m;
      customStyle['--grid-cols-tablet'] = t;
      customStyle['--grid-cols-laptop'] = l;
      customStyle['--grid-cols-desktop'] = d;
    }

    if (isResponsiveAreas) {
      const fmt = (v: string) => (v.trim().startsWith('"') ? v : `"${v}"`);
      customStyle['--grid-areas-mobile'] = fmt(areas[0]);
      customStyle['--grid-areas-tablet'] = fmt(areas[1]);
      customStyle['--grid-areas-laptop'] = fmt(areas[2]);
      customStyle['--grid-areas-desktop'] = fmt(areas[3]);
    } else if (typeof areas === 'string') {
      customStyle.gridTemplateAreas = areas.trim().startsWith('"')
        ? areas
        : `"${areas}"`;
    }

    return createElement(
      Component,
      {
        ref,
        className: cn('dndev-grid-component', className),
        'data-gap': gap,
        'data-align': align,
        'data-justify': justify,
        'data-text-align': textAlign || undefined,
        'data-responsive': isResponsiveEqual ? 'true' : undefined,
        'data-responsive-tpl': isResponsiveTpl ? 'true' : undefined,
        'data-responsive-areas': isResponsiveAreas ? 'true' : undefined,
        style: customStyle,
        ...props,
      },
      children
    );
  }
);

Grid.displayName = 'Grid';

export { default as GridArea } from './GridArea';
export type { GridAreaProps, GridAreaOwnProps } from './GridArea';

export default Grid;
