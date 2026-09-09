// packages/components/src/atomic/HoverCard/HoverCardPrimitive.tsx

/**
 * @fileoverview HoverCard primitives
 * @description Radix HoverCard primitives with DoNotDev theming
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixHoverCard from '@radix-ui/react-hover-card';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const HoverCardPrimitive = ({
  openDelay = 0,
  ...props
}: RadixHoverCard.HoverCardProps) => (
  <RadixHoverCard.Root openDelay={openDelay} {...props} />
);

const HoverCardTrigger = RadixHoverCard.Trigger;

const HoverCardContent = ({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof RadixHoverCard.Content>) => {
  return (
    <RadixHoverCard.Portal>
      <RadixHoverCard.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(className)}
        {...props}
      />
    </RadixHoverCard.Portal>
  );
};

export { HoverCardPrimitive };
export { HoverCardTrigger, HoverCardContent };
