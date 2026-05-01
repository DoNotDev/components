// packages/components/src/atomic/ToggleGroup/index.tsx

/**
 * @fileoverview Toggle Group Component - Props-based API
 * @description Toggle group component with variant support. Built on Radix UI Toggle Group primitives.
 * Provides props-based API for 90% use cases with items prop.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';

import {
  ToggleGroupPrimitive,
  ToggleGroupItemPrimitive,
  type ToggleGroupPrimitiveProps,
} from './ToggleGroupPrimitive';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import type { ReactNode } from 'react';

const toggleGroupVariants = cva('', {
  variants: {
    variant: {
      default: '',
      outline: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

/** Single option within a ToggleGroup. */
export interface ToggleOption {
  value: string;
  label: string | ReactNode;
  disabled?: boolean;
}

/** Props for the ToggleGroup component -- group of mutually exclusive toggles. */
export type ToggleGroupProps = ToggleGroupPrimitiveProps & {
  variant?: VariantProps<typeof toggleGroupVariants>['variant'];
  size?: VariantProps<typeof toggleGroupVariants>['size'];
  /** List of toggle options (alternative to children) */
  items?: ToggleOption[];
};

/**
 * Toggle group component with variant support.
 * Supports props-based API with items prop for 90% use cases.
 *
 * @component
 * @example
 * ```tsx
 * <ToggleGroup
 *   type="single"
 *   value={value}
 *   onValueChange={handleChange}
 *   items={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' }
 *   ]}
 * />
 * ```
 * @param {ToggleGroupProps} props - The props for the toggle group
 * @returns {JSX.Element} The rendered toggle group
 */
const ToggleGroup = ({
  className,
  variant,
  size,
  items = [],
  children,
  ...props
}: ToggleGroupProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });
  const sizeAttrs = size ? { 'data-size': size } : {};

  return (
    <ToggleGroupPrimitive
      className={cn(toggleGroupVariants({ variant, size }), className)}
      {...variantAttrs}
      {...sizeAttrs}
      {...props}
    >
      {children}
      {items.length > 0 &&
        items.map((option) => (
          <ToggleGroupItemPrimitive
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className="dndev-interactive"
            {...variantAttrs}
            {...sizeAttrs}
          >
            {option.label}
          </ToggleGroupItemPrimitive>
        ))}
    </ToggleGroupPrimitive>
  );
};

/**
 * ToggleGroupItem component for power users who want to use children API.
 * For 90% use cases, use ToggleGroup with items prop instead.
 */
const ToggleGroupItem = ToggleGroupItemPrimitive;

export default ToggleGroup;
export { ToggleGroupItem };
