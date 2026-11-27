'use client';
// packages/components/src/atomic/Accordion/AccordionPrimitive.tsx

/**
 * @fileoverview Accordion component
 * @description Accessible accordion component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixAccordion from '@radix-ui/react-accordion';
import { Slot } from '@radix-ui/react-slot';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

/** Heading element of an accordion item trigger. */
export type AccordionTitleAs = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const AccordionPrimitive = RadixAccordion.Root;

const AccordionItemPrimitive = ({
  className,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixAccordion.Item> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : RadixAccordion.Item;
  return <Comp className={cn(className)} {...props} />;
};

const AccordionTriggerPrimitive = ({
  className,
  children,
  asChild = false,
  titleAs = 'h3',
  ...props
}: ComponentProps<typeof RadixAccordion.Trigger> & {
  asChild?: boolean;
  /** Heading element wrapping the trigger. @default 'h3' */
  titleAs?: AccordionTitleAs;
}) => {
  const Comp = asChild ? Slot : RadixAccordion.Trigger;
  const Heading = titleAs;
  return (
    <RadixAccordion.Header asChild>
      <Heading>
        <Comp
          className={cn(className)}
          data-role="accordion-trigger"
          {...props}
        >
          {children}
        </Comp>
      </Heading>
    </RadixAccordion.Header>
  );
};

/**
 * Accordion item content. Always mounted (`forceMount`): closed content stays
 * in the server HTML (crawlable). Children mount (and run their effects) while
 * closed. Opening and closing animate the height and opacity with one grid row
 * (`0fr` ↔ `1fr`, Accordion.css: no measured height); closed content is
 * `visibility: hidden` once collapsed (not visible, focusable or announced).
 */
const AccordionContentPrimitive = ({
  className,
  children,
  asChild = false,
  ...rest
}: ComponentProps<typeof RadixAccordion.Content> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : RadixAccordion.Content;
  return (
    <Comp
      className={cn('dndev-accordion-content', className)}
      {...rest}
      // asChild renders a bare Slot (no Radix Content): nothing to force-mount
      forceMount={asChild ? undefined : true}
    >
      {/* Collapse layer (Accordion.css). On a child: Radix sets an inline
          transition-duration: 0s on Content while measuring, which cancels a
          transition on Content itself */}
      <div className="dndev-accordion-content-grid">
        <div className="dndev-accordion-content-clip">
          <div className="dndev-accordion-content-inner">{children}</div>
        </div>
      </div>
    </Comp>
  );
};

export { AccordionPrimitive };
export {
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive,
};
