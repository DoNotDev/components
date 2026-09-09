// packages/components/src/atomic/AlertDialog/index.tsx

/**
 * @fileoverview Alert Dialog component
 * @description Accessible alert dialog component built on Radix UI primitives. Provides a prop-based implementation to abstract Radix nesting.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import type { ReactNode, ComponentProps } from 'react';

import { cn } from '../../utils/helpers';
import Button from '../Button';
import VisuallyHidden from '../VisuallyHidden';
import {
  AlertDialogPrimitive,
  AlertDialogTriggerPrimitive,
  AlertDialogContentPrimitive as ContentPrimitive,
  AlertDialogHeaderPrimitive as HeaderPrimitive,
  AlertDialogFooterPrimitive as FooterPrimitive,
  AlertDialogTitlePrimitive as TitlePrimitive,
  AlertDialogDescriptionPrimitive as DescriptionPrimitive,
  AlertDialogActionPrimitive as ActionPrimitive,
  AlertDialogCancelPrimitive as CancelPrimitive,
  AlertDialogOverlayPrimitive as OverlayPrimitive,
  AlertDialogPortalPrimitive,
} from './AlertDialogPrimitive';

// Wrapper components that apply dndev-* classes
const AlertDialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof OverlayPrimitive>) => (
  <OverlayPrimitive
    className={cn('dndev-alert-dialog-overlay dndev-overlay', className)}
    {...props}
  />
);

const AlertDialogContent = ({
  className,
  ...props
}: ComponentProps<typeof ContentPrimitive>) => (
  <AlertDialogPortalPrimitive>
    <AlertDialogOverlay />
    <ContentPrimitive
      className={cn(
        'dndev-surface dndev-modal-content dndev-alert-dialog-content',
        className
      )}
      {...props}
    />
  </AlertDialogPortalPrimitive>
);

const AlertDialogHeader = ({
  className,
  ...props
}: ComponentProps<typeof HeaderPrimitive>) => (
  <HeaderPrimitive className={cn('dndev-modal-header', className)} {...props} />
);

const AlertDialogFooter = ({
  className,
  ...props
}: ComponentProps<typeof FooterPrimitive>) => (
  <FooterPrimitive className={cn('dndev-modal-footer', className)} {...props} />
);

const AlertDialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof TitlePrimitive>) => (
  <TitlePrimitive className={cn('dndev-modal-title', className)} {...props} />
);

const AlertDialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DescriptionPrimitive>) => (
  <DescriptionPrimitive
    className={cn('dndev-modal-description', className)}
    {...props}
  />
);

const AlertDialogAction = ActionPrimitive;
const AlertDialogCancel = CancelPrimitive;

/** Props for the AlertDialog component -- modal confirmation dialog that interrupts the user. */
export interface AlertDialogProps {
  /** The element that triggers the dialog to open */
  trigger?: ReactNode;
  /** The title of the alert dialog */
  title: ReactNode;
  /** The description content of the alert dialog */
  description?: ReactNode;
  /**
   * Text for the cancel button.
   * @default 'Cancel'
   */
  cancelLabel?: string;
  /** Text for the confirm button */
  confirmLabel: string;
  /** Callback when confirm action is taken */
  onConfirm?: () => void;
  /** Callback when cancel action is taken */
  onCancel?: () => void;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A modal dialog that interrupts the user with important content and expects a response.
 * Built on Radix UI AlertDialog.
 *
 * @component
 * @example
 * ```tsx
 * <AlertDialog
 *   trigger={<Button variant="destructive">Delete</Button>}
 *   title="Are you sure?"
 *   description="This action cannot be undone."
 *   confirmLabel="Delete"
 *   onConfirm={handleDelete}
 * />
 * ```
 * @param {AlertDialogProps} props - The props for the alert dialog
 * @returns {JSX.Element} The rendered alert dialog
 */
const AlertDialog = ({
  trigger,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  onConfirm,
  onCancel,
  open,
  onOpenChange,
}: AlertDialogProps) => {
  return (
    <AlertDialogPrimitive open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <AlertDialogTriggerPrimitive asChild>
          {trigger}
        </AlertDialogTriggerPrimitive>
      )}
      <AlertDialogContent className="dndev-surface">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : (
            <VisuallyHidden>
              <AlertDialogDescription>
                Alert dialog content
              </AlertDialogDescription>
            </VisuallyHidden>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={onCancel}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="accent" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
};

export default AlertDialog;
