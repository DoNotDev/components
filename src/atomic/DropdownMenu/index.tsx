// packages/components/src/atomic/DropdownMenu/index.tsx

/**
 * @fileoverview Dropdown Menu Component - Props-based API
 * @description Professional dropdown menu implementation with props-based API.
 * Provides accessible, keyboard-navigable dropdown menus with DoNotDev theming,
 * RTL support, and React 19 compatibility.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { ChevronRight, Check } from 'lucide-react';
import { Children } from 'react';

import {
  DropdownMenuPrimitive,
  DropdownMenuTriggerPrimitive,
  DropdownMenuContentPrimitive,
  DropdownMenuItemPrimitive,
  DropdownMenuSubPrimitive,
  DropdownMenuSubTriggerPrimitive,
  DropdownMenuSubContentPrimitive,
  DropdownMenuPortalPrimitive,
  DropdownMenuLabelPrimitive,
  DropdownMenuSeparatorPrimitive,
} from './DropdownMenuPrimitive';
import { cn } from '../../utils/helpers';
import ScrollArea from '../ScrollArea';

import type { ComponentType, CSSProperties, ReactNode } from 'react';

import './DropdownMenu.css';

/** WCAG: aria-label for icon-only menu items */
const getIconOnlyAriaLabel = (
  hasIcon: boolean,
  hasLabel: boolean,
  label: string | ReactNode | undefined,
  fallback: string
): string | undefined => {
  if (!hasIcon || hasLabel) return undefined;
  if (typeof label === 'string') return label;
  return fallback;
};

type BaseDropdownMenuItem = {
  label?: string | ReactNode;
  icon?: ComponentType<{ className?: string }>;
  iconEnd?: ComponentType<{ className?: string }>;
  onClick?: () => void;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Variant for styling (e.g., 'destructive') */
  variant?: 'destructive' | string;
  /** Custom content to render instead of label (for Links, custom components) */
  children?: ReactNode;
  /** Render item as child (for Links) */
  asChild?: boolean;
};

type DropdownMenuNormalItem = BaseDropdownMenuItem & {
  type?: 'item';
};

type DropdownMenuLabelItem = {
  type: 'label';
  label: string | ReactNode;
  className?: string;
};

type DropdownMenuSeparatorItem = {
  type: 'separator';
  className?: string;
};

type DropdownMenuSubmenuItem = BaseDropdownMenuItem & {
  type: 'submenu';
  label: string | ReactNode;
  /** Nested sub-menu items */
  subItems?: DropdownMenuItemData[];
  /** Custom content for sub-menu (for complex components like CacheSettings) */
  subContent?: ReactNode;
};

/** Union of possible dropdown menu item types (normal, label, separator, submenu). */
export type DropdownMenuItemData =
  | DropdownMenuNormalItem
  | DropdownMenuLabelItem
  | DropdownMenuSeparatorItem
  | DropdownMenuSubmenuItem;

/** Props for the DropdownMenu component. */
export interface DropdownMenuProps {
  /** The element that opens the menu */
  trigger?: ReactNode;
  /** List of menu items (alternative to children) */
  items?: DropdownMenuItemData[];
  /** Custom content to render in menu (for complex layouts) */
  children?: ReactNode;
  /** Custom width for the content */
  contentWidth?: string;
  /** Alignment of the menu content */
  contentAlign?: 'start' | 'center' | 'end';
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * Professional dropdown menu implementation with props-based API.
 * Provides accessible, keyboard-navigable dropdown menus with DoNotDev theming.
 *
 * @component
 * @example
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Options</Button>}
 *   items={[
 *     { type: 'label', label: 'Account' },
 *     { type: 'item', label: 'Profile', icon: User },
 *     { type: 'item', label: 'Settings', icon: Settings },
 *     { type: 'separator' },
 *     { type: 'item', label: 'Log out', onClick: handleLogout, variant: 'destructive' }
 *   ]}
 * />
 * ```
 * @param {DropdownMenuProps} props - The props for the dropdown menu
 * @returns {JSX.Element | null} The rendered dropdown menu
 */
const DropdownMenu = ({
  trigger,
  items = [],
  children,
  contentWidth,
  contentAlign = 'start',
  open,
  onOpenChange,
}: DropdownMenuProps) => {
  if (!trigger) return null;

  const normalizedChildren = children ? Children.toArray(children) : [];

  // Wrap children in DropdownMenuItemPrimitive (without asChild).
  // Radix renders its own wrapper element with proper onSelect → auto-close.
  // asChild doesn't work here because components (GoTo, ThemeToggle, etc.)
  // don't forward Radix's merged event handlers to the DOM.
  const wrappedChildren = normalizedChildren.map((child, index) => (
    <DropdownMenuItemPrimitive key={index}>{child}</DropdownMenuItemPrimitive>
  ));

  const content = (
    <>
      {wrappedChildren}
      {items.length > 0 &&
        items.map((item, index) => {
          // Label item
          if (item.type === 'label') {
            return (
              <DropdownMenuLabelPrimitive
                key={index}
                className={cn('dndev-menu-label', item.className)}
              >
                {item.label}
              </DropdownMenuLabelPrimitive>
            );
          }

          // Separator item
          if (item.type === 'separator') {
            return (
              <DropdownMenuSeparatorPrimitive
                key={index}
                className={cn('dndev-menu-separator', item.className)}
              />
            );
          }

          // Sub-menu item
          if (item.type === 'submenu') {
            const submenuItem = item as DropdownMenuSubmenuItem;
            const Icon = submenuItem.icon;
            const hasSubIcon = !!Icon;
            const hasSubLabel = !!submenuItem.label;

            return (
              <DropdownMenuSubPrimitive key={index}>
                <DropdownMenuSubTriggerPrimitive
                  className={cn('dndev-interactive', submenuItem.className)}
                  style={submenuItem.style}
                  aria-label={getIconOnlyAriaLabel(
                    hasSubIcon,
                    hasSubLabel,
                    submenuItem.label,
                    'Submenu'
                  )}
                  {...(hasSubIcon &&
                    !hasSubLabel && { 'data-display': 'compact' })}
                >
                  {Icon && <Icon />}
                  <span>{submenuItem.label}</span>
                  <ChevronRight className="dndev-dropdown-menu-trailing" />
                </DropdownMenuSubTriggerPrimitive>
                <DropdownMenuPortalPrimitive>
                  <DropdownMenuSubContentPrimitive
                    className={cn(
                      'dndev-floating dndev-z-tooltip',
                      submenuItem.subContent
                        ? 'dndev-dropdown-sub-content-custom'
                        : ''
                    )}
                  >
                    {submenuItem.subContent ||
                      submenuItem.subItems?.map((subItem, subIndex) => {
                        // Handle label/separator in submenu
                        if (subItem.type === 'label') {
                          return (
                            <DropdownMenuLabelPrimitive
                              key={subIndex}
                              className={cn(
                                'dndev-menu-label',
                                subItem.className
                              )}
                            >
                              {subItem.label}
                            </DropdownMenuLabelPrimitive>
                          );
                        }
                        if (subItem.type === 'separator') {
                          return (
                            <DropdownMenuSeparatorPrimitive
                              key={subIndex}
                              className={cn(
                                'dndev-menu-separator',
                                subItem.className
                              )}
                            />
                          );
                        }

                        const normalSubItem = subItem as DropdownMenuNormalItem;
                        const SubIcon = normalSubItem.icon;
                        const hasSubItemIcon = !!SubIcon;
                        const hasSubItemLabel = !!normalSubItem.label;

                        return (
                          <DropdownMenuItemPrimitive
                            key={subIndex}
                            onClick={normalSubItem.onClick}
                            disabled={normalSubItem.disabled}
                            className={cn(
                              'dndev-interactive',
                              normalSubItem.className
                            )}
                            style={normalSubItem.style}
                            asChild={normalSubItem.asChild}
                            aria-label={getIconOnlyAriaLabel(
                              hasSubItemIcon,
                              hasSubItemLabel,
                              normalSubItem.label,
                              'Menu item'
                            )}
                            {...(hasSubItemIcon &&
                              !hasSubItemLabel && {
                                'data-display': 'compact',
                              })}
                            {...(normalSubItem.variant && {
                              'data-variant': normalSubItem.variant,
                            })}
                            {...(normalSubItem.checked && {
                              'data-state': 'checked',
                            })}
                          >
                            {normalSubItem.children || (
                              <>
                                {SubIcon && <SubIcon />}
                                <span>{normalSubItem.label}</span>
                                {normalSubItem.checked && (
                                  <Check className="dndev-dropdown-menu-checkmark dndev-dropdown-menu-trailing" />
                                )}
                              </>
                            )}
                          </DropdownMenuItemPrimitive>
                        );
                      })}
                  </DropdownMenuSubContentPrimitive>
                </DropdownMenuPortalPrimitive>
              </DropdownMenuSubPrimitive>
            );
          }

          // Regular item (type === 'item' or no type)
          const normalItem = item as DropdownMenuNormalItem;
          const Icon = normalItem.icon;

          // If asChild and children provided, render children directly (for Links)
          if (normalItem.asChild && normalItem.children) {
            return (
              <DropdownMenuItemPrimitive
                key={index}
                onClick={normalItem.onClick}
                disabled={normalItem.disabled}
                className={cn('dndev-interactive', normalItem.className)}
                style={normalItem.style}
                asChild={true}
                {...(normalItem.variant && {
                  'data-variant': normalItem.variant,
                })}
                {...(normalItem.checked && {
                  'data-state': 'checked',
                })}
              >
                {normalItem.children}
              </DropdownMenuItemPrimitive>
            );
          }

          const IconEnd = normalItem.iconEnd;
          const hasIcon = !!Icon;
          const hasLabel = !!normalItem.label;

          return (
            <DropdownMenuItemPrimitive
              key={index}
              onClick={normalItem.onClick}
              disabled={normalItem.disabled}
              className={cn('dndev-interactive', normalItem.className)}
              style={normalItem.style}
              asChild={normalItem.asChild}
              aria-label={getIconOnlyAriaLabel(
                hasIcon,
                hasLabel,
                normalItem.label,
                'Menu item'
              )}
              {...(hasIcon && !hasLabel && { 'data-display': 'compact' })}
              {...(normalItem.variant && {
                'data-variant': normalItem.variant,
              })}
              {...(normalItem.checked && {
                'data-state': 'checked',
              })}
            >
              {normalItem.children ? (
                <>
                  {normalItem.children}
                  {IconEnd && (
                    <IconEnd className="dndev-dropdown-menu-trailing" />
                  )}
                </>
              ) : (
                <>
                  {Icon && <Icon />}
                  <span>{normalItem.label}</span>
                  {IconEnd && (
                    <IconEnd className="dndev-dropdown-menu-trailing" />
                  )}
                  {normalItem.checked && (
                    <Check className="dndev-dropdown-menu-checkmark dndev-dropdown-menu-trailing" />
                  )}
                </>
              )}
            </DropdownMenuItemPrimitive>
          );
        })}
    </>
  );

  return (
    <DropdownMenuPrimitive open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTriggerPrimitive asChild>
        {trigger}
      </DropdownMenuTriggerPrimitive>
      <DropdownMenuContentPrimitive
        align={contentAlign}
        className="dndev-floating dndev-menu-content dndev-z-tooltip"
        style={contentWidth ? { width: contentWidth } : undefined}
      >
        <ScrollArea className="dndev-menu-scroll-area" end>
          {content}
        </ScrollArea>
      </DropdownMenuContentPrimitive>
    </DropdownMenuPrimitive>
  );
};

export default DropdownMenu;
