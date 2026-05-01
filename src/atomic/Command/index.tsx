// packages/components/src/atomic/Command/index.tsx

/**
 * @fileoverview Custom Command Component
 * @description Native command palette using our design system patterns
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Search, X } from 'lucide-react';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { cn } from '../../utils/helpers';
import Button, { BUTTON_VARIANT } from '../Button';
import { useCommandDialogClose } from '../CommandDialog';
import Input from '../Input';

/**
 * Command item interface
 */
export interface CommandItem {
  /** The main label text */
  label: string;
  /** Optional value (defaults to label) */
  value?: string;
  /** Optional description or path */
  description?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Optional right-side badge */
  badge?: ReactNode;
  /** Callback when selected */
  onSelect?: () => void;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional custom right-side slot */
  rightSlot?: ReactNode;
}

/** Group of related items in a Command palette. */
export interface CommandGroup {
  /** Group heading */
  heading?: string;
  /** List of items in the group */
  items: CommandItem[];
  /** Whether to show a separator before this group */
  separator?: boolean;
}

/** Props for the Command component -- searchable command palette. */
export interface CommandProps {
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Message to show when no results found */
  emptyMessage?: string;
  /** Groups of command items */
  groups?: CommandGroup[];
  /** Standalone command items (ungrouped) */
  items?: CommandItem[];
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Custom Command component using our design system.
 * Pure React implementation with our interactive patterns.
 *
 * @component
 * @example
 * ```tsx
 * <Command
 *   groups={[
 *     {
 *       heading: 'Actions',
 *       items: [{ label: 'Copy', icon: <Copy />, onSelect: handleCopy }]
 *     }
 *   ]}
 * />
 * ```
 * @param {CommandProps} props - The props for the command component
 * @returns {JSX.Element} The rendered command palette
 */
const Command = ({
  placeholder = 'Search...',
  emptyMessage = 'No results found.',
  groups = [],
  items = [],
  onClose: onCloseProp,
  className,
}: CommandProps) => {
  // Use context fallback when inside CommandDialog (no cloneElement needed)
  const contextClose = useCommandDialogClose();
  const onClose = onCloseProp ?? contextClose;

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Accessibility IDs
  const commandId = useId();
  const listId = `${commandId}-list`;
  const getItemId = (index: number) => `${commandId}-item-${index}`;

  // Filter items based on search (memoized to avoid recalculation on every render)
  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0),
    [groups, search]
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    [items, search]
  );

  // Build array from FILTERED items for keyboard navigation (memoized)
  const allFilteredItems = useMemo(
    () =>
      [...filteredGroups.flatMap((g) => g.items), ...filteredItems].filter(
        (item) => !item.disabled
      ),
    [filteredGroups, filteredItems]
  );

  const hasResults = filteredGroups.length > 0 || filteredItems.length > 0;

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!allFilteredItems.length) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allFilteredItems.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          allFilteredItems[selectedIndex]?.onSelect?.();
          break;
        case 'Escape':
          e.preventDefault();
          setSearch('');
          break;
      }
    },
    [allFilteredItems, selectedIndex]
  );

  let currentIndex = 0;

  return (
    <div
      className={cn('dndev-command dndev-floating', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Search input wrapper with close button */}
      <div className="dndev-command-input-wrapper">
        <Input
          ref={inputRef}
          type="text"
          icon={Search}
          placeholder={placeholder}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          aria-label="Search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={true}
          aria-controls={listId}
          aria-activedescendant={
            hasResults ? getItemId(selectedIndex) : undefined
          }
          className="dndev-command-input"
        />
        {onClose && (
          <Button
            variant={BUTTON_VARIANT.GHOST}
            icon={X}
            onClick={onClose}
            aria-label="Close"
            className="dndev-command-close-inline"
          />
        )}
      </div>

      {/* Results list */}
      <div
        ref={listRef}
        className="dndev-command-list"
        role="listbox"
        id={listId}
      >
        {!hasResults && (
          <div className="dndev-command-empty">{emptyMessage}</div>
        )}

        {/* Render groups */}
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.heading || groupIndex}>
            {group.separator && groupIndex > 0 && (
              <div className="dndev-menu-separator" />
            )}
            <div className="dndev-command-group">
              {group.heading && (
                <div className="dndev-menu-label">{group.heading}</div>
              )}
              {group.items.map((item) => {
                const itemIndex = currentIndex++;
                const isSelected = itemIndex === selectedIndex;
                const hasIcon = !!item.icon;
                const hasLabel = !!item.label;

                // WCAG: aria-label for icon-only items
                const ariaLabel =
                  hasIcon && !hasLabel
                    ? item.label || 'Command item'
                    : undefined;

                return (
                  <div
                    key={item.value || item.label}
                    className={cn('dndev-interactive', {
                      'dndev-interactive-selected': isSelected,
                    })}
                    data-role="command-item"
                    data-selected={isSelected}
                    aria-label={ariaLabel}
                    {...(hasIcon && !hasLabel && { 'data-display': 'compact' })}
                    onClick={() => !item.disabled && item.onSelect?.()}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    role="option"
                    aria-selected={isSelected}
                    id={getItemId(itemIndex)}
                  >
                    {item.icon}
                    <span className="dndev-command-item-label">
                      {item.label}
                    </span>
                    {item.description && (
                      <span className="dndev-command-item-path">
                        {item.description}
                      </span>
                    )}
                    {item.badge}
                    {item.shortcut && (
                      <span className="dndev-command-shortcut">
                        {item.shortcut}
                      </span>
                    )}
                    {item.rightSlot}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Render standalone items */}
        {filteredItems.length > 0 && (
          <div className="dndev-command-group">
            {filteredItems.map((item) => {
              const itemIndex = currentIndex++;
              const isSelected = itemIndex === selectedIndex;
              const hasIcon = !!item.icon;
              const hasLabel = !!item.label;

              // WCAG: aria-label for icon-only items
              const ariaLabel =
                hasIcon && !hasLabel ? item.label || 'Command item' : undefined;

              return (
                <div
                  key={item.value || item.label}
                  className={cn('dndev-interactive', {
                    'dndev-interactive-selected': isSelected,
                  })}
                  data-role="command-item"
                  data-selected={isSelected}
                  aria-label={ariaLabel}
                  {...(hasIcon && !hasLabel && { 'data-display': 'compact' })}
                  onClick={() => !item.disabled && item.onSelect?.()}
                  onMouseEnter={() => setSelectedIndex(itemIndex)}
                  role="option"
                  aria-selected={isSelected}
                  id={getItemId(itemIndex)}
                >
                  {item.icon}
                  <span className="dndev-command-item-label">{item.label}</span>
                  {item.description && (
                    <span className="dndev-command-item-path">
                      {item.description}
                    </span>
                  )}
                  {item.badge}
                  {item.shortcut && (
                    <span className="dndev-command-shortcut">
                      {item.shortcut}
                    </span>
                  )}
                  {item.rightSlot}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Command;
