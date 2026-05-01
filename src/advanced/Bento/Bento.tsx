// packages/components/src/advanced/Bento/Bento.tsx

/**
 * @fileoverview Bento Grid Component
 * @description Asymmetric grid layout for modern "bento box" style displays.
 * Supports variable cell spanning for visual hierarchy.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cn } from '../../utils/helpers';

import type { ReactNode, CSSProperties, Ref } from 'react';

/**
 * Individual cell data for the Bento grid
 */
export type BentoCellData = {
  /** Unique identifier for the cell */
  id: string;
  /** Content to render inside the cell */
  content: ReactNode;
  /** Grid span configuration */
  span?: {
    /** Number of columns to span (default: 1) */
    cols?: number;
    /** Number of rows to span (default: 1) */
    rows?: number;
  };
  /** Additional class name for the cell */
  className?: string;
};

/**
 * Gap size options
 */
export type BentoGap = 'tight' | 'medium' | 'large';

/**
 * Responsive column configuration
 */
export type BentoColumns = {
  /** Mobile columns (0-767px) */
  mobile: number;
  /** Tablet columns (768-1023px) */
  tablet: number;
  /** Desktop columns (1024-1439px) */
  desktop: number;
  /** Wide screen columns (1440px+) */
  wide: number;
};

/**
 * Bento grid props
 */
export type BentoProps = {
  /** Array of cell data to render */
  items: BentoCellData[];
  /** Responsive column configuration {mobile, tablet, desktop, wide} */
  columns: BentoColumns;
  /** Gap between cells */
  gap?: BentoGap;
  /** Additional class name for the grid container */
  className?: string;
  /** ARIA label for accessibility */
  ariaLabel?: string;
  /** React 19: ref is a regular prop */
  ref?: Ref<HTMLDivElement>;
};

/**
 * Bento Grid Component
 *
 * Creates an asymmetric grid layout where items can span multiple columns/rows.
 * Perfect for tech stack displays, feature showcases, or portfolio grids.
 *
 * @example
 * ```tsx
 * <Bento
 *   items={[
 *     { id: '1', content: <HeroCard />, span: { cols: 2 } },
 *     { id: '2', content: <SmallCard /> },
 *     { id: '3', content: <SmallCard /> },
 *   ]}
 *   columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}
 *
 * />
 * ```
 */
export function Bento({
  items,
  columns,
  gap = 'medium',
  className,
  ariaLabel,
  ref,
}: BentoProps) {
  const gridStyle: CSSProperties = {
    '--bento-columns-mobile': columns.mobile,
    '--bento-columns-tablet': columns.tablet,
    '--bento-columns-desktop': columns.desktop,
    '--bento-columns-wide': columns.wide,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      data-bento-grid
      data-gap={gap}
      className={cn('bento-grid', className)}
      style={gridStyle}
      role="list"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const cellStyle: CSSProperties = {
          '--cell-cols': item.span?.cols ?? 1,
          '--cell-rows': item.span?.rows ?? 1,
        } as CSSProperties;

        return (
          <div
            key={item.id}
            data-bento-cell
            className={cn('bento-cell', item.className)}
            style={cellStyle}
            role="listitem"
          >
            {item.content}
          </div>
        );
      })}
    </div>
  );
}

export default Bento;
