// packages/components/src/atomic/RadioGroup/RadioGroupPrimitive.tsx

/**
 * @fileoverview RadioGroup Primitive
 * @description Low-level Radix UI radio group wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixRadioGroup from '@radix-ui/react-radio-group';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

/**
 * Radio option configuration
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */
/** Single option within a RadioGroup. */
export interface RadioOption {
  value: string;
  label: string;
}

const RadioGroupRootPrimitive = RadixRadioGroup.Root;

const RadioGroupItemPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixRadioGroup.Item>) => (
  <RadixRadioGroup.Item
    className={cn(className)}
    data-type="radio"
    {...props}
  />
);

const RadioGroupIndicatorPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixRadioGroup.Indicator>) => (
  <RadixRadioGroup.Indicator className={cn(className)} {...props} />
);

export { RadioGroupRootPrimitive as RadioGroupPrimitive };
export {
  RadioGroupRootPrimitive,
  RadioGroupItemPrimitive,
  RadioGroupIndicatorPrimitive,
};

export type RadioGroupRootProps = ComponentProps<typeof RadixRadioGroup.Root>;
export type RadioGroupItemProps = ComponentProps<typeof RadixRadioGroup.Item>;
export type RadioGroupIndicatorProps = ComponentProps<
  typeof RadixRadioGroup.Indicator
>;
