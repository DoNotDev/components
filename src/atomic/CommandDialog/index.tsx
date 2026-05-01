// packages/components/src/atomic/CommandDialog/index.tsx

/**
 * @fileoverview CommandDialog Component
 * @description Minimal command palette dialog optimized for Cmd+K navigation
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { createContext, useContext, useRef } from 'react';

import { useSwipeToClose } from '../../hooks';
import { cn } from '../../utils/helpers';
import Button, { BUTTON_VARIANT } from '../Button';

import type { ReactNode } from 'react';

/** Context for CommandDialog to pass onClose to children without cloneElement */
const CommandDialogContext = createContext<{ onClose?: () => void }>({});

/** Hook for Command to access dialog's onClose */
export const useCommandDialogClose = () =>
  useContext(CommandDialogContext).onClose;

/** Props for the CommandDialog component -- dialog wrapper for Command palette. */
export interface CommandDialogProps {
  /** The element that triggers the dialog to open */
  trigger?: ReactNode;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** The title of the dialog */
  title?: string | ReactNode;
  /** The description of the dialog */
  description?: string | ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Footer content */
  footer?: ReactNode | null;
  /** Additional CSS classes */
  className?: string;
  /** Whether to disable swipe-to-close functionality */
  noSwipe?: boolean;
}

const CommandDialog = ({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  noSwipe = false,
}: CommandDialogProps) => {
  const handleClose = () => {
    onOpenChange?.(false);
  };

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { ref, onPointerDown, onPointerMove, onPointerUp, onPointerCancel } =
    useSwipeToClose({
      direction: 'down',
      closeButtonRef: closeButtonRef,
      onClose: () => onOpenChange?.(false),
      enabled: !noSwipe,
    });

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      )}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="dndev-overlay" />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'dndev-surface dndev-command-dialog-content',
            className
          )}
          onPointerDown={noSwipe ? undefined : onPointerDown}
          onPointerMove={noSwipe ? undefined : onPointerMove}
          onPointerUp={noSwipe ? undefined : onPointerUp}
          onPointerCancel={noSwipe ? undefined : onPointerCancel}
        >
          {title ? (
            <div className="dndev-command-dialog-header">
              <DialogPrimitive.Title className="dndev-command-dialog-title">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="dndev-sr-only">
                  {description}
                </DialogPrimitive.Description>
              )}
              <DialogPrimitive.Close ref={closeButtonRef} asChild>
                <Button
                  variant={BUTTON_VARIANT.GHOST}
                  display="full"
                  icon={X}
                  onClick={handleClose}
                  aria-label="Close"
                  className="dndev-command-dialog-close"
                />
              </DialogPrimitive.Close>
            </div>
          ) : (
            <>
              <DialogPrimitive.Title className="dndev-sr-only">
                Command Palette
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="dndev-sr-only">
                Search and navigate using keyboard shortcuts
              </DialogPrimitive.Description>
            </>
          )}
          <CommandDialogContext.Provider
            value={{ onClose: title ? handleClose : undefined }}
          >
            {children}
          </CommandDialogContext.Provider>
          {footer}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default CommandDialog;
