// packages/components/src/atomic/Select/index.tsx

/**
 * @fileoverview Select component
 * @description Accessible select component built on Radix UI primitives. Provides a prop-based implementation.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SelectRadix from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { useId } from 'react';

import { cn } from '../../utils/helpers';
import { FloatingLabel } from '../Label';
import ScrollArea from '../ScrollArea';
import {
  SelectPrimitive,
  SelectTriggerPrimitive,
  SelectValuePrimitive,
  SelectContentPrimitive,
  SelectItemPrimitive,
  SelectLabelPrimitive,
  SelectSeparatorPrimitive,
} from './SelectPrimitive';

import type { ReactNode, ComponentProps } from 'react';

import './Select.css';

/** Use as `value` in a SelectOption to render a group label instead of a selectable item */
export const SELECT_LABEL_VALUE = '__label__' as const;

/** Use as `value` in a SelectOption to render a visual separator instead of a selectable item */
export const SELECT_SEPARATOR_VALUE = '__separator__' as const;

/** Single option within a Select dropdown. */
export interface SelectOption {
  /**
   * Option value. Use {@link SELECT_LABEL_VALUE} or {@link SELECT_SEPARATOR_VALUE}
   * for non-selectable structural items.
   */
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
  content?: ReactNode;
}

/** Props for the Select component. */
export interface SelectProps extends Omit<
  ComponentProps<typeof SelectPrimitive>,
  'children'
> {
  /** Selected value */
  value?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Array of options */
  options?: SelectOption[];
  /** Custom trigger element */
  trigger?: ReactNode;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select is in a loading state */
  isLoading?: boolean;
  /** Label for floating label - automatically floats when both label and placeholder are provided */
  label?: string;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
}

/**
 * Accessible select component built on Radix UI primitives.
 * Provides a prop-based implementation to abstract Radix nesting.
 *
 * @component
 * @example
 * ```tsx
 * <Select
 *   value={value}
 *   onValueChange={setValue}
 *   placeholder="Select an option..."
 *   options={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 * />
 * ```
 * @param {SelectProps} props - The props for the select
 * @returns {JSX.Element} The rendered select
 */
const Select = ({
  value,
  onValueChange,
  placeholder = 'Select an option...',
  options = [],
  trigger,
  disabled,
  isLoading,
  defaultValue,
  label,
  required,
  ...props
}: SelectProps) => {
  const id = useId();
  const hasLabel = !!label;

  const triggerElement = (
    <SelectTriggerPrimitive
      id={id}
      className="dndev-input dndev-select-trigger"
      disabled={disabled}
      data-bare={hasLabel || undefined}
    >
      {isLoading ? (
        <div className="dndev-select-loading-container">
          <div className="dndev-animate-spin dndev-select-loading-spinner" />
          <span>Loading...</span>
        </div>
      ) : (
        <SelectValuePrimitive placeholder={placeholder} />
      )}
      <SelectRadix.Icon asChild>
        <ChevronDown />
      </SelectRadix.Icon>
    </SelectTriggerPrimitive>
  );

  const customTrigger = trigger ? (
    <SelectTriggerPrimitive
      asChild
      disabled={disabled}
      className="dndev-input dndev-select-trigger"
    >
      {trigger}
    </SelectTriggerPrimitive>
  ) : hasLabel ? (
    <FloatingLabel
      htmlFor={id}
      label={label}
      disabled={disabled}
      required={required}
    >
      {triggerElement}
    </FloatingLabel>
  ) : (
    triggerElement
  );

  return (
    <SelectPrimitive
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
      disabled={disabled}
      {...props}
    >
      {customTrigger}
      <SelectRadix.Portal>
        <SelectContentPrimitive
          className="dndev-floating dndev-menu-content dndev-z-tooltip dndev-select-content"
          position="popper"
          side="bottom"
          sideOffset={4}
          align="start"
          data-glow="blank"
        >
          <SelectRadix.Viewport>
            <ScrollArea className="dndev-menu-scroll-area" end>
              {options.map((option) => {
                if (option.value === SELECT_LABEL_VALUE) {
                  return (
                    <SelectLabelPrimitive
                      key={option.label}
                      className="dndev-menu-label"
                    >
                      {option.label}
                    </SelectLabelPrimitive>
                  );
                }
                if (option.value === SELECT_SEPARATOR_VALUE) {
                  return (
                    <SelectSeparatorPrimitive
                      key="separator"
                      className="dndev-menu-separator"
                    />
                  );
                }
                return (
                  <SelectItemPrimitive
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                    className="dndev-interactive"
                    data-role="menu-item"
                  >
                    {option.content ? (
                      option.content
                    ) : (
                      <>
                        <SelectRadix.ItemText>
                          <span>{option.label}</span>
                          {option.description && (
                            <span className="dndev-select-item-description">
                              {option.description}
                            </span>
                          )}
                        </SelectRadix.ItemText>
                      </>
                    )}
                    <SelectRadix.ItemIndicator className="dndev-dropdown-menu-checkmark dndev-dropdown-menu-trailing">
                      <Check />
                    </SelectRadix.ItemIndicator>
                  </SelectItemPrimitive>
                );
              })}
            </ScrollArea>
          </SelectRadix.Viewport>
        </SelectContentPrimitive>
      </SelectRadix.Portal>
    </SelectPrimitive>
  );
};

export default Select;
