// packages/components/src/atomic/ContextMenu/ContextMenuPrimitive.tsx

/**
 * @fileoverview ContextMenu Primitive
 * @description Low-level Radix UI context menu wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

const ContextMenuPrimitive = RadixContextMenu.Root;

const ContextMenuTriggerPrimitive = RadixContextMenu.Trigger;

const ContextMenuGroupPrimitive = RadixContextMenu.Group;

const ContextMenuPortalPrimitive = RadixContextMenu.Portal;

const ContextMenuSubPrimitive = RadixContextMenu.Sub;

const ContextMenuRadioGroupPrimitive = RadixContextMenu.RadioGroup;

const ContextMenuSubTriggerPrimitive = ({
  className,
  inset,
  children,
  ...props
}: ComponentProps<typeof RadixContextMenu.SubTrigger> & {
  inset?: boolean;
}) => (
  <RadixContextMenu.SubTrigger
    className={cn(className)}
    data-role="menu-item"
    data-inset={inset ? 'true' : undefined}
    {...props}
  >
    {children}
  </RadixContextMenu.SubTrigger>
);

const ContextMenuSubContentPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixContextMenu.SubContent>) => (
  <RadixContextMenu.SubContent className={cn(className)} {...props} />
);

const ContextMenuContentPrimitive = ({
  className,
  onCloseAutoFocus = (e) => e.preventDefault(),
  ...props
}: ComponentProps<typeof RadixContextMenu.Content> & {
  onCloseAutoFocus?: (event: Event) => void;
}) => (
  <RadixContextMenu.Portal>
    <RadixContextMenu.Content
      onCloseAutoFocus={onCloseAutoFocus}
      className={cn(className)}
      {...props}
    />
  </RadixContextMenu.Portal>
);

const ContextMenuItemPrimitive = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof RadixContextMenu.Item> & {
  inset?: boolean;
}) => (
  <RadixContextMenu.Item
    className={cn(className)}
    data-role="menu-item"
    data-inset={inset ? 'true' : undefined}
    {...props}
  />
);

const ContextMenuCheckboxItemPrimitive = ({
  className,
  children,
  checked,
  ...props
}: ComponentProps<typeof RadixContextMenu.CheckboxItem>) => (
  <RadixContextMenu.CheckboxItem
    className={cn(className)}
    data-role="menu-item"
    data-inset="true"
    checked={checked}
    {...props}
  >
    <RadixContextMenu.ItemIndicator>
      <Check />
    </RadixContextMenu.ItemIndicator>
    {children}
  </RadixContextMenu.CheckboxItem>
);

const ContextMenuRadioItemPrimitive = ({
  className,
  children,
  ...props
}: ComponentProps<typeof RadixContextMenu.RadioItem>) => (
  <RadixContextMenu.RadioItem
    className={cn(className)}
    data-role="menu-item"
    data-inset="true"
    {...props}
  >
    <RadixContextMenu.ItemIndicator>
      <Circle />
    </RadixContextMenu.ItemIndicator>
    {children}
  </RadixContextMenu.RadioItem>
);

const ContextMenuLabelPrimitive = ({
  className,
  inset,
  ...props
}: ComponentProps<typeof RadixContextMenu.Label> & {
  inset?: boolean;
}) => (
  <RadixContextMenu.Label
    className={cn(className)}
    data-inset={inset ? 'true' : undefined}
    {...props}
  />
);

const ContextMenuSeparatorPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixContextMenu.Separator>) => (
  <RadixContextMenu.Separator className={cn(className)} {...props} />
);

const ContextMenuShortcutPrimitive = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn(className)} {...props} />;
};

export { ContextMenuPrimitive };
export {
  ContextMenuTriggerPrimitive,
  ContextMenuContentPrimitive,
  ContextMenuItemPrimitive,
  ContextMenuCheckboxItemPrimitive,
  ContextMenuRadioItemPrimitive,
  ContextMenuLabelPrimitive,
  ContextMenuSeparatorPrimitive,
  ContextMenuShortcutPrimitive,
  ContextMenuGroupPrimitive,
  ContextMenuPortalPrimitive,
  ContextMenuSubPrimitive,
  ContextMenuSubContentPrimitive,
  ContextMenuSubTriggerPrimitive,
  ContextMenuRadioGroupPrimitive,
};
