'use client';
// packages/components/src/atomic/ActionButton/index.tsx

// packages/components/src/atomic/ActionButton/index.tsx

/**
 * @fileoverview ActionButton Component
 * @description Defensive button component for async actions with loading state and optional confirmation.
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { useState } from 'react';

import AlertDialog from '../AlertDialog';
import Button from '../Button';
import Spinner from '../Spinner';
import { useAction } from './useAction';

import type { ButtonProps } from '../Button';
import type { ReactNode } from 'react';

/** Props for the ActionButton component -- async-aware button with loading state and optional confirmation dialog. */
export interface ActionButtonProps<T = unknown> extends Omit<
  ButtonProps,
  'onClick' | 'onError'
> {
  /** The async action to execute when clicked */
  action: () => Promise<T>;
  /** Callback on successful completion */
  onSuccess?: (result: T) => void;
  /** Callback on action error (not to be confused with native onError event) */
  onActionError?: (error: Error) => void;
  /** Text to show while loading (replaces children) */
  loadingText?: string;
  /** If provided, shows a confirmation dialog before executing */
  confirmText?: string;
  /** Title for the confirmation dialog */
  confirmTitle?: string;
  /** Additional disabled condition */
  disabled?: boolean;
  /** Button content */
  children: ReactNode;
}

/**
 * Defensive button component for async actions.
 *
 * Features:
 * - Auto-disables while loading
 * - Shows spinner + loadingText during action
 * - Optional confirmation dialog
 * - aria-busy for accessibility
 *
 * @example
 * ```tsx
 * <ActionButton
 *   action={() => api.deleteItem(id)}
 *   loadingText="Deleting..."
 *   confirmText="Are you sure you want to delete this item?"
 *   confirmTitle="Delete Item"
 *   onSuccess={() => refetch()}
 *   variant="destructive"
 * >
 *   Delete
 * </ActionButton>
 * ```
 */
function ActionButton<T = unknown>({
  action,
  onSuccess,
  onActionError,
  loadingText,
  confirmText,
  confirmTitle = 'Confirm',
  disabled = false,
  children,
  ...buttonProps
}: ActionButtonProps<T>) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { execute, loading } = useAction({
    action,
    onSuccess,
    onError: onActionError,
  });

  const isDisabled = disabled || loading;

  const handleClick = async () => {
    if (isDisabled) return;

    if (confirmText) {
      setConfirmOpen(true);
    } else {
      await execute();
    }
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    await execute();
  };

  const handleCancel = () => {
    setConfirmOpen(false);
  };

  const buttonContent = loading ? (
    <>
      <Spinner />
      {loadingText || children}
    </>
  ) : (
    children
  );

  return (
    <>
      <Button
        {...buttonProps}
        onClick={handleClick}
        disabled={isDisabled}
        aria-busy={loading}
      >
        {buttonContent}
      </Button>

      {confirmText && (
        <AlertDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={confirmTitle}
          description={confirmText}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

export default ActionButton;
export { useAction } from './useAction';
export type { UseActionOptions, UseActionResult } from './useAction';
