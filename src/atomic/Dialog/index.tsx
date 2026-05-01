// packages/components/src/atomic/Dialog/index.tsx

/**
 * @fileoverview Dialog component
 * @description Accessible modal dialog component built on Radix UI primitives. Supports custom content sizes and actions.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { X } from 'lucide-react';
import { useRef } from 'react';

import {
  Dialog as Root,
  DialogTrigger as Trigger,
  DialogContent as ContentPrimitive,
  DialogHeader as HeaderPrimitive,
  DialogFooter as FooterPrimitive,
  DialogTitle as TitlePrimitive,
  DialogDescription as DescriptionPrimitive,
  DialogClose as Close,
  DialogOverlay as OverlayPrimitive,
  DialogPortal,
} from './DialogPrimitive';
import { useSwipeToClose } from '../../hooks';
import { SURFACE_VARIANT, type SurfaceVariant } from '../../utils/constants';
import { cn, getVariantDataAttrs } from '../../utils/helpers';
import Button, { BUTTON_VARIANT, type ButtonVariant } from '../Button';

import type { ReactNode, ComponentProps, RefObject } from 'react';

/** Preset content width for Dialog. Controls max-width of the dialog content area. */
export type ContentSize = 'auto' | 'form' | 'text' | 'image' | 'code' | 'full';

// Wrapper components that apply dndev-* classes
const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof OverlayPrimitive>) => (
  <OverlayPrimitive className={cn('dndev-overlay', className)} {...props} />
);

const DialogContent = ({
  className,
  children,
  noSwipe = false,
  closeButtonRef,
  onOpenChange,
  ...props
}: ComponentProps<typeof ContentPrimitive> & {
  noSwipe?: boolean;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useSwipeToClose({
      direction: 'down',
      closeButtonRef: closeButtonRef || undefined,
      onClose: onOpenChange ? () => onOpenChange(false) : undefined,
      enabled: !noSwipe,
    });

  return (
    <DialogPortal>
      <DialogOverlay />
      <ContentPrimitive
        ref={ref}
        className={cn('dndev-surface dndev-modal-content', className)}
        onPointerDown={noSwipe ? undefined : onPointerDown}
        onPointerMove={noSwipe ? undefined : onPointerMove}
        onPointerUp={noSwipe ? undefined : onPointerUp}
        onPointerCancel={noSwipe ? undefined : onPointerCancel}
        {...props}
      >
        {children}
      </ContentPrimitive>
    </DialogPortal>
  );
};

const DialogHeader = ({
  className,
  ...props
}: ComponentProps<typeof HeaderPrimitive>) => (
  <HeaderPrimitive className={cn('dndev-modal-header', className)} {...props} />
);

const DialogFooter = ({
  className,
  ...props
}: ComponentProps<typeof FooterPrimitive>) => (
  <FooterPrimitive className={cn('dndev-modal-footer', className)} {...props} />
);

const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof TitlePrimitive>) => (
  <TitlePrimitive className={cn('dndev-modal-title', className)} {...props} />
);

const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DescriptionPrimitive>) => (
  <DescriptionPrimitive
    className={cn('dndev-modal-description', className)}
    {...props}
  />
);

/** Props for the internal DialogContent wrapper. */
export type DialogContentProps = ComponentProps<typeof DialogContent>;

/** Props for the Dialog component -- modal overlay with header, body, and footer. */
export interface DialogProps extends Omit<
  DialogContentProps,
  'children' | 'title'
> {
  /** The element that opens the dialog */
  trigger?: ReactNode;
  /** The title of the dialog */
  title?: string | ReactNode;
  /** The description of the dialog */
  description?: string | ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Footer content */
  footer?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Whether to show the close button */
  showClose?: boolean;
  /** Visual variant of the dialog (uses surface variants: default, muted, primary, secondary, accent, success, warning, destructive) */
  variant?: SurfaceVariant;
  /** Whether to disable swipe-to-close functionality */
  noSwipe?: boolean;
  /** Shortcut prop to configure standard actions */
  actions?: {
    cancel?: {
      label: string;
      onClick?: () => void;
    };
    confirm?: {
      label: string;
      onClick?: () => void;
      variant?: ButtonVariant;
    };
  };
}

/**
 * Accessible modal dialog component built on Radix UI primitives.
 * Supports custom content sizes, actions, and variants.
 *
 * @component
 * @example
 * ```tsx
 * <Dialog
 *   trigger={<Button>Open</Button>}
 *   title="Edit Profile"
 *   description="Make changes to your profile here."
 *   actions={{
 *     cancel: { label: 'Cancel' },
 *     confirm: { label: 'Save', onClick: handleSave }
 *   }}
 * >
 *   <Input label="Name" />
 * </Dialog>
 * ```
 * @param {DialogProps} props - The props for the dialog
 * @returns {JSX.Element} The rendered dialog
 */
const Dialog = ({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
  variant,
  actions,
  showClose = true,
  className,
  noSwipe = false,
  ...contentProps
}: DialogProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const variantAttrs = getVariantDataAttrs({
    variant: variant !== SURFACE_VARIANT.DEFAULT ? variant : undefined,
  });

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Trigger asChild>{trigger}</Trigger>}
      <DialogContent
        className={className}
        noSwipe={noSwipe}
        closeButtonRef={closeButtonRef}
        onOpenChange={onOpenChange}
        {...variantAttrs}
        {...contentProps}
      >
        {title ? (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : (
              <DialogDescription className="dndev-sr-only">
                Dialog content
              </DialogDescription>
            )}
          </DialogHeader>
        ) : (
          <>
            <DialogTitle className="dndev-sr-only">Dialog</DialogTitle>
            {description ? (
              <DialogDescription>{description}</DialogDescription>
            ) : (
              <DialogDescription className="dndev-sr-only">
                Dialog content
              </DialogDescription>
            )}
          </>
        )}
        <div className="dndev-modal-body">{children}</div>
        {(footer || actions) && (
          <DialogFooter>
            {footer}
            {actions && (
              <>
                {actions.cancel && (
                  <Close asChild>
                    <Button
                      variant={BUTTON_VARIANT.OUTLINE}
                      onClick={actions.cancel.onClick}
                    >
                      {actions.cancel.label}
                    </Button>
                  </Close>
                )}
                {actions.confirm && (
                  <Button
                    variant={actions.confirm.variant || BUTTON_VARIANT.PRIMARY}
                    onClick={actions.confirm.onClick}
                  >
                    {actions.confirm.label}
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        )}
        {showClose && (
          <Close ref={closeButtonRef} asChild>
            <Button
              variant={BUTTON_VARIANT.GHOST}
              display="full"
              icon={X}
              className="dndev-modal-close"
              aria-label="Close"
            />
          </Close>
        )}
      </DialogContent>
    </Root>
  );
};

export default Dialog;
export { SURFACE_VARIANT as DIALOG_VARIANT } from '../../utils/constants';
export type { SurfaceVariant as DialogVariant } from '../../utils/constants';
