// packages/components/src/atomic/Input/index.tsx

/**
 * @fileoverview Input component
 * @description Accessible input component with mobile-friendly touch targets, icon support, and floating labels
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useId } from 'react';
import type { InputHTMLAttributes, Ref } from 'react';

import type { IconType } from '../../types';
import { cn } from '../../utils/helpers';
import Icon from '../Icons/Icon';
import { FloatingLabel } from '../Label';
import './Input.css';

/** Props for the Input component. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional icon to display inside the input */
  icon?: IconType;
  /**
   * Whether to place icon at end (after text). RTL-safe.
   * @default false
   */
  iconEnd?: boolean;
  /** Label for floating label - always shown small at top-left when provided */
  label?: string;
  /**
   * Bare mode - no border/shadow (for use inside FloatingLabel or custom wrappers).
   * Auto-enabled when `label` is provided.
   */
  bare?: boolean;
  /** React 19 native ref support */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Accessible input component with mobile-friendly touch targets.
 * Supports leading or trailing icons with automatic padding adjustment.
 * Automatic floating labels when label is provided.
 *
 * React 19: ref is a native prop, no forwardRef needed.
 *
 * @component
 * @example
 * ```tsx
 * <Input type="email" placeholder="Enter your email" />
 * <Input icon={Search} placeholder="Search..." />
 * <Input icon={Search} iconEnd placeholder="Search..." /> // Icon after text
 * <Input label="Email" placeholder="Enter your email" /> // Floating label
 * ```
 * @param {InputProps} props - The props for the input
 * @returns {JSX.Element} The rendered input
 */
const Input = ({
  className,
  type,
  icon,
  iconEnd = false,
  label,
  bare,
  value,
  onFocus,
  onBlur,
  required,
  id: idProp,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hasIcon = !!icon;
  const isLeading = !iconEnd;
  const isTrailing = iconEnd;
  const hasLabel = !!label;
  // Auto-bare when label is provided (FloatingLabel provides border)
  const isBare = bare || hasLabel;

  const inputClasses = cn(
    'dndev-input',
    hasIcon && isLeading && 'dndev-input-with-leading-icon',
    hasIcon && isTrailing && 'dndev-input-with-trailing-icon',
    className
  );

  // Explicitly exclude children to prevent void element error (input is a void element)
  // If we have a label, extract style to pass to FloatingLabel wrapper instead of input
  const { children: _children, style, ...inputProps } = props;

  const inputElement = (
    <input
      id={id}
      type={type}
      value={value}
      required={required}
      autoComplete="one-time-code"
      className={inputClasses}
      data-bare={isBare || undefined}
      {...inputProps}
      // Only apply style to input if there's no label (label wrapper gets it)
      style={hasLabel ? undefined : style}
    />
  );

  const needsWrapper = hasIcon || hasLabel;

  // Build input with optional icon wrapper
  const inputWithIcon = hasIcon ? (
    <div className="dndev-relative">
      {inputElement}
      <div
        className={cn(
          'dndev-input-icon',
          isLeading && 'dndev-input-icon-leading',
          isTrailing && 'dndev-input-icon-trailing'
        )}
      >
        <Icon icon={icon} className="dndev-size-md" ariaHidden={true} />
      </div>
    </div>
  ) : (
    inputElement
  );

  if (!needsWrapper) {
    return inputElement;
  }

  // With label: use FloatingLabel wrapper (fieldset/legend)
  if (hasLabel) {
    return (
      <FloatingLabel
        htmlFor={id}
        label={label}
        disabled={props.disabled}
        required={required}
        style={style}
      >
        {inputWithIcon}
      </FloatingLabel>
    );
  }

  // Icon only, no label
  return inputWithIcon;
};

export default Input;
