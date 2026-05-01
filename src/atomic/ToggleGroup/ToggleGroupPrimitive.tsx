// packages/components/src/atomic/ToggleGroup/ToggleGroupPrimitive.tsx

/**
 * @fileoverview ToggleGroup Primitive
 * @description Low-level Radix UI toggle group wrapper, internal use only
 * Primitives only apply theme classes - no variants, no CVA
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { createContext, use } from 'react';

import { cn } from '../../utils/helpers';

import type { ComponentProps } from 'react';

/**
 * Toggle group context for sharing data attributes (passed from component layer)
 */
type ToggleGroupContextValue = {
  'data-variant'?: string;
  'data-size'?: string;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export type ToggleGroupPrimitiveProps = ComponentProps<
  typeof ToggleGroupPrimitive.Root
> & {
  'data-variant'?: string;
  'data-size'?: string;
};

/**
 * Toggle group primitive component - theme only, no variants
 */
function ToggleGroupPrimitiveComponent({
  className,
  children,
  'data-variant': dataVariant,
  'data-size': dataSize,
  ...props
}: ToggleGroupPrimitiveProps) {
  return (
    <ToggleGroupPrimitive.Root
      className={cn('dndev-toggle-group', className)}
      data-variant={dataVariant}
      data-size={dataSize}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{
          'data-variant': dataVariant,
          'data-size': dataSize,
        }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export interface ToggleGroupItemPrimitiveProps extends ComponentProps<
  typeof ToggleGroupPrimitive.Item
> {
  'data-variant'?: string;
  'data-size'?: string;
}

/**
 * Toggle group item primitive component - theme only, no variants
 * Radix automatically sets data-state attribute based on selection
 */
function ToggleGroupItemPrimitive({
  className,
  children,
  'data-variant': dataVariant,
  'data-size': dataSize,
  ...props
}: ToggleGroupItemPrimitiveProps) {
  const context = use(ToggleGroupContext);
  const variantAttr = context?.['data-variant'] || dataVariant;
  const sizeAttr = context?.['data-size'] || dataSize;

  return (
    <ToggleGroupPrimitive.Item
      className={cn('dndev-interactive', className)}
      data-variant={variantAttr}
      data-size={sizeAttr}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroupPrimitiveComponent as ToggleGroupPrimitive };
export { ToggleGroupItemPrimitive };
