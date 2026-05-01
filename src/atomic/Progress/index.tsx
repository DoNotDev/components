// packages/components/src/atomic/Progress/index.tsx

/**
 * @fileoverview Progress component
 * @description Accessible progress component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import {
  ProgressPrimitive,
  type ProgressPrimitiveProps,
} from './ProgressPrimitive';
import { cn } from '../../utils/helpers';

const Progress = ({ className, ...props }: ProgressPrimitiveProps) => (
  <ProgressPrimitive className={cn('dndev-progress', className)} {...props} />
);

export default Progress;
export { ProgressPrimitive };
export type { ProgressPrimitiveProps as ProgressProps };
