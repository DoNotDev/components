// packages/components/src/atomic/Collapsible/CollapsiblePrimitive.tsx

/**
 * @fileoverview Collapsible primitives
 * @description Radix Collapsible primitives with DoNotDev theming
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixCollapsible from '@radix-ui/react-collapsible';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

const CollapsiblePrimitive = RadixCollapsible.Root;
const CollapsibleTrigger = RadixCollapsible.CollapsibleTrigger;

/**
 * The content wrapper for Collapsible.
 *
 * @component
 * @param {ComponentProps<typeof RadixCollapsible.CollapsibleContent>} props
 * @returns {JSX.Element}
 */

const CollapsibleContent = ({
  className,
  ...props
}: ComponentProps<typeof RadixCollapsible.CollapsibleContent>) => {
  return (
    <RadixCollapsible.CollapsibleContent className={cn(className)} {...props} />
  );
};

export { CollapsiblePrimitive, CollapsibleTrigger, CollapsibleContent };
