// packages/components/src/atomic/Tabs/index.tsx

/**
 * @fileoverview Tabs Component - Props-based API
 * @description Tabbed interface component with props-based API
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ReactNode, CSSProperties } from 'react';
import type { ComponentProps } from 'react';

import {
  TabsPrimitive,
  TabsListPrimitive,
  TabsTriggerPrimitive,
  TabsContentPrimitive,
} from './TabsPrimitive';
import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

/** Single tab definition within Tabs. */
export interface TabItem {
  /** Unique identifier for the tab */
  value: string;
  /** Tab label content */
  label: string | ReactNode;
  /** Tab panel content */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Additional class name for trigger */
  className?: string;
  /** Whether to force mount content even when inactive */
  forceMount?: boolean;
}

const tabsVariants = cva('', {
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
    },
  },
  defaultVariants: {
    variant: THEME_VARIANT.DEFAULT,
  },
});

/** Union of available Tabs variant values. */
export type TabsVariant = VariantProps<typeof tabsVariants>['variant'];

/** Props for the Tabs component. */
export interface TabsProps
  extends
    Omit<ComponentProps<typeof TabsPrimitive>, 'children'>,
    VariantProps<typeof tabsVariants> {
  /** Array of tab items */
  items: TabItem[];
  /** Number of columns for tab list (Grid prop) */
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'auto-fit' | 'auto-fill';
  /** Minimum column width for auto-fit/auto-fill layouts (Grid prop) */
  minColWidth?: string;
  /** Spacing between tabs (Grid prop) */
  gap?: 'none' | 'tight' | 'medium' | 'large';
  /** Vertical alignment (Grid prop) */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Horizontal alignment (Grid prop) */
  justify?: 'start' | 'center' | 'end' | 'stretch';
  /** Center the tablist horizontally */
  center?: boolean;
  /** Custom list className */
  listClassName?: string;
  /** Custom list inline styles */
  listStyle?: CSSProperties;
  /** Custom content wrapper className */
  contentClassName?: string;
  /** Custom content wrapper inline styles */
  contentStyle?: CSSProperties;
}

/**
 * Tabbed interface component with props-based API.
 * WCAG 2.1 compliant with full keyboard navigation and ARIA support.
 * Built on Radix UI Tabs primitives with Grid-based layout control.
 *
 * @component
 * @example
 * Basic usage:
 * ```tsx
 * <Tabs
 *   defaultValue="tab1"
 *   items={[
 *     { value: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
 *     { value: 'tab2', label: 'Tab 2', content: <div>Content 2</div> }
 *   ]}
 * />
 * ```
 *
 * @example
 * Responsive tabs (6 columns desktop, auto-wraps to 3 columns mobile):
 * ```tsx
 * <Tabs
 *   items={tabItems}
 *   defaultValue="tab1"
 *   cols={6}
 *   minColWidth="250px"
 *   gap="none"
 * />
 * ```
 *
 * @example
 * Fixed 3-column grid (2 rows of 3 on mobile):
 * ```tsx
 * <Tabs
 *   items={tabItems}
 *   cols={3}
 *   gap="tight"
 * />
 * ```
 *
 * @example
 * Controlled tabs with custom styling:
 * ```tsx
 * <Tabs
 *   value={activeTab}
 *   onValueChange={setActiveTab}
 *   items={[
 *     {
 *       value: 'settings',
 *       label: 'Settings',
 *       content: <SettingsPanel />,
 *       disabled: false,
 *       className: 'custom-tab-class'
 *     }
 *   ]}
 *   listClassName="custom-list"
 *   contentClassName="custom-content"
 * />
 * ```
 *
 * **Accessibility:**
 * - Full keyboard navigation (Arrow keys, Home, End)
 * - ARIA roles: `tablist`, `tab`, `tabpanel`
 * - ARIA attributes: `aria-selected`, `aria-controls`, `aria-labelledby`
 * - Focus management handled automatically
 * - Screen reader support
 * - Active tab: Background color + shadow (distinct from hover/focus)
 *
 * **Layout:**
 * - Uses Grid internally for precise multi-row layouts
 * - Accepts Grid props: `cols`, `minColWidth`, `gap`, `align`
 * - Responsive: Use `cols={6}` with `minColWidth="250px"` for desktop 6 cols, mobile 3 cols
 * - No card styling by default (composable - wrap in Card if needed)
 *
 * @param {TabsProps} props - The props for the tabs
 * @returns {JSX.Element} The rendered tabs
 */
const Tabs = ({
  items,
  defaultValue,
  value,
  onValueChange,
  cols,
  minColWidth,
  gap = 'none',
  align = 'stretch',
  justify = 'center',
  center = true,
  listClassName,
  listStyle,
  contentClassName,
  contentStyle,
  variant,
  className,
  ...props
}: TabsProps) => {
  const finalCols = cols ?? 'auto-fit';
  const variantAttrs = getVariantDataAttrs({ variant });

  const layoutAttrs = {
    'data-cols': finalCols,
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
  };

  const mergedListStyle = {
    ...listStyle,
  } as CSSProperties;

  return (
    <TabsPrimitive
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn(tabsVariants({ variant }), className)}
      {...props}
    >
      <TabsListPrimitive
        className={cn('dndev-grid-component', listClassName)}
        style={mergedListStyle}
        {...layoutAttrs}
      >
        {items.map((item) => (
          <TabsTriggerPrimitive
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn('dndev-interactive', item.className)}
            {...variantAttrs}
          >
            {item.label}
          </TabsTriggerPrimitive>
        ))}
      </TabsListPrimitive>
      {items.map((item) => (
        <TabsContentPrimitive
          key={item.value}
          value={item.value}
          forceMount={item.forceMount === true ? true : undefined}
          className={cn('dndev-tabs-content', contentClassName)}
          style={contentStyle}
        >
          {item.content}
        </TabsContentPrimitive>
      ))}
    </TabsPrimitive>
  );
};

export default Tabs;
export { tabsVariants };
