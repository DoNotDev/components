// packages/components/src/atomic/Toggle/index.tsx

/**
 * @fileoverview Toggle component
 * @description Accessible toggle component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { cva, type VariantProps } from 'class-variance-authority';

import { TogglePrimitive } from './TogglePrimitive';
import { THEME_VARIANT } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

import type { ComponentPropsWithoutRef } from 'react';

const toggleVariants = cva('dndev-interactive', {
  variants: {
    variant: {
      [THEME_VARIANT.DEFAULT]: '',
      [THEME_VARIANT.MUTED]: '',
      [THEME_VARIANT.PRIMARY]: '',
      [THEME_VARIANT.SECONDARY]: '',
      [THEME_VARIANT.ACCENT]: '',
      [THEME_VARIANT.SUCCESS]: '',
      [THEME_VARIANT.WARNING]: '',
      [THEME_VARIANT.DESTRUCTIVE]: '',
      outline: '',
    },
  },
  defaultVariants: {
    variant: THEME_VARIANT.DEFAULT,
  },
});

/** Props for the Toggle component -- single toggle button with pressed state. */
export interface ToggleProps
  extends
    ComponentPropsWithoutRef<typeof TogglePrimitive>,
    VariantProps<typeof toggleVariants> {}

/**
 * React 19: ref is a native prop, no forwardRef needed.
 */
const Toggle = ({ className, variant, ...props }: ToggleProps) => {
  const variantAttrs = getVariantDataAttrs({ variant });

  return (
    <TogglePrimitive
      className={cn(toggleVariants({ variant }), className)}
      {...variantAttrs}
      {...props}
    />
  );
};

export default Toggle;
export { toggleVariants };
