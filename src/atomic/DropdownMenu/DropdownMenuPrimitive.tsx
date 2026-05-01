// packages/components/src/atomic/DropdownMenu/DropdownMenuPrimitive.tsx

/**
 * @fileoverview DropdownMenu Primitive
 * @description Low-level Radix UI dropdown menu wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

const DropdownMenuPrimitive = RadixDropdownMenu.Root;
const DropdownMenuTriggerPrimitive = RadixDropdownMenu.Trigger;
const DropdownMenuGroupPrimitive = RadixDropdownMenu.Group;
const DropdownMenuPortalPrimitive = RadixDropdownMenu.Portal;
const DropdownMenuSubPrimitive = RadixDropdownMenu.Sub;
const DropdownMenuRadioGroupPrimitive = RadixDropdownMenu.RadioGroup;

const DropdownMenuSubTriggerPrimitive = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.SubTrigger> & {
  inset?: boolean;
}) => (
  <RadixDropdownMenu.SubTrigger
    className={cn(className)}
    data-role="menu-item"
    data-inset={inset ? 'true' : undefined}
    {...props}
  >
    {children}
  </RadixDropdownMenu.SubTrigger>
);

const DropdownMenuSubContentPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.SubContent>) => (
  <RadixDropdownMenu.SubContent className={cn(className)} {...props} />
);

const DropdownMenuContentPrimitive = ({
  className,
  sideOffset = 4,
  align = 'start',
  onCloseAutoFocus = (e) => e.preventDefault(),
  ...props
}: ComponentProps<typeof RadixDropdownMenu.Content> & {
  onCloseAutoFocus?: (event: Event) => void;
}) => {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        sideOffset={sideOffset}
        align={align}
        onCloseAutoFocus={onCloseAutoFocus}
        className={cn(className)}
        {...props}
      />
    </RadixDropdownMenu.Portal>
  );
};

const DropdownMenuItemPrimitive = ({
  className,
  inset,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.Item> & {
  asChild?: boolean;
  inset?: boolean;
}) => (
  <RadixDropdownMenu.Item
    className={cn(className)}
    data-role="menu-item"
    data-inset={inset ? 'true' : undefined}
    asChild={asChild}
    {...props}
  />
);

const DropdownMenuCheckboxItemPrimitive = ({
  className,
  children,
  checked,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.CheckboxItem> & {
  asChild?: boolean;
}) => (
  <RadixDropdownMenu.CheckboxItem
    className={cn(className)}
    data-role="menu-item"
    data-inset="true"
    checked={checked}
    asChild={asChild}
    {...props}
  >
    <RadixDropdownMenu.ItemIndicator>
      <Check />
    </RadixDropdownMenu.ItemIndicator>
    {children}
  </RadixDropdownMenu.CheckboxItem>
);

const DropdownMenuRadioItemPrimitive = ({
  className,
  children,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.RadioItem> & {
  asChild?: boolean;
}) => (
  <RadixDropdownMenu.RadioItem
    className={cn(className)}
    data-role="menu-item"
    data-inset="true"
    asChild={asChild}
    {...props}
  >
    <RadixDropdownMenu.ItemIndicator>
      <Circle />
    </RadixDropdownMenu.ItemIndicator>
    {children}
  </RadixDropdownMenu.RadioItem>
);

const DropdownMenuLabelPrimitive = ({
  className,
  inset,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.Label> & {
  asChild?: boolean;
  inset?: boolean;
}) => (
  <RadixDropdownMenu.Label
    className={cn(className)}
    data-inset={inset ? 'true' : undefined}
    asChild={asChild}
    {...props}
  />
);

const DropdownMenuSeparatorPrimitive = ({
  className,
  asChild = false,
  ...props
}: ComponentProps<typeof RadixDropdownMenu.Separator> & {
  asChild?: boolean;
}) => (
  <RadixDropdownMenu.Separator
    className={cn(className)}
    asChild={asChild}
    {...props}
  />
);

const DropdownMenuShortcutPrimitive = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn(className)} {...props} />;
};

export { DropdownMenuPrimitive };
export {
  DropdownMenuTriggerPrimitive,
  DropdownMenuContentPrimitive,
  DropdownMenuItemPrimitive,
  DropdownMenuCheckboxItemPrimitive,
  DropdownMenuRadioItemPrimitive,
  DropdownMenuLabelPrimitive,
  DropdownMenuSeparatorPrimitive,
  DropdownMenuShortcutPrimitive,
  DropdownMenuGroupPrimitive,
  DropdownMenuPortalPrimitive,
  DropdownMenuSubPrimitive,
  DropdownMenuSubContentPrimitive,
  DropdownMenuSubTriggerPrimitive,
  DropdownMenuRadioGroupPrimitive,
};
