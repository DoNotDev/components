// packages/components/src/atomic/Tabs/TabsPrimitive.tsx

/**
 * @fileoverview Tabs component
 * @description Accessible tabs component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

const TabsPrimitiveRoot = TabsPrimitive.Root;

const TabsListPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List className={cn(className)} {...props} />
);

const TabsTriggerPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(className)}
    data-role="tab-trigger"
    {...props}
  />
);

type TabsContentPrimitiveProps = ComponentProps<
  typeof TabsPrimitive.Content
> & {
  forceMount?: boolean;
};

const TabsContentPrimitive = ({
  className,
  forceMount,
  ...props
}: TabsContentPrimitiveProps) => (
  <TabsPrimitive.Content
    forceMount={forceMount}
    className={cn(className)}
    {...props}
  />
);

export {
  TabsPrimitiveRoot as TabsPrimitive,
  TabsListPrimitive,
  TabsTriggerPrimitive,
  TabsContentPrimitive,
};
