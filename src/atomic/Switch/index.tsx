// packages/components/src/atomic/Switch/index.tsx

/**
 * @fileoverview Switch component
 * @description Accessible switch component built on Radix UI primitives with semantic color variants.
 * Supports optional labels for binary choices (e.g., Manual/Automatic).
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { SwitchPrimitive } from './SwitchPrimitive';
import { CONTROL_VARIANT } from '../../utils/constants';
import type { ControlVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import './Switch.css';

/** Props for the Switch component. */
export interface SwitchProps extends ComponentProps<
  typeof SwitchPrimitives.Root
> {
  /** Semantic color variant */
  variant?: ControlVariant;
  /** Label for unchecked state (e.g., "Manual") */
  uncheckedLabel?: string;
  /** Label for checked state (e.g., "Automatic") */
  checkedLabel?: string;
}

const switchVariants = cva('dndev-switch', {
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
 * Accessible switch control with semantic color variants.
 * Supports optional labels for binary choices with automatic active/inactive styling.
 *
 * @component
 * @example
 * ```tsx
 * // Simple switch without labels
 * <Switch checked={enabled} onCheckedChange={setEnabled} variant="success" />
 *
 * // Switch with labels (Manual/Automatic)
 * <Switch
 *   checked={isAutomatic}
 *   onCheckedChange={setIsAutomatic}
 *   uncheckedLabel="Manual"
 *   checkedLabel="Automatic"
 *   variant="muted"
 * />
 * ```
 * @param {SwitchProps} props - The props for the switch
 * @returns {JSX.Element} The rendered switch
 */
const Switch = ({
  className,
  variant,
  uncheckedLabel,
  checkedLabel,
  checked,
  ...props
}: SwitchProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });
  const hasLabels = uncheckedLabel || checkedLabel;

  const switchElement = (
    <SwitchPrimitives.Root
      className={cn(switchVariants({ variant }), className)}
      {...variantAttrs}
      checked={checked}
      {...props}
    >
      <SwitchPrimitives.Thumb className={cn('dndev-switch-thumb')} />
    </SwitchPrimitives.Root>
  );

  // If no labels, return just the switch
  if (!hasLabels) {
    return switchElement;
  }

  // With labels: render [uncheckedLabel] [Switch] [checkedLabel]
  // Add data-checked attribute to container for CSS styling
  const isChecked = checked ?? false;
  return (
    <div
      className="dndev-switch-with-labels"
      data-checked={isChecked ? 'true' : 'false'}
    >
      {uncheckedLabel && (
        <span className="dndev-switch-label dndev-switch-label-unchecked">
          {uncheckedLabel}
        </span>
      )}
      {switchElement}
      {checkedLabel && (
        <span className="dndev-switch-label dndev-switch-label-checked">
          {checkedLabel}
        </span>
      )}
    </div>
  );
};

export default Switch;
export { SwitchPrimitive, CONTROL_VARIANT as SWITCH_VARIANT };
export type { ControlVariant as SwitchVariant };
