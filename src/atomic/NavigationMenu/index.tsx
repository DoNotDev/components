// packages/components/src/atomic/NavigationMenu/index.tsx

/**
 * @fileoverview NavigationMenu component
 * @description Props-based navigation menu component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ComponentProps, ComponentType, ReactNode } from 'react';

import {
  NavigationMenuPrimitive,
  NavigationMenuListPrimitive,
  NavigationMenuItemPrimitive,
  NavigationMenuContentPrimitive,
  NavigationMenuTriggerPrimitive,
  NavigationMenuLinkPrimitive,
  NavigationMenuViewportPrimitive,
} from './NavigationMenuPrimitive';
import { DISPLAY } from '../../styles/componentConstants';
import { cn } from '../../utils/helpers';
import Tooltip from '../Tooltip';

import './NavigationMenu.css';

/** Single item within a NavigationMenu. */
interface NavigationMenuItem {
  /** The display label for the item */
  label: string;
  /** The destination path (if it's a link) */
  path?: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Nested children items */
  children?: NavigationMenuItem[];
  /** Layout for children content */
  contentLayout?: 'grid' | 'list';
  /** Featured item to highlight in grid layout */
  featuredItem?: {
    label: string;
    path: string;
    description: string;
    className?: string;
  };
}

/** Props for the NavigationMenu component. */
interface NavigationMenuProps extends Omit<
  ComponentProps<typeof NavigationMenuPrimitive>,
  'vertical'
> {
  /** List of navigation items */
  items?: NavigationMenuItem[];
  /** Whether to render vertically */
  vertical?: boolean;
  /** Display mode - COMPACT (icon-only), FULL (icon+label), AUTO (CSS-driven) */
  display?: (typeof DISPLAY)[keyof typeof DISPLAY];
  /** Additional CSS classes */
  className?: string;
  /** Custom link component (e.g., Next.js Link) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- why: public prop; router Link components have incompatible prop types (narrowing is an API change, see any-audit)
  LinkComponent?: ComponentType<any>;
}

/**
 * Props-based navigation menu component built on Radix UI primitives.
 * Supports nested menus, rich content, responsive layouts, and collapsed compact mode for sidebars.
 *
 * @component
 * @example
 * ```tsx
 * // Standard horizontal navigation
 * <NavigationMenu
 *   items={[
 *     { label: 'Home', path: '/' },
 *     { label: 'Products', children: [...] }
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Vertical sidebar navigation with display mode
 * <NavigationMenu
 *   vertical
 *   display={DISPLAY.AUTO}
 *   items={routes}
 *   LinkComponent={Link}
 * />
 * ```
 * @param {NavigationMenuProps} props - The props for the navigation menu
 * @returns {JSX.Element} The rendered navigation menu
 */
const NavigationMenu = ({
  items,
  vertical = false,
  display = DISPLAY.AUTO,
  className,
  LinkComponent,
  children,
  ...props
}: NavigationMenuProps) => {
  const renderLink = (
    path: string | undefined,
    className?: string,
    style?: React.CSSProperties,
    children?: ReactNode,
    dataRole?: string,
    item?: NavigationMenuItem
  ) => {
    if (!path)
      return (
        <span className={className} style={style} data-role={dataRole}>
          {children}
        </span>
      );

    const Link = LinkComponent === undefined ? 'a' : LinkComponent;

    // WCAG: aria-label provides context for COMPACT/AUTO (icon-only when collapsed)
    const ariaLabel =
      display === DISPLAY.COMPACT || display === DISPLAY.AUTO
        ? `${item?.label || ''} - ${path}`
        : undefined;

    const linkElement =
      Link === 'a' ? (
        <a
          href={path}
          className={className}
          style={style}
          data-role={dataRole}
          aria-label={ariaLabel}
        >
          {children}
        </a>
      ) : (
        <Link
          path={path}
          href={path}
          className={className}
          style={style}
          data-role={dataRole}
          aria-label={ariaLabel}
        >
          {children}
        </Link>
      );

    // Wrap in Tooltip for COMPACT/AUTO (may be icon-only when collapsed)
    // Tooltip reads --tooltip-side from CSS (set by Sidebar)
    if (display === DISPLAY.COMPACT || display === DISPLAY.AUTO) {
      return <Tooltip content={item?.label || path}>{linkElement}</Tooltip>;
    }

    return linkElement;
  };

  if (children) {
    return (
      <NavigationMenuPrimitive
        vertical={vertical}
        className={className}
        {...props}
      >
        {children}
        {!vertical && (
          <NavigationMenuViewportPrimitive className="dndev-floating" />
        )}
      </NavigationMenuPrimitive>
    );
  }

  return (
    <NavigationMenuPrimitive
      vertical={vertical}
      className={className}
      {...props}
    >
      <NavigationMenuListPrimitive data-vertical={vertical ? 'true' : 'false'}>
        {items?.map((item, index) => {
          if (item.children && item.children.length > 0) {
            return (
              <NavigationMenuItemPrimitive key={item.label || index}>
                <NavigationMenuTriggerPrimitive className="dndev-interactive">
                  {item.icon && (
                    <span className="dndev-flex-shrink-0">{item.icon}</span>
                  )}
                  <span
                    className="dndev-interactive-label"
                    data-display={display}
                  >
                    {item.label}
                  </span>
                </NavigationMenuTriggerPrimitive>
                <NavigationMenuContentPrimitive className="dndev-floating dndev-menu-content">
                  {item.contentLayout === 'grid' ? (
                    <ul
                      className={cn(
                        'dndev-grid dndev-gap-md dndev-nav-menu-grid-container',
                        item.featuredItem
                          ? 'dndev-nav-menu-grid-featured'
                          : 'dndev-nav-menu-grid-standard'
                      )}
                    >
                      {item.featuredItem && (
                        <li className="dndev-grid dndev-nav-menu-featured-item">
                          <NavigationMenuLinkPrimitive asChild>
                            {renderLink(
                              item.featuredItem.path,
                              'dndev-nav-menu-featured-item',
                              {
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'flex-end',
                              },
                              <>
                                <div className="dndev-nav-menu-featured-title">
                                  {item.featuredItem.label}
                                </div>
                                <p className="dndev-nav-menu-featured-description">
                                  {item.featuredItem.description}
                                </p>
                              </>,
                              undefined,
                              {
                                label: item.featuredItem.label,
                                path: item.featuredItem.path,
                              }
                            )}
                          </NavigationMenuLinkPrimitive>
                        </li>
                      )}
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || child.label || childIndex}>
                          <NavigationMenuLinkPrimitive asChild>
                            {renderLink(
                              child.path,
                              'dndev-grid dndev-gap-sm dndev-nav-menu-item-container',
                              undefined,
                              <>
                                {child.icon && (
                                  <span style={{ flexShrink: 0 }}>
                                    {child.icon}
                                  </span>
                                )}
                                <div className="dndev-nav-menu-item-label">
                                  {child.label}
                                </div>
                                {child.description && (
                                  <p className="dndev-nav-menu-item-description">
                                    {child.description}
                                  </p>
                                )}
                              </>,
                              undefined,
                              child
                            )}
                          </NavigationMenuLinkPrimitive>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="dndev-grid dndev-gap-md dndev-nav-menu-grid-container dndev-nav-menu-grid-standard">
                      {item.children.map((child, childIndex) => (
                        <li key={child.path || child.label || childIndex}>
                          <NavigationMenuLinkPrimitive asChild>
                            {renderLink(
                              child.path,
                              'dndev-grid dndev-gap-sm dndev-nav-menu-item-container',
                              undefined,
                              <>
                                {child.icon && (
                                  <span style={{ flexShrink: 0 }}>
                                    {child.icon}
                                  </span>
                                )}
                                <div className="dndev-nav-menu-item-label">
                                  {child.label}
                                </div>
                                {child.description && (
                                  <p className="dndev-nav-menu-item-description">
                                    {child.description}
                                  </p>
                                )}
                              </>,
                              undefined,
                              child
                            )}
                          </NavigationMenuLinkPrimitive>
                        </li>
                      ))}
                    </ul>
                  )}
                </NavigationMenuContentPrimitive>
              </NavigationMenuItemPrimitive>
            );
          }

          return (
            <NavigationMenuItemPrimitive key={item.label || index}>
              <NavigationMenuLinkPrimitive asChild>
                {renderLink(
                  item.path,
                  'dndev-interactive',
                  undefined,
                  <>
                    {item.icon && (
                      <span style={{ flexShrink: 0 }}>{item.icon}</span>
                    )}
                    <span
                      className="dndev-interactive-label"
                      data-display={display}
                    >
                      {item.label}
                    </span>
                  </>,
                  'menu-item',
                  item
                )}
              </NavigationMenuLinkPrimitive>
            </NavigationMenuItemPrimitive>
          );
        })}
      </NavigationMenuListPrimitive>
      {!vertical && (
        <NavigationMenuViewportPrimitive className="dndev-floating" />
      )}
    </NavigationMenuPrimitive>
  );
};

export default NavigationMenu;
export type { NavigationMenuItem, NavigationMenuProps };
