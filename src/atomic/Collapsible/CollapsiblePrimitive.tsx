'use client';
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
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const CollapsiblePrimitive = RadixCollapsible.Root;
const CollapsibleTrigger = RadixCollapsible.CollapsibleTrigger;

/**
 * The content wrapper for Collapsible.
 *
 * Always mounted (`forceMount`): closed content stays in the server HTML
 * (crawlable). The wrapper always sets the `dndev-collapsible-content` class,
 * whose CSS hides closed content (`[data-state='closed'] { display: none }`),
 * so it is not visible, focusable or announced. Children mount (and run their
 * effects) while closed. Opening fades in (no height slide); closing is instant.
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
    <RadixCollapsible.CollapsibleContent
      className={cn('dndev-collapsible-content', className)}
      {...props}
      forceMount
    />
  );
};

export { CollapsiblePrimitive, CollapsibleTrigger, CollapsibleContent };
