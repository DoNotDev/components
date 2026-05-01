// packages/components/src/atomic/Portal/PortalPrimitive.tsx

/**
 * @fileoverview Portal Primitive
 * @description Low-level Radix UI portal wrapper, internal use only
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as PortalPrimitive from '@radix-ui/react-portal';

import type { ComponentProps } from 'react';

export interface PortalPrimitiveProps extends ComponentProps<
  typeof PortalPrimitive.Root
> {
  className?: string;
}

/**
 * Low-level Radix UI portal wrapper.
 * Renders content into a different part of the DOM (usually document.body).
 *
 * @component
 * @param {PortalPrimitiveProps} props - The props for the portal
 * @returns {JSX.Element} The rendered portal
 */
const PortalPrimitiveComponent = ({
  className,
  children,
  ...props
}: PortalPrimitiveProps) => (
  <PortalPrimitive.Root {...props}>{children}</PortalPrimitive.Root>
);

export { PortalPrimitiveComponent as PortalPrimitive };
