// packages/components/src/atomic/Toaster/ToastPrimitive.tsx

/**
 * @fileoverview Toast component
 * @description Accessible toast notification component built on Radix UI primitives
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import type { ComponentProps, ReactElement } from 'react';

import type { ToastType } from './Toast.types';
import { cn, getVariantDataAttrs } from '../../utils/helpers';

const ToastProvider = ToastPrimitives.Provider;

function ToastViewport({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Viewport>) {
  return (
    <ToastPrimitives.Viewport
      className={cn('dndev-toast-viewport', className)}
      {...props}
    />
  );
}

const toastVariants = cva('dndev-notification', {
  variants: {
    variant: {
      default: '',
      error: '',
      success: '',
      warning: '',
      info: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ToastProps
  extends
    ComponentProps<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {
  toastType?: ToastType;
}

type ToastActionElement = ReactElement<typeof ToastAction>;

function Toast({ className, variant, toastType, ...props }: ToastProps) {
  // Map toast type to variant
  const getVariant = () => {
    if (variant) return variant;
    switch (toastType) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const finalVariant = getVariant();
  const variantAttrs = getVariantDataAttrs({ variant: finalVariant });

  return (
    <ToastPrimitives.Root
      role="status"
      className={cn(toastVariants({ variant: finalVariant }), className)}
      {...variantAttrs}
      {...props}
    />
  );
}

function ToastAction({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Action>) {
  return (
    <ToastPrimitives.Action
      className={cn(className)}
      data-role="toast-action"
      {...props}
    />
  );
}

function ToastClose({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Close>) {
  return (
    <ToastPrimitives.Close
      className={cn('dndev-toast-close', className)}
      toast-close=""
      {...props}
    >
      <X className="dndev-size-md" />
    </ToastPrimitives.Close>
  );
}

function ToastTitle({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Title>) {
  return (
    <ToastPrimitives.Title
      className={cn('dndev-toast-title', className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Description>) {
  return (
    <ToastPrimitives.Description
      className={cn('dndev-toast-description', className)}
      {...props}
    />
  );
}

export { Toast as ToastPrimitive };
export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
