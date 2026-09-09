// packages/components/src/atomic/Switch/SwitchPrimitive.tsx

/**
 * @fileoverview Switch Primitive
 * @description Low-level Radix UI switch wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SwitchPrimitives from '@radix-ui/react-switch';
import type { ComponentProps } from 'react';

import { cn } from '../../utils/helpers';

import './Switch.css';

export interface SwitchPrimitiveProps extends ComponentProps<
  typeof SwitchPrimitives.Root
> {}

/**
 * Accessible switch control built on Radix UI Switch.
 *
 * @component
 * @example
 * ```tsx
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 * ```
 * @param {SwitchPrimitiveProps} props - The props for the switch
 * @returns {JSX.Element} The rendered switch
 */
const SwitchPrimitiveComponent = ({
  className,
  ...props
}: SwitchPrimitiveProps) => {
  return (
    <SwitchPrimitives.Root className={cn(className)} {...props}>
      <SwitchPrimitives.Thumb />
    </SwitchPrimitives.Root>
  );
};

export { SwitchPrimitiveComponent as SwitchPrimitive };
