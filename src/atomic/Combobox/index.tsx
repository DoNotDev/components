// packages/components/src/atomic/Combobox/index.tsx

import { Check, ChevronDown, Plus, X } from 'lucide-react';
import {
  useState,
  useMemo,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from 'react';

import { CONTROL_VARIANT, type ControlVariant } from '../../utils/constants';
import { cn } from '../../utils/helpers';
import Input from '../Input';
import { FloatingLabel } from '../Label';
import ScrollArea from '../ScrollArea';
import Spinner from '../Spinner';
import { withCssVars } from '../../utils/cssVars';

import './Combobox.css';

/** Single option within a Combobox dropdown. */
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  content?: React.ReactNode;
  /** Faceted count displayed as muted text after the label */
  count?: number;
}

/** Props for the Combobox component -- searchable select with single/multi selection support. */
export interface ComboboxProps {
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  options?: ComboboxOption[];
  disabled?: boolean;
  isLoading?: boolean;
  variant?: ControlVariant;
  emptyMessage?: string;
  multiple?: boolean;
  label?: string;
  creatable?: boolean;
  createLabel?: string;
  clearable?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearchChange?: (search: string) => void;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
  /** Callback for a permanent "+" create action at the bottom of the dropdown */
  onCreateClick?: () => void;
  /** Label for the create action (default: createLabel or 'Create new') */
  createActionLabel?: string;
  /** Inline chips rendered inside the input area (for multiselect token fields) */
  chips?: React.ReactNode;
}

/**
 * Compute trailing padding for the input based on the number of trailing items.
 * All inline controls (clear, create, chevron) are full touch targets
 * (`--touch-target`, 48px) via `.dndev-inline-action-btn`. Spinner matches
 * the chevron width so there's no layout shift on loading.
 * Gaps between items = `--gap-tight`. Outer inset on both sides = `--gap-sm`.
 */
function computeTrailingPad(actionCount: number): string {
  const parts = ['var(--gap-sm)'];
  if (actionCount > 0) parts.push(`${actionCount} * var(--touch-target)`);
  parts.push('var(--touch-target)'); // chevron / spinner slot
  if (actionCount > 0) parts.push(`${actionCount} * var(--gap-tight, 4px)`);
  parts.push('var(--gap-sm)');
  return `calc(${parts.join(' + ')})`;
}

const Combobox = ({
  value,
  onValueChange,
  placeholder = 'Select...',
  emptyMessage = 'No results found',
  options = [],
  disabled,
  isLoading,
  variant,
  multiple = false,
  label,
  creatable = false,
  createLabel = 'Create',
  clearable = false,
  onOpenChange,
  onSearchChange,
  required,
  onCreateClick,
  createActionLabel,
  chips,
}: ComboboxProps) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  /** Tracks whether the user has typed in the input during this open session */
  const isSearchingRef = useRef(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedValues = !value ? [] : Array.isArray(value) ? value : [value];

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    const searchLower = search.toLowerCase();
    return options.filter((option) => {
      const labelMatch = option.label.toLowerCase().includes(searchLower);
      const descMatch = option.description?.toLowerCase().includes(searchLower);
      return labelMatch || descMatch;
    });
  }, [options, search]);

  const showCreateOption = useMemo(() => {
    if (!creatable || !search.trim()) return false;
    const exactMatch = options.some(
      (opt) =>
        opt.value.toLowerCase() === search.toLowerCase() ||
        opt.label.toLowerCase() === search.toLowerCase()
    );
    return !exactMatch;
  }, [creatable, search, options]);

  const displayOptions = useMemo(() => {
    if (showCreateOption) {
      return [
        ...filteredOptions,
        {
          value: search.trim(),
          label: `${createLabel} "${search.trim()}"`,
          isCreateOption: true,
        } as ComboboxOption & { isCreateOption?: boolean },
      ];
    }
    return filteredOptions;
  }, [filteredOptions, showCreateOption, search, createLabel]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    onOpenChange?.(isOpen);
  };

  useEffect(() => {
    if (open) {
      setHighlightedIndex(0);
    } else {
      isSearchingRef.current = false;
      if (!multiple) {
        setSearch('');
      }
    }
  }, [open, multiple]);

  // Cleanup debounce timer on unmount
  useEffect(
    () => () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    },
    []
  );

  useEffect(() => {
    if (open && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [displayOptions.length]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onValueChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
      handleOpenChange(false);
      setSearch('');
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          handleOpenChange(true);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % displayOptions.length);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) {
          setHighlightedIndex(
            (prev) => (prev - 1 + displayOptions.length) % displayOptions.length
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (
          open &&
          displayOptions[highlightedIndex] &&
          !displayOptions[highlightedIndex].disabled
        ) {
          handleSelect(displayOptions[highlightedIndex].value);
        } else if (!open) {
          handleOpenChange(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleOpenChange(false);
        setSearch('');
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSelection) onValueChange?.(multiple ? [] : '');
    if (search) setSearch('');
    isSearchingRef.current = false;
    inputRef.current?.focus();
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    handleOpenChange(!open);
    if (open) {
      inputRef.current?.blur();
    } else {
      inputRef.current?.focus();
    }
  };

  const getDisplayValue = () => {
    // User is actively typing/backspacing — always show the search text (even if empty)
    if (open && isSearchingRef.current) return search;
    if (open && search) return search;
    if (selectedValues.length === 0) return '';
    if (multiple) return '';
    const selectedOption = options.find(
      (opt) => opt.value === selectedValues[0]
    );
    return selectedOption?.label || (creatable ? selectedValues[0] : '');
  };

  const displayValue = getDisplayValue();
  const hasSelection = selectedValues.length > 0;

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    isSearchingRef.current = true;
    setSearch(newValue);
    if (!open) handleOpenChange(true);

    // Backspaced to empty while having a selection → clear the value
    if (newValue === '' && hasSelection && !multiple) {
      onValueChange?.('');
    }

    // Debounce onSearchChange (300ms) — callers may trigger API calls
    if (onSearchChange) {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => onSearchChange(newValue), 300);
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      handleOpenChange(true);
    }
  };

  const handleInputClick = () => {
    if (!disabled) {
      handleOpenChange(true);
      inputRef.current?.focus();
    }
  };

  // Count trailing action buttons to compute input padding.
  // Always reserve space for the clear button when clearable (avoids layout shift on select/clear).
  const showCreate = !!onCreateClick && !disabled;
  const showClear =
    clearable && !disabled && (hasSelection || search.length > 0);
  const reservedCount = (showCreate ? 1 : 0) + (clearable ? 1 : 0);
  const trailingPad = computeTrailingPad(reservedCount);

  return (
    <div
      ref={containerRef}
      className={cn('dndev-relative', open && 'dndev-combobox-open')}
      style={{ width: '100%' }}
    >
      {/* Set --combobox-pad-end as CSS variable so the rule targets .dndev-input directly,
           even when Input renders inside a FloatingLabel fieldset (label prop). */}
      {chips && label ? (
        <FloatingLabel
          htmlFor={id}
          label={label}
          disabled={disabled}
          required={required}
        >
          <div
            className={cn(
              'dndev-relative dndev-combobox-wrapper',
              'dndev-combobox-wrapper--chips'
            )}
            style={withCssVars({ '--combobox-pad-end': trailingPad })}
            onClick={handleInputClick}
          >
            {chips}
            <Input
              ref={inputRef}
              id={id}
              bare
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              placeholder={hasSelection ? '' : placeholder}
              disabled={disabled}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id}-listbox`}
              autoComplete="one-time-code"
              aria-autocomplete="list"
              data-variant={variant}
            />
            <div className="dndev-combobox-trailing">
              {showCreate && (
                <button
                  type="button"
                  className="dndev-inline-action-btn dndev-combobox-action-btn dndev-combobox-action-btn--create"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateClick!();
                  }}
                  aria-label={createActionLabel || createLabel || 'Create new'}
                >
                  <Plus />
                </button>
              )}
              {showClear && (
                <button
                  type="button"
                  className="dndev-inline-action-btn dndev-combobox-action-btn dndev-combobox-action-btn--clear"
                  onClick={handleClear}
                  aria-label="Clear"
                >
                  <X />
                </button>
              )}
              {isLoading ? (
                <span className="dndev-combobox-spinner">
                  <Spinner />
                </span>
              ) : (
                <button
                  type="button"
                  className="dndev-inline-action-btn dndev-combobox-chevron"
                  onClick={handleChevronClick}
                  onMouseDown={(e) => e.preventDefault()}
                  tabIndex={-1}
                  aria-label={open ? 'Close' : 'Open'}
                  aria-expanded={open}
                  disabled={disabled}
                >
                  <ChevronDown />
                </button>
              )}
            </div>
          </div>
        </FloatingLabel>
      ) : (
        <div
          className={cn(
            'dndev-relative dndev-combobox-wrapper',
            chips && 'dndev-combobox-wrapper--chips'
          )}
          style={withCssVars({ '--combobox-pad-end': trailingPad })}
          onClick={chips ? handleInputClick : undefined}
        >
          {chips}
          <Input
            ref={inputRef}
            id={id}
            label={chips ? undefined : label}
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={chips ? undefined : handleInputClick}
            onKeyDown={handleKeyDown}
            placeholder={hasSelection && chips ? '' : placeholder}
            disabled={disabled}
            required={required}
            bare={!!chips}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-listbox`}
            autoComplete="one-time-code"
            aria-autocomplete="list"
            data-variant={variant}
          />
          <div className="dndev-combobox-trailing">
            {showCreate && (
              <button
                type="button"
                className="dndev-inline-action-btn dndev-combobox-action-btn dndev-combobox-action-btn--create"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateClick!();
                }}
                aria-label={createActionLabel || createLabel || 'Create new'}
              >
                <Plus />
              </button>
            )}
            {showClear && (
              <button
                type="button"
                className="dndev-inline-action-btn dndev-combobox-action-btn dndev-combobox-action-btn--clear"
                onClick={handleClear}
                aria-label="Clear"
              >
                <X />
              </button>
            )}
            {isLoading ? (
              <span className="dndev-combobox-spinner">
                <Spinner />
              </span>
            ) : (
              <span className="dndev-combobox-chevron">
                <ChevronDown />
              </span>
            )}
          </div>
        </div>
      )}

      {open && (
        <div
          className="dndev-floating dndev-menu-content dndev-z-tooltip dndev-combobox-content"
          style={{
            position: 'absolute',
            top: '100%',
            insetInlineStart: 0,
            insetInlineEnd: 0,
            width: '100%',
            marginTop: 'var(--gap-tight)',
            padding: 'var(--gap-tight)',
            textAlign: 'start',
          }}
          data-glow="blank"
        >
          <ScrollArea className="dndev-menu-scroll-area" end>
            <div
              ref={listRef}
              id={`${id}-listbox`}
              role="listbox"
              aria-label={label || placeholder}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--gap-none)',
              }}
            >
              {displayOptions.length === 0 ? (
                <div
                  className="dndev-combobox-empty"
                  style={{ textAlign: 'start' }}
                >
                  {emptyMessage}
                </div>
              ) : (
                displayOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isHighlighted = index === highlightedIndex;
                  const isCreateOption = (
                    option as ComboboxOption & { isCreateOption?: boolean }
                  ).isCreateOption;

                  return (
                    <button
                      key={
                        isCreateOption ? `create-${option.value}` : option.value
                      }
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      disabled={option.disabled}
                      className={cn(
                        'dndev-interactive dndev-combobox-option',
                        isHighlighted && 'dndev-combobox-option-highlighted',
                        isSelected && 'dndev-combobox-option-selected',
                        isCreateOption && 'dndev-combobox-option-create'
                      )}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      {option.content ? (
                        option.content
                      ) : (
                        <>
                          {isCreateOption && (
                            <Plus className="dndev-combobox-option-create-icon" />
                          )}
                          <div className="dndev-combobox-option-content">
                            <span className="dndev-combobox-option-label">
                              {option.label}
                              {option.count !== undefined && (
                                <span className="dndev-combobox-option-count">
                                  ({option.count})
                                </span>
                              )}
                            </span>
                            {option.description && (
                              <span className="dndev-combobox-option-description">
                                {option.description}
                              </span>
                            )}
                          </div>
                          {isSelected && !isCreateOption && (
                            <Check className="dndev-combobox-option-check" />
                          )}
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Combobox;
export { CONTROL_VARIANT as COMBOBOX_VARIANT };
export type { ControlVariant as ComboboxVariant };
