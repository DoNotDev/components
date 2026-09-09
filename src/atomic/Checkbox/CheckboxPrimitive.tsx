// packages/components/src/atomic/Checkbox/CheckboxPrimitive.tsx

/**
 * @fileoverview Checkbox Primitive
 * @description Low-level Radix UI checkbox wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as CheckboxPrimitives from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

/**
 * Props for the Checkbox component.
 * Extends Radix UI Checkbox Root props.
 */
export interface CheckboxProps extends ComponentProps<
  typeof CheckboxPrimitives.Root
> {}

/**
 * Low-level Radix UI checkbox wrapper.
 *
 * @component
 * @example
 * ```tsx
 * <Checkbox checked={isChecked} onCheckedChange={setChecked} />
 * ```
 * @param {CheckboxProps} props - The props for the checkbox
 * @returns {JSX.Element} The rendered checkbox
 */
const CheckboxPrimitive = ({ className, ...props }: CheckboxProps) => (
  <CheckboxPrimitives.Root
    className={cn('peer', className)}
    data-type="checkbox"
    {...props}
  >
    <CheckboxPrimitives.Indicator>
      <Check />
    </CheckboxPrimitives.Indicator>
  </CheckboxPrimitives.Root>
);

export { CheckboxPrimitive };
