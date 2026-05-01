// packages/components/src/atomic/AlertDialog/AlertDialogPrimitive.tsx

/**
 * @fileoverview Alert Dialog Component
 * @description Accessible alert dialog component built on Radix UI primitives. Provides modal dialogs for critical confirmations and alerts.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';

import { cn } from '../../utils/helpers';

import type { ComponentProps, HTMLAttributes } from 'react';

const AlertDialogPrimitive = RadixAlertDialog.Root;
const AlertDialogTriggerPrimitive = RadixAlertDialog.Trigger;
const AlertDialogPortalPrimitive = RadixAlertDialog.Portal;

const AlertDialogOverlayPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Overlay>) => (
  <RadixAlertDialog.Overlay className={cn(className)} {...props} />
);

const AlertDialogContentPrimitive = ({
  className,
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Content> & {
  onCloseAutoFocus?: (event: Event) => void;
}) => (
  <RadixAlertDialog.Content
    onCloseAutoFocus={onCloseAutoFocus}
    className={cn(className)}
    {...props}
  />
);

const AlertDialogHeaderPrimitive = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const AlertDialogFooterPrimitive = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn(className)} {...props} />
);

const AlertDialogTitlePrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Title>) => (
  <RadixAlertDialog.Title className={cn(className)} {...props} />
);

const AlertDialogDescriptionPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Description>) => (
  <RadixAlertDialog.Description className={cn(className)} {...props} />
);

const AlertDialogActionPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Action>) => (
  <RadixAlertDialog.Action className={cn(className)} {...props} />
);

const AlertDialogCancelPrimitive = ({
  className,
  ...props
}: ComponentProps<typeof RadixAlertDialog.Cancel>) => (
  <RadixAlertDialog.Cancel className={cn(className)} {...props} />
);

export { AlertDialogPrimitive };
export {
  AlertDialogPortalPrimitive,
  AlertDialogOverlayPrimitive,
  AlertDialogTriggerPrimitive,
  AlertDialogContentPrimitive,
  AlertDialogHeaderPrimitive,
  AlertDialogFooterPrimitive,
  AlertDialogTitlePrimitive,
  AlertDialogDescriptionPrimitive,
  AlertDialogActionPrimitive,
  AlertDialogCancelPrimitive,
};
