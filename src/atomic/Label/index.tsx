// packages/components/src/atomic/Label/index.tsx

/**
 * @fileoverview Label component
 * @description Accessible label component with icon support
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ComponentType, ReactNode } from 'react';

import { FloatingLabel, type FloatingLabelProps } from './FloatingLabel';
import { LabelPrimitive, type LabelPrimitiveProps } from './LabelPrimitive';
import { cn } from '../../utils/helpers';

/** Props for the Label component. */
export interface LabelProps extends LabelPrimitiveProps {
  /** Optional icon to display with the label */
  icon?: ComponentType<{ className?: string }>;
  /**
   * Whether to place icon at end (after text). RTL-safe.
   * @default false
   */
  iconEnd?: boolean;
  /**
   * Whether to remove interactive styling (cursor, hover effects).
   * Use for non-interactive labels like feature lists.
   * @default false
   */
  plain?: boolean;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
  children?: ReactNode;
}

/**
 * Accessible label component built on Radix UI Label.
 * Supports icons and various label positions.
 *
 * @component
 * @example
 * ```tsx
 * <Label htmlFor="email" icon={Mail}>Email Address</Label>
 * ```
 * @param {LabelProps} props - The props for the label
 * @returns {JSX.Element} The rendered label
 */
const Label = ({
  className,
  icon: Icon,
  iconEnd = false,
  plain = false,
  required = false,
  children,
  ...props
}: LabelProps) => {
  const iconElement = Icon ? (
    <Icon
      className="dndev-label-icon"
      data-position={iconEnd ? 'trailing' : 'leading'}
    />
  ) : null;

  return (
    <LabelPrimitive
      className={cn('dndev-text-base dndev-label-base', className)}
      data-plain={plain ? 'true' : undefined}
      {...props}
    >
      {!iconEnd && iconElement}
      {children}
      {required && ' *'}
      {iconEnd && iconElement}
    </LabelPrimitive>
  );
};

export default Label;
export { FloatingLabel, type FloatingLabelProps };
