// packages/components/src/atomic/NavigationMenu/NavigationMenuPrimitive.tsx

/**
 * @fileoverview NavigationMenu component
 * @description Accessible navigation menu component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixNavigationMenu from '@radix-ui/react-navigation-menu';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

interface NavigationMenuPrimitiveProps extends ComponentProps<
  typeof RadixNavigationMenu.Root
> {
  vertical?: boolean;
}

const NavigationMenuPrimitive = ({
  className,
  children,
  vertical = false,
  ...props
}: NavigationMenuPrimitiveProps) => {
  const orientation = vertical ? 'vertical' : 'horizontal';

  return (
    <RadixNavigationMenu.Root
      orientation={orientation}
      className={cn('dndev-nav-menu-base', className)}
      data-vertical={vertical ? 'true' : 'false'}
      {...props}
    >
      {children}
      {!vertical && <NavigationMenuViewportPrimitive />}{' '}
    </RadixNavigationMenu.Root>
  );
};

interface NavigationMenuListPrimitiveProps extends ComponentProps<
  typeof RadixNavigationMenu.List
> {
  vertical?: boolean;
}

const NavigationMenuListPrimitive = ({
  className,
  vertical = false,
  ...props
}: NavigationMenuListPrimitiveProps) => (
  <RadixNavigationMenu.List
    className={cn('dndev-nav-menu-list', className)}
    data-vertical={vertical ? 'true' : 'false'}
    {...props}
  />
);

const NavigationMenuItemPrimitive = RadixNavigationMenu.Item;

const navigationMenuTriggerStylePrimitive = cva('');

const NavigationMenuTriggerPrimitive = ({
  className,
  children,
  ...props
}: ComponentProps<typeof RadixNavigationMenu.Trigger>) => (
  <RadixNavigationMenu.Trigger
    className={cn(navigationMenuTriggerStylePrimitive(), className)}
    data-role="nav-trigger"
    {...props}
  >
    {children}{' '}
    <ChevronDown className="dndev-nav-menu-trigger-icon" aria-hidden="true" />
  </RadixNavigationMenu.Trigger>
);

const NavigationMenuContentPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixNavigationMenu.Content>) => (
  <RadixNavigationMenu.Content
    className={cn('dndev-nav-menu-content', className)}
    {...props}
  />
);

const NavigationMenuLinkPrimitive = RadixNavigationMenu.Link;

const NavigationMenuViewportPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixNavigationMenu.Viewport>) => (
  <div className="dndev-nav-menu-viewport-wrapper">
    <RadixNavigationMenu.Viewport
      className={cn('dndev-nav-menu-viewport', className)}
      {...props}
    />
  </div>
);

const NavigationMenuIndicatorPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixNavigationMenu.Indicator>) => (
  <RadixNavigationMenu.Indicator
    className={cn('dndev-nav-menu-indicator', className)}
    {...props}
  >
    <div className="dndev-nav-menu-indicator-inner" />
  </RadixNavigationMenu.Indicator>
);

export { NavigationMenuPrimitive };
export {
  navigationMenuTriggerStylePrimitive,
  NavigationMenuListPrimitive,
  NavigationMenuItemPrimitive,
  NavigationMenuContentPrimitive,
  NavigationMenuTriggerPrimitive,
  NavigationMenuLinkPrimitive,
  NavigationMenuIndicatorPrimitive,
  NavigationMenuViewportPrimitive,
};
