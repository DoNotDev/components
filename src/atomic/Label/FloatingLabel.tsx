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

import { FieldInfo } from './FieldInfo';

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
  /** Help text: an (i) after the label shows it on hover, focus or tap */
  info?: string;
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
 * <FloatingLabel label="URL" htmlFor="slug" info="Address of the page: /routines/oily-skin">
 *   <input id="slug" />
 * </FloatingLabel>
 * ```
 */
export function FloatingLabel({
  htmlFor,
  label,
  disabled = false,
  truncate = true,
  required = false,
  info,
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
        data-info={info ? 'true' : undefined}
      >
        <label htmlFor={htmlFor}>
          {label}
          {required && ' *'}
        </label>
        {/* In the legend, outside the label: not part of the input's name, and the
            first legend of a disabled fieldset stays enabled */}
        {info && <FieldInfo text={info} />}
      </legend>
      {children}
    </fieldset>
  );
}

export default FloatingLabel;
