// packages/components/src/atomic/Dialog/DialogPrimitive.tsx

/**
 * @fileoverview Dialog Component
 * @description Accessible dialog component built on Radix UI primitives
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';

import { cn } from '../../utils/helpers';

import type { ComponentProps, HTMLAttributes, Ref } from 'react';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay className={cn(className)} {...props} />
);

const DialogContent = ({
  className,
  children,
  ref,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  ref?: Ref<HTMLDivElement>;
}) => (
  <DialogPrimitive.Content ref={ref} className={cn(className)} {...props}>
    {children}
  </DialogPrimitive.Content>
);

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div data-dialog-header className={cn(className)} {...props} />
);

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title className={cn(className)} {...props} />
);

const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description className={cn(className)} {...props} />
);

export { Dialog as DialogPrimitive };
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
