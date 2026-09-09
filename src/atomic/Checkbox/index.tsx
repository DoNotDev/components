// packages/components/src/atomic/Checkbox/index.tsx

/**
 * @fileoverview Checkbox component
 * @description Accessible checkbox control built on Radix UI primitives with semantic color variants.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva } from 'class-variance-authority';
import { useId, type ReactNode } from 'react';

import {
  CheckboxPrimitive,
  type CheckboxProps as CheckboxPrimitiveProps,
} from './CheckboxPrimitive';
import { CONTROL_VARIANT, type ControlVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Label from '../Label';
import Stack from '../Stack';

import './Checkbox.css';

/** Props for the Checkbox component. */
export interface CheckboxProps extends CheckboxPrimitiveProps {
  /** Semantic color variant */
  variant?: ControlVariant;
  /** Optional label text - automatically composes with Label component */
  label?: ReactNode;
  /** Whether the label should show required indicator */
  required?: boolean;
}

const checkboxVariants = cva('dndev-control', {
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
 * Accessible checkbox control with semantic color variants.
 * Supports smooth animations and full state management.
 * Optionally accepts a label prop for convenience (automatically composes with Label).
 *
 * @component
 * @example
 * ```tsx
 * // Simple checkbox without label
 * <Checkbox checked={agreed} onCheckedChange={setAgreed} variant="success" />
 *
 * // Checkbox with label (convenience prop)
 * <Checkbox
 *   checked={consent}
 *   onCheckedChange={setConsent}
 *   label="I agree to the terms"
 *   required
 * />
 * ```
 * @param {CheckboxProps} props - The props for the checkbox
 * @returns {JSX.Element} The rendered checkbox
 */
const Checkbox = ({
  className,
  variant,
  label,
  required,
  id,
  ...props
}: CheckboxProps) => {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  const variantAttrs = getVariantDataAttrs({ variant });

  const checkboxElement = (
    <CheckboxPrimitive
      className={cn(checkboxVariants({ variant }), className)}
      id={checkboxId}
      {...variantAttrs}
      {...props}
    />
  );

  if (label) {
    return (
      <Stack direction="row" align="center" gap="tight">
        {checkboxElement}
        <Label htmlFor={checkboxId} required={required}>
          {label}
        </Label>
      </Stack>
    );
  }

  return checkboxElement;
};

export default Checkbox;
export { CheckboxPrimitive, CONTROL_VARIANT as CHECKBOX_VARIANT };
