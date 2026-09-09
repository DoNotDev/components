// packages/components/src/atomic/ContextMenu/index.tsx

/**
 * @fileoverview Context Menu component
 * @description Accessible context menu component built on Radix UI primitives. Supports nested submenus, checkboxes, and radio groups.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  ContextMenuPrimitive,
  ContextMenuTriggerPrimitive,
  ContextMenuContentPrimitive,
  ContextMenuItemPrimitive,
  ContextMenuCheckboxItemPrimitive,
  ContextMenuRadioGroupPrimitive,
  ContextMenuRadioItemPrimitive,
  ContextMenuLabelPrimitive,
  ContextMenuSeparatorPrimitive,
  ContextMenuShortcutPrimitive,
  ContextMenuSubPrimitive,
  ContextMenuSubContentPrimitive,
  ContextMenuSubTriggerPrimitive,
} from './ContextMenuPrimitive';

/** Base properties shared by all context menu items */
type BaseContextMenuItem = {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
  icon?: ReactNode;
};

type ContextMenuNormalItem = BaseContextMenuItem & {
  type?: 'item';
};

type ContextMenuCheckboxItem = BaseContextMenuItem & {
  type: 'checkbox';
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

type ContextMenuRadioItem = {
  label: string;
  value: string;
};

type ContextMenuRadioGroupItem = {
  type: 'radio-group';
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  items: ContextMenuRadioItem[];
};

type ContextMenuSubmenuItem = {
  type: 'submenu';
  label: string;
  items: ContextMenuItemType[];
};

type ContextMenuSeparatorItem = {
  type: 'separator';
};

type ContextMenuLabelItem = {
  type: 'label';
  label: string;
};

/** Union type of all possible context menu items */
export type ContextMenuItemType =
  | ContextMenuNormalItem
  | ContextMenuCheckboxItem
  | ContextMenuRadioGroupItem
  | ContextMenuSubmenuItem
  | ContextMenuSeparatorItem
  | ContextMenuLabelItem;

/** Props for the ContextMenu component -- right-click context menu. */
export interface ContextMenuProps {
  /** The element that triggers the context menu (right-click) */
  trigger: ReactNode;
  /** List of items to display in the menu */
  items: ContextMenuItemType[];
}

const renderMenuItem = (item: ContextMenuItemType, index: number) => {
  switch (item.type) {
    case 'separator':
      return (
        <ContextMenuSeparatorPrimitive
          key={index}
          className="dndev-menu-separator"
        />
      );
    case 'label':
      return (
        <ContextMenuLabelPrimitive key={index} className="dndev-menu-label">
          {item.label}
        </ContextMenuLabelPrimitive>
      );
    case 'checkbox':
      return (
        <ContextMenuCheckboxItemPrimitive
          key={index}
          checked={item.checked}
          onCheckedChange={item.onCheckedChange}
          disabled={item.disabled}
          onSelect={item.onSelect}
          className="dndev-interactive"
        >
          {item.icon}
          {item.label}
          {item.shortcut && (
            <ContextMenuShortcutPrimitive className="dndev-menu-shortcut">
              {item.shortcut}
            </ContextMenuShortcutPrimitive>
          )}
        </ContextMenuCheckboxItemPrimitive>
      );
    case 'radio-group':
      return (
        <ContextMenuRadioGroupPrimitive
          key={index}
          value={item.value}
          onValueChange={item.onValueChange}
        >
          {item.label && (
            <ContextMenuLabelPrimitive className="dndev-menu-label">
              {item.label}
            </ContextMenuLabelPrimitive>
          )}
          {item.items.map((radioItem) => (
            <ContextMenuRadioItemPrimitive
              key={radioItem.value}
              value={radioItem.value}
              className="dndev-interactive"
            >
              {radioItem.label}
            </ContextMenuRadioItemPrimitive>
          ))}
        </ContextMenuRadioGroupPrimitive>
      );
    case 'submenu':
      return (
        <ContextMenuSubPrimitive key={index}>
          <ContextMenuSubTriggerPrimitive className="dndev-interactive">
            {item.label}
            <ChevronRight />
          </ContextMenuSubTriggerPrimitive>
          <ContextMenuSubContentPrimitive className="dndev-floating dndev-surface dndev-z-tooltip">
            {item.items.map(renderMenuItem)}
          </ContextMenuSubContentPrimitive>
        </ContextMenuSubPrimitive>
      );
    case 'item':
    default:
      return (
        <ContextMenuItemPrimitive
          key={index}
          onSelect={item.onSelect}
          disabled={item.disabled}
          className="dndev-interactive"
        >
          {item.icon}
          {item.label}
          {item.shortcut && (
            <ContextMenuShortcutPrimitive className="dndev-menu-shortcut">
              {item.shortcut}
            </ContextMenuShortcutPrimitive>
          )}
        </ContextMenuItemPrimitive>
      );
  }
};

/**
 * Accessible context menu component built on Radix UI primitives.
 * Supports nested submenus, checkboxes, and radio groups.
 *
 * @component
 * @example
 * ```tsx
 * <ContextMenu
 *   trigger={<div className="h-32 w-32 border">Right click here</div>}
 *   items={[
 *     { label: 'Back', onSelect: handleBack },
 *     { type: 'separator' },
 *     { type: 'checkbox', label: 'Show Toolbar', checked: true, onCheckedChange: toggle }
 *   ]}
 * />
 * ```
 * @param {ContextMenuProps} props - The props for the context menu
 * @returns {JSX.Element} The rendered context menu
 */
const ContextMenu = ({ trigger, items }: ContextMenuProps) => {
  return (
    <ContextMenuPrimitive>
      <ContextMenuTriggerPrimitive asChild>
        {trigger}
      </ContextMenuTriggerPrimitive>
      <ContextMenuContentPrimitive className="dndev-floating dndev-menu-content dndev-z-tooltip">
        {items.map(renderMenuItem)}
      </ContextMenuContentPrimitive>
    </ContextMenuPrimitive>
  );
};

export default ContextMenu;
