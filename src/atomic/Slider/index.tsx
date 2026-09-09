// packages/components/src/atomic/Slider/index.tsx

/**
 * @fileoverview Slider component
 * @description Accessible slider component built on Radix UI primitives with semantic color variants.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SliderRadix from '@radix-ui/react-slider';
import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { SliderPrimitive } from './SliderPrimitive';
import { CONTROL_VARIANT } from '../../utils/constants';
import type { ControlVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import './Slider.css';

/** Props for the Slider component. */
export interface SliderProps extends ComponentProps<typeof SliderRadix.Root> {
  /** Semantic color variant */
  variant?: ControlVariant;
  /** Show current value */
  showValue?: boolean;
}

const sliderVariants = cva('dndev-slider', {
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

/**
 * Accessible slider control with semantic color variants.
 * Supports smooth animations and full range control.
 *
 * @component
 * @example
 * ```tsx
 * <Slider defaultValue={[50]} max={100} step={1} variant="success" />
 * <Slider value={value} onValueChange={setValue} min={0} max={5} step={1} showValue />
 * ```
 * @param {SliderProps} props - The props for the slider
 * @returns {JSX.Element} The rendered slider
 */
const Slider = ({
  className,
  variant,
  showValue,
  value,
  defaultValue,
  ...props
}: SliderProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });
  const currentValue = value ?? defaultValue;
  // Handle array values (for range sliders) or single values
  const values = Array.isArray(currentValue)
    ? currentValue
    : currentValue !== undefined
      ? [currentValue]
      : [];

  return (
    <div className="dndev-slider-container">
      <SliderRadix.Root
        className={cn(sliderVariants({ variant }), className)}
        value={value}
        defaultValue={defaultValue}
        {...variantAttrs}
        {...props}
      >
        <SliderRadix.Track className={cn('dndev-slider-track')}>
          <SliderRadix.Range className={cn('dndev-slider-range')} />
        </SliderRadix.Track>
        {values.map((val, index) => (
          <SliderRadix.Thumb key={index} className={cn('dndev-slider-thumb')}>
            {showValue && val !== undefined && (
              <span className="dndev-slider-value">{val}</span>
            )}
          </SliderRadix.Thumb>
        ))}
      </SliderRadix.Root>
    </div>
  );
};

export default Slider;
export { SliderPrimitive, CONTROL_VARIANT as SLIDER_VARIANT };
export type { ControlVariant as SliderVariant };
