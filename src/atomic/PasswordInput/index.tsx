// packages/components/src/atomic/PasswordInput/index.tsx

/**
 * @fileoverview PasswordInput component
 * @description Password input with show/hide toggle functionality
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { Eye, EyeOff } from 'lucide-react';
import { useState, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '../../utils/helpers';
import { FloatingLabel } from '../Label';

import './PasswordInput.css';

/** Props for the PasswordInput component -- input with show/hide toggle. */
export interface PasswordInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  /** Whether the password is currently visible */
  visible?: boolean;
  /** Callback when visibility changes */
  onVisibilityChange?: (visible: boolean) => void;
  /** Label for floating label - always shown small at top-left when provided */
  label?: string;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
}

/**
 * PasswordInput Component
 *
 * A password input field with show/hide toggle functionality.
 * Features industry-standard UX patterns:
 * - Eye icon toggle (show/hide password) - ALWAYS at end, cannot be overridden
 * - Smooth icon transitions
 * - Mobile-friendly touch targets
 * - Screen reader support
 * - ARIA labels and descriptions
 *
 * Opinionated: Eye icon is ALWAYS positioned at end with inline styles.
 * If you need different behavior, create your own component.
 *
 * @component
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 * @example
 * ```tsx
 * <PasswordInput
 *   value={password}
 *   onChange={setPassword}
 *   placeholder="Enter password"
 * />
 * ```
 * @param {PasswordInputProps} props - The props for the password input
 * @returns {JSX.Element} The rendered password input
 */
const PasswordInput = ({
  className,
  visible: controlledVisible,
  onVisibilityChange,
  label,
  value,
  onFocus,
  onBlur,
  required,
  ...props
}: PasswordInputProps) => {
  const id = useId();
  const [internalVisible, setInternalVisible] = useState(false);

  // Use controlled or internal state
  const isVisible =
    controlledVisible !== undefined ? controlledVisible : internalVisible;

  const hasLabel = !!label;

  const toggleVisibility = () => {
    const newVisible = !isVisible;
    if (controlledVisible === undefined) {
      setInternalVisible(newVisible);
    }
    onVisibilityChange?.(newVisible);
  };

  const inputContent = (
    <div className="dndev-relative">
      <input
        id={id}
        type={isVisible ? 'text' : 'password'}
        value={value}
        className={cn(
          'dndev-input',
          'dndev-password-input-with-toggle',
          className
        )}
        data-bare={hasLabel || undefined}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        {...props}
      />

      {/* Eye icon toggle - ALWAYS at end */}
      <button
        type="button"
        className="dndev-password-toggle-button"
        onClick={toggleVisibility}
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        aria-describedby={props['aria-describedby']}
        tabIndex={-1}
      >
        {isVisible ? (
          <EyeOff className="dndev-size-md dndev-password-toggle-icon" />
        ) : (
          <Eye className="dndev-size-md dndev-password-toggle-icon" />
        )}
      </button>
    </div>
  );

  if (!hasLabel) {
    return inputContent;
  }

  return (
    <FloatingLabel
      htmlFor={id}
      label={label}
      disabled={props.disabled}
      required={required}
    >
      {inputContent}
    </FloatingLabel>
  );
};

export default PasswordInput;
