// packages/components/src/atomic/VisuallyHidden/index.tsx

/**
 * @fileoverview VisuallyHidden component
 * @description Visually hidden component for accessibility (screen reader only)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ComponentProps } from 'react';

import { VisuallyHiddenPrimitive } from './VisuallyHiddenPrimitive';

/** Props for the VisuallyHidden component -- screen reader-only content. */
export type VisuallyHiddenProps = ComponentProps<
  typeof VisuallyHiddenPrimitive
>;

const VisuallyHidden = (props: VisuallyHiddenProps) => (
  <VisuallyHiddenPrimitive {...props} />
);

export default VisuallyHidden;
