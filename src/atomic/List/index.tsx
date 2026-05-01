// packages/components/src/atomic/List/index.tsx

/**
 * @fileoverview List component
 * @description Simple list component for bullet points, numbered lists, and feature lists
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { GAP_VARIANT } from '../../styles/componentConstants';
import { cn } from '../../utils/helpers';

import type { ReactNode, HTMLAttributes } from 'react';
import './List.css';

/** Single item within a List. */
export interface ListItem {
  /** Item content (text or ReactNode) */
  content: ReactNode;
  /** Optional icon before item */
  icon?: ReactNode;
  /** Optional additional CSS classes for this item */
  className?: string;
}

/** Props for the List component -- bullet, numbered, or feature lists. */
export interface ListProps extends HTMLAttributes<
  HTMLUListElement | HTMLOListElement
> {
  /** Array of items (strings or objects) */
  items?: (string | ReactNode | ListItem)[];
  /** Whether to render as ordered list (numbers) */
  ordered?: boolean;
  /**
   * Default icon for all string items.
   * Individual ListItem.icon takes precedence.
   */
  icon?: ReactNode;
  /**
   * Spacing between items
   * @default 'tight'
   */
  gap?: GapVariant;
  /**
   * Density variant - controls spacing and font size
   * @default 'default'
   * - 'dense': Minimal spacing, compact for tight layouts
   * - 'narrow': Tight spacing, smaller font
   * - 'default': Standard spacing (current behavior)
   * - 'expressive': Larger spacing, more breathing room
   */
  density?: 'dense' | 'narrow' | 'default' | 'expressive';
  /** Additional CSS classes */
  className?: string;
}

/**
 * List component for bullet points, numbered lists, and feature lists.
 * Zero CSS required - handles all styling via framework patterns.
 *
 * @component
 * @example
 * ```tsx
 * // Simple bullet list
 * <List items={['Feature 1', 'Feature 2', 'Feature 3']} />
 *
 * // Numbered list
 * <List items={['Step 1', 'Step 2', 'Step 3']} ordered />
 *
 * // List with icons
 * <List items={[
 *   { icon: <Check />, content: 'Completed' },
 *   { icon: <X />, content: 'Failed' }
 * ]} />
 * ```
 * @param {ListProps} props - The props for the list
 * @returns {JSX.Element} The rendered list component
 */
const List = ({
  items = [],
  ordered = false,
  icon,
  gap = GAP_VARIANT.TIGHT,
  density = 'default',
  className,
  ...props
}: ListProps) => {
  const Component = ordered ? 'ol' : 'ul';

  return (
    <Component
      className={cn('dndev-list', className)}
      data-ordered={ordered ? 'true' : undefined}
      data-gap={gap}
      data-density={density}
      {...props}
    >
      {items.map((item, index) => {
        // Handle string/number - apply container icon if provided
        if (typeof item === 'string' || typeof item === 'number') {
          if (icon) {
            return (
              <li key={index} className="dndev-list-item">
                <span className="dndev-list-item-icon">{icon}</span>
                <span className="dndev-list-item-content">{item}</span>
              </li>
            );
          }
          return (
            <li key={index} className="dndev-list-item">
              {item}
            </li>
          );
        }

        // Handle ReactNode (JSX elements)
        if (!item || typeof item !== 'object' || !('content' in item)) {
          return (
            <li key={index} className="dndev-list-item">
              {item as ReactNode}
            </li>
          );
        }

        // Handle ListItem object - item icon takes precedence over container icon
        const listItem = item as ListItem;
        const itemIcon = listItem.icon ?? icon;
        return (
          <li key={index} className={cn('dndev-list-item', listItem.className)}>
            {itemIcon && (
              <span className="dndev-list-item-icon">{itemIcon}</span>
            )}
            <span className="dndev-list-item-content">{listItem.content}</span>
          </li>
        );
      })}
    </Component>
  );
};

export { GAP_VARIANT };
/** Union of available gap variant values. */
export type GapVariant = (typeof GAP_VARIANT)[keyof typeof GAP_VARIANT];

export default List;
