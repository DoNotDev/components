// packages/components/src/atomic/Label/FloatingLabel.tsx

/**
 * @fileoverview FloatingLabel component
 * @description Fieldset/legend wrapper for native border-cutting floating labels.
 * Uses semantic HTML - browser natively cuts border where legend sits.
 * No background color hacks needed.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import './Label.css';

import type { ReactNode } from 'react';

/** Props for the FloatingLabel component -- fieldset/legend wrapper for native border-cutting labels. */
export interface FloatingLabelProps {
  /** HTML id to associate legend with input (for accessibility) */
  htmlFor?: string;
  /** Label text - REQUIRED */
  label: ReactNode;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to truncate long labels with ellipsis */
  truncate?: boolean;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
  /** Children (the input element) - REQUIRED */
  children: ReactNode;
  /** Additional className for the fieldset */
  className?: string;
  /** Inline styles for the fieldset */
  style?: React.CSSProperties;
}

/**
 * FloatingLabel - Fieldset/legend wrapper for floating labels
 *
 * Uses semantic HTML to achieve the "label on border" effect without
 * background color hacks. Works on any background color.
 *
 * @component
 * @example
 * ```tsx
 * <FloatingLabel label="Email Address" htmlFor="email" required>
 *   <input id="email" type="email" />
 * </FloatingLabel>
 * ```
 */
export function FloatingLabel({
  htmlFor,
  label,
  disabled = false,
  truncate = true,
  required = false,
  children,
  className,
  style,
}: FloatingLabelProps) {
  return (
    <fieldset
      className={`dndev-floating-fieldset ${className || ''}`}
      disabled={disabled}
      data-disabled={disabled ? 'true' : undefined}
      style={style}
    >
      <legend
        className="dndev-floating-legend"
        data-truncate={truncate ? undefined : 'false'}
      >
        <label htmlFor={htmlFor}>
          {label}
          {required && ' *'}
        </label>
      </legend>
      {children}
    </fieldset>
  );
}

export default FloatingLabel;
