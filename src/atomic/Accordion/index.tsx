'use client';
// packages/components/src/atomic/Accordion/index.tsx

/**
 * @fileoverview Accordion component
 * @description Accessible accordion component built on Radix UI primitives provides a prop based implementation to get rid of Radix internal nesting.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  AccordionPrimitive,
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive,
} from './AccordionPrimitive';
import type { AccordionTitleAs } from './AccordionPrimitive';
import { cn } from '../../utils/helpers';
import { getGridColsProps, type GridCols } from '../Grid';

/** Single item within an Accordion. */
export interface AccordionItemType {
  /** The unique value for the accordion item */
  value: string;
  /** The content to be displayed in the trigger/header */
  trigger: string | ReactNode;
  /** The content to be displayed when expanded */
  content: string | ReactNode;
}

/** Props for the Accordion component. */
export interface AccordionProps {
  /**
   * The type of accordion.
   * @default 'single'
   */
  type?: 'single' | 'multiple';
  /**
   * Whether an accordion item can be collapsed after opening (only for type="single").
   * @default false
   */
  collapsible?: boolean;
  /** The default active value(s) */
  defaultValue?: string | string[];
  /** The controlled active value(s) */
  value?: string | string[];
  /** Callback when value changes */
  onValueChange?: (value: string | string[]) => void;
  /** The list of items to render */
  items: AccordionItemType[];
  /**
   * Heading element wrapping each item trigger. Pick the level that fits the
   * page outline (e.g. `'h4'` under an `h3` section).
   * @default 'h3'
   */
  titleAs?: AccordionTitleAs;
  /**
   * Lay the items out in a responsive grid (items flow in order, cells align to
   * the start so opening one does not stretch its row neighbour). Same type and
   * breakpoints as `Section`'s `gridCols` / `<Grid cols>`: number, string
   * template or a `[mobile, tablet, laptop, desktop]` tuple. Absent = one column.
   * @example [1, 1, 2, 2] - 1 column on mobile/tablet, 2 on laptop/desktop
   */
  gridCols?: GridCols;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A vertically stacked set of interactive headings that each reveal a section of content.
 * Built on Radix UI Accordion. Closed items stay mounted (in the server HTML,
 * crawlable) and are hidden with `display: none` (not visible, focusable or
 * announced); their effects run while closed. Opening fades in (no height
 * slide); collapsing is instant.
 *
 * @component
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { value: '1', trigger: 'Item 1', content: 'Content 1' },
 *     { value: '2', trigger: 'Item 2', content: 'Content 2' }
 *   ]}
 * />
 * ```
 * @example
 * ```tsx
 * <Accordion items={items} gridCols={[1, 1, 2, 2]} />
 * ```
 * @param {AccordionProps} props - The props for the accordion
 * @returns {JSX.Element} The rendered accordion
 */
const Accordion = ({
  type = 'single',
  collapsible = false,
  defaultValue,
  value,
  onValueChange,
  items,
  titleAs = 'h3',
  gridCols,
  className,
}: AccordionProps) => {
  // gridCols: the root reuses Grid's class, attributes and column mapping
  // (Grid.css); absent = today's single column, same DOM.
  const gridProps = gridCols
    ? (() => {
        const { style, responsive, responsiveTpl } = getGridColsProps(gridCols);
        return {
          style: { display: 'grid', width: '100%', ...style },
          'data-gap': 'medium',
          'data-align': 'start',
          'data-responsive': responsive ? 'true' : undefined,
          'data-responsive-tpl': responsiveTpl ? 'true' : undefined,
        };
      })()
    : undefined;
  const rootClassName = cn(
    'dndev-accordion',
    gridCols && 'dndev-grid-component',
    className
  );

  // Handle type narrowing for Radix's union types
  if (type === 'multiple') {
    return (
      <AccordionPrimitive
        type="multiple"
        defaultValue={defaultValue as string[] | undefined}
        value={value as string[] | undefined}
        onValueChange={onValueChange as ((value: string[]) => void) | undefined}
        className={rootClassName}
        {...gridProps}
      >
        {items.map((item) => (
          <AccordionItemPrimitive
            key={item.value}
            value={item.value}
            className="dndev-accordion-item"
          >
            <AccordionTriggerPrimitive
              titleAs={titleAs}
              className="dndev-interactive dndev-accordion-header">
              {item.trigger}
              <ChevronDown className="dndev-accordion-trigger-icon" />
            </AccordionTriggerPrimitive>
            <AccordionContentPrimitive className="dndev-accordion-content">
              <div className="dndev-accordion-content-inner">
                {item.content}
              </div>
            </AccordionContentPrimitive>
          </AccordionItemPrimitive>
        ))}
      </AccordionPrimitive>
    );
  }

  return (
    <AccordionPrimitive
      type="single"
      collapsible={collapsible}
      defaultValue={defaultValue as string | undefined}
      value={value as string | undefined}
      onValueChange={onValueChange as ((value: string) => void) | undefined}
      className={rootClassName}
        {...gridProps}
    >
      {items.map((item) => (
        <AccordionItemPrimitive
          key={item.value}
          value={item.value}
          className="dndev-accordion-item"
        >
          <AccordionTriggerPrimitive
              titleAs={titleAs}
              className="dndev-interactive dndev-accordion-header">
            {item.trigger}
            <ChevronDown className="dndev-accordion-trigger-icon" />
          </AccordionTriggerPrimitive>
          <AccordionContentPrimitive className="dndev-accordion-content">
            <div className="dndev-accordion-content-inner">{item.content}</div>
          </AccordionContentPrimitive>
        </AccordionItemPrimitive>
      ))}
    </AccordionPrimitive>
  );
};

export default Accordion;
export type { AccordionTitleAs };
