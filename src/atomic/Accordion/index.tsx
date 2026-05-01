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

import {
  AccordionPrimitive,
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive,
} from './AccordionPrimitive';
import { cn } from '../../utils/helpers';

import type { ReactNode } from 'react';

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
  /** Additional CSS classes */
  className?: string;
}

/**
 * A vertically stacked set of interactive headings that each reveal a section of content.
 * Built on Radix UI Accordion.
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
  className,
}: AccordionProps) => {
  // Handle type narrowing for Radix's union types
  if (type === 'multiple') {
    return (
      <AccordionPrimitive
        type="multiple"
        defaultValue={defaultValue as string[] | undefined}
        value={value as string[] | undefined}
        onValueChange={onValueChange as ((value: string[]) => void) | undefined}
        className={cn('dndev-accordion', className)}
      >
        {items.map((item) => (
          <AccordionItemPrimitive
            key={item.value}
            value={item.value}
            className="dndev-accordion-item"
          >
            <AccordionTriggerPrimitive className="dndev-interactive dndev-accordion-header">
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
      className={cn('dndev-accordion', className)}
    >
      {items.map((item) => (
        <AccordionItemPrimitive
          key={item.value}
          value={item.value}
          className="dndev-accordion-item"
        >
          <AccordionTriggerPrimitive className="dndev-interactive dndev-accordion-header">
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
