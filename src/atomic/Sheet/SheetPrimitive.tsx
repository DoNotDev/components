// packages/components/src/atomic/Sheet/SheetPrimitive.tsx

/**
 * @fileoverview Sheet component
 * @description Accessible sheet (side panel) component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as SheetPrimitive from '@radix-ui/react-dialog';

import { cn } from '../../utils/helpers';

import type { ComponentProps, HTMLAttributes, Ref } from 'react';

const SheetPrimitiveRoot = SheetPrimitive.Root;
const SheetTriggerPrimitive = SheetPrimitive.Trigger;
const SheetClosePrimitive = SheetPrimitive.Close;
const SheetPortalPrimitive = SheetPrimitive.Portal;

const SheetOverlayPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay className={cn(className)} {...props} />
);

const SheetContentPrimitive = ({
  className,
  children,
  side,
  ref,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & {
  side?: 'top' | 'bottom' | 'left' | 'right';
  ref?: Ref<HTMLDivElement>;
}) => (
  <SheetPrimitive.Content
    ref={ref}
    className={cn(className)}
    data-side={side}
    {...props}
  >
    {children}
  </SheetPrimitive.Content>
);

const SheetHeaderPrimitive = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const SheetFooterPrimitive = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const SheetTitlePrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title className={cn(className)} {...props} />
);

const SheetDescriptionPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description className={cn(className)} {...props} />
);

export { SheetPrimitiveRoot as SheetPrimitive };
export {
  SheetPortalPrimitive,
  SheetOverlayPrimitive,
  SheetTriggerPrimitive,
  SheetClosePrimitive,
  SheetContentPrimitive,
  SheetHeaderPrimitive,
  SheetFooterPrimitive,
  SheetTitlePrimitive,
  SheetDescriptionPrimitive,
};
