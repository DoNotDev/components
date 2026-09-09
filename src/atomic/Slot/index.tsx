// packages/components/src/atomic/Slot/index.tsx

/**
 * @fileoverview Slot component
 * @description Radix Slot wrapper for asChild pattern
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ComponentProps } from 'react';

import { SlotPrimitive } from './SlotPrimitive';
import { cn } from '../../utils/helpers';

/** Props for the Slot component -- Radix Slot for asChild pattern. */
export type SlotProps = ComponentProps<typeof SlotPrimitive>;

/**
 * Radix Slot wrapper for asChild pattern.
 * Merges props and renders as child component.
 *
 * React 19: ref is a native prop, no forwardRef needed.
 *
 * @component
 * @example
 * ```tsx
 * <Slot>
 *   <Link href="/home">Home</Link>
 * </Slot>
 * ```
 * @param {SlotProps} props - The props for the slot
 * @returns {JSX.Element} The rendered slot
 */
const Slot = ({ className, ...props }: SlotProps) => (
  <SlotPrimitive className={cn(className)} {...props} />
);

export default Slot;
