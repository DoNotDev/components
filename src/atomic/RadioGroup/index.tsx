// packages/components/src/atomic/RadioGroup/index.tsx

/**
 * @fileoverview RadioGroup Component - Props-based API
 * @description Accessible radio group component built on Radix UI primitives with semantic color variants.
 * Provides props-based API for 90% use cases with items prop.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva } from 'class-variance-authority';

import {
  RadioGroupPrimitive,
  RadioGroupRootPrimitive,
  RadioGroupItemPrimitive,
  RadioGroupIndicatorPrimitive,
} from './RadioGroupPrimitive';
import { CONTROL_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Grid from '../Grid';

import type { ReactNode } from 'react';
import type { RadioOption, RadioGroupRootProps } from './RadioGroupPrimitive';
import type { ControlVariant } from '../../utils/constants';
import type { GridCols } from '../Grid';

import './RadioGroup.css';

const radioGroupVariants = cva('dndev-radio-group dndev-control-group', {
  variants: {
    variant: {
      [CONTROL_VARIANT.DEFAULT]: '',
      [CONTROL_VARIANT.MUTED]: '',
      [CONTROL_VARIANT.PRIMARY]: '',
      [CONTROL_VARIANT.SECONDARY]: '',
      [CONTROL_VARIANT.ACCENT]: '',
      [CONTROL_VARIANT.SUCCESS]: '',
      [CONTROL_VARIANT.WARNING]: '',
      [CONTROL_VARIANT.DESTRUCTIVE]: '',
    },
  },
  defaultVariants: {
    variant: CONTROL_VARIANT.DEFAULT,
  },
});

/** Props for the RadioGroup component. */
export interface RadioGroupProps extends Omit<RadioGroupRootProps, 'children'> {
  /** Semantic color variant */
  variant?: ControlVariant;
  /** List of radio options (alternative to children) */
  items?: RadioOption[];
  /** Grid columns — same as Grid cols prop: number, responsive array, or template string */
  gridCols?: GridCols;
  /** Custom content to render (for power users) */
  children?: ReactNode;
}

/**
 * Accessible radio group component with semantic color variants.
 * Supports props-based API with items prop for 90% use cases.
 * When gridCols is provided, items are laid out using the Grid component.
 *
 * @component
 * @example
 * ```tsx
 * <RadioGroup
 *   value={value}
 *   onValueChange={handleChange}
 *   gridCols={[1, 1, 3, 3]}
 *   items={[
 *     { value: 'option1', label: 'Option 1' },
 *     { value: 'option2', label: 'Option 2' },
 *     { value: 'option3', label: 'Option 3' }
 *   ]}
 * />
 * ```
 * @param {RadioGroupProps} props - The props for the radio group
 * @returns {JSX.Element} The rendered radio group
 */
const RadioGroup = ({
  variant,
  className,
  items = [],
  gridCols,
  children,
  ...props
}: RadioGroupProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });

  const radioItems = (
    <>
      {children}
      {items.map((option) => (
        <label key={option.value}>
          <RadioGroupItemPrimitive
            value={option.value}
            className="dndev-control dndev-size-md"
            {...variantAttrs}
          >
            <RadioGroupIndicatorPrimitive />
          </RadioGroupItemPrimitive>
          <span>{option.label}</span>
        </label>
      ))}
    </>
  );

  return (
    <RadioGroupRootPrimitive
      className={cn(radioGroupVariants({ variant }), className)}
      {...variantAttrs}
      {...props}
    >
      {gridCols ? (
        <Grid cols={gridCols} gap="medium">
          {radioItems}
        </Grid>
      ) : (
        radioItems
      )}
    </RadioGroupRootPrimitive>
  );
};

export default RadioGroup;
export { CONTROL_VARIANT as RADIOGROUP_VARIANT };
export type { RadioOption, ControlVariant as RadioGroupVariant };
