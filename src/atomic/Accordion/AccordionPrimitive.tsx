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

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

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
  ...props
}: ComponentProps<typeof RadixAccordion.Trigger> & {
  asChild?: boolean;
}) => {
  const Comp = asChild ? Slot : RadixAccordion.Trigger;
  return (
    <RadixAccordion.Header>
      <Comp className={cn(className)} data-role="accordion-trigger" {...props}>
        {children}
      </Comp>
    </RadixAccordion.Header>
  );
};

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
      className={cn(
        'dndev-accordion-content',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
        className
      )}
      {...rest}
    >
      <div className="dndev-accordion-content-inner">{children}</div>
    </Comp>
  );
};

export { AccordionPrimitive };
export {
  AccordionItemPrimitive,
  AccordionTriggerPrimitive,
  AccordionContentPrimitive,
};
