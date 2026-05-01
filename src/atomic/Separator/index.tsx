// packages/components/src/atomic/Separator/index.tsx

/**
 * @fileoverview Separator component
 * @description Accessible separator component with semantic styling
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { SeparatorPrimitive } from './SeparatorPrimitive';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import type { ComponentProps } from 'react';
import './Separator.css';

/**
 * Separator variant constants - DRY single source of truth
 * Used for separator styling via data-variant attribute
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
export const SEPARATOR_VARIANT = {
  DEFAULT: 'default',
  PRIMARY: 'primary',
  ACCENT: 'accent',
  MUTED: 'muted',
} as const;

/** Props for the Separator component. */
export interface SeparatorProps extends ComponentProps<
  typeof SeparatorPrimitive
> {
  /**
   * Visual style variant.
   * @default 'default'
   */
  variant?: (typeof SEPARATOR_VARIANT)[keyof typeof SEPARATOR_VARIANT];
}

/**
 * Accessible separator component with semantic styling.
 * Used to visually separate content in a list or group.
 *
 * DEFAULT WIDTH: 80% for horizontal separators (intentional design choice)
 * - Provides visual breathing room and hierarchy
 * - Works for 99% of use cases
 * - For edge cases needing different width, use className with utility classes
 *
 * @component
 * @example
 * ```tsx
 * // Standard usage (80% width)
 * <Separator orientation="horizontal" />
 *
 * // Vertical separator
 * <Separator orientation="vertical" className="h-10" />
 *
 * // Custom width (edge case - use className)
 * <Separator className="w-full" />
 * ```
 * @param {SeparatorProps} props - The props for the separator
 * @returns {JSX.Element} The rendered separator
 */
const Separator = ({
  className,
  orientation = 'horizontal',
  decorative = true,
  variant = SEPARATOR_VARIANT.DEFAULT,
  style,
  ...props
}: SeparatorProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });

  return (
    <SeparatorPrimitive
      decorative={decorative}
      orientation={orientation}
      className={cn(className)}
      {...variantAttrs}
      style={style}
      {...props}
    />
  );
};

export default Separator;
