// packages/components/src/atomic/Slider/SliderPrimitive.tsx

/**
 * @fileoverview Slider Primitive
 * @description Low-level Radix UI slider wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

/**
 * Props for the Slider component.
 * Extends Radix UI Slider Root props.
 */
export interface SliderPrimitiveProps extends ComponentProps<
  typeof SliderPrimitive.Root
> {}

/**
 * Accessible slider component built on Radix UI Slider.
 *
 * Radix handles controlled/uncontrolled pattern:
 * - Controlled: pass `value` prop
 * - Uncontrolled: pass `defaultValue` prop
 *
 * @component
 * @example
 * ```tsx
 * // Uncontrolled
 * <Slider defaultValue={[50]} max={100} step={1} />
 *
 * // Controlled
 * <Slider value={value} onValueChange={setValue} max={100} />
 * ```
 * @param {SliderPrimitiveProps} props - The props for the slider
 * @returns {JSX.Element} The rendered slider
 */
const SliderPrimitiveComponent = ({
  className,
  ...props
}: SliderPrimitiveProps) => {
  return (
    <SliderPrimitive.Root className={cn(className)} {...props}>
      <SliderPrimitive.Track className="dndev-slider-track">
        <SliderPrimitive.Range className="dndev-slider-range" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="dndev-slider-thumb" />
    </SliderPrimitive.Root>
  );
};

export { SliderPrimitiveComponent as SliderPrimitive };
