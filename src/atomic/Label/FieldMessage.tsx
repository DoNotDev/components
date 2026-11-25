// packages/components/src/atomic/Label/FieldMessage.tsx

/**
 * @fileoverview FieldMessage component
 * @description The one message slot under a form control: helper text, or the
 * validation error in its place. Every framework field (crud entity forms, auth email
 * forms, the ui `Form` pieces) renders it; `fieldMessageAria` wires the control to it.
 *
 * Behaviour (sources):
 * - One slot, the error replaces the helper text in it (IBM Carbon text input: helper
 *   text "appears persistently underneath the field, except when an error or warning
 *   message replaces it", https://carbondesignsystem.com/components/text-input/usage/).
 *   A field with helper text never moves; a field without one gets the line only when
 *   an error appears (no blank line reserved under every field).
 * - Announced: the error goes into a live region that is in the DOM from the first
 *   render (WCAG technique ARIA19: "The error container must be present in the DOM on
 *   page load for the error message to be spoken by most screen readers",
 *   https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19). `polite`, as the W3C forms
 *   tutorial's while-typing feedback (https://www.w3.org/WAI/tutorials/forms/notifications/):
 *   entity forms re-validate on every change once a field is touched, an assertive
 *   region would interrupt typing.
 * - Icon + text, not colour alone (WCAG 1.4.1 Use of Color).
 * - Wiring: the control takes `aria-invalid` while in error and `aria-describedby` to
 *   the slot while it has content (WCAG technique ARIA21, aria-invalid; ARIA1,
 *   aria-describedby).
 *
 * @version 0.1.0
 * @since 0.3.7
 * @author AMBROISE PARK Consulting
 */

import './Label.css';

import type { ReactNode } from 'react';

import { CircleAlert } from 'lucide-react';

import { cn } from '../../utils/helpers';
import Icon from '../Icons/Icon';

/** What the slot shows: nothing, the helper text, or the error. */
export type FieldMessageState = 'empty' | 'helper' | 'error';

/** Props for {@link FieldMessage}. */
export interface FieldMessageProps {
  /** Id of the slot: the control's `aria-describedby` (see {@link fieldMessageAria}) */
  id: string;
  /** Validation error (translated). Set: shown in place of `helperText`, with an icon */
  error?: string;
  /** Helper text under the control while there is no error */
  helperText?: ReactNode;
  className?: string;
}

/** Input of {@link fieldMessageAria}. */
export interface FieldMessageAriaOptions {
  /** Id of the {@link FieldMessage} slot */
  id: string;
  /** The error passed to the slot */
  error?: string;
  /** The helper text passed to the slot */
  helperText?: ReactNode;
  /** Other ids describing the control (a character count), kept after the slot's */
  describedBy?: string;
}

/** ARIA attributes {@link fieldMessageAria} returns for the control. */
export interface FieldMessageAria {
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/**
 * What the slot shows for an error / helper text pair.
 *
 * @param error - The validation error
 * @param helperText - The helper text
 * @returns `'error'`, `'helper'` or `'empty'`
 */
export function fieldMessageState(
  error: string | undefined,
  helperText: ReactNode
): FieldMessageState {
  if (error) return 'error';
  if (helperText !== undefined && helperText !== null && helperText !== '')
    return 'helper';
  return 'empty';
}

/**
 * ARIA attributes of the control a {@link FieldMessage} describes: `aria-invalid`
 * while in error, `aria-describedby` to the slot while it shows something (plus
 * `describedBy`). Spread them on the focusable control.
 *
 * @param options - FieldMessageAriaOptions
 * @returns The attributes (absent ones are left out)
 *
 * @example
 * ```tsx
 * <Input id={inputId} {...fieldMessageAria({ id: messageId, error })} />
 * <FieldMessage id={messageId} error={error} />
 * ```
 */
export function fieldMessageAria({
  id,
  error,
  helperText,
  describedBy,
}: FieldMessageAriaOptions): FieldMessageAria {
  const shown = fieldMessageState(error, helperText) !== 'empty';
  const ids = [shown ? id : undefined, describedBy].filter(Boolean).join(' ');
  return {
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(ids ? { 'aria-describedby': ids } : {}),
  };
}

/**
 * Message slot under a form control. Shows `helperText`, or `error` in its place
 * (icon + text, `--destructive`). Always mounted: empty, it is visually hidden
 * (`dndev-sr-only`: no space, no gap), not unmounted; the error is written into its
 * live region (`aria-live="polite"`, mounted from the first render), so screen readers
 * announce it when it appears or changes. Wire the control with {@link fieldMessageAria}.
 *
 * @component
 * @example
 * ```tsx
 * const messageId = useId();
 * <Input label="Email" {...fieldMessageAria({ id: messageId, error, helperText })} />
 * <FieldMessage id={messageId} error={error} helperText={helperText} />
 * ```
 * @param props - FieldMessageProps
 * @returns The slot
 */
export function FieldMessage({
  id,
  error,
  helperText,
  className,
}: FieldMessageProps) {
  const state = fieldMessageState(error, helperText);
  return (
    <span
      id={id}
      className={cn(
        'dndev-field-message',
        state === 'empty' && 'dndev-sr-only',
        className
      )}
      data-state={state}
    >
      {state === 'helper' && helperText}
      <span
        className="dndev-field-message-live"
        aria-live="polite"
        aria-atomic="true"
      >
        {state === 'error' && (
          <>
            <Icon
              icon={CircleAlert}
              className="dndev-field-message-icon"
              ariaHidden={true}
            />
            {error}
          </>
        )}
      </span>
    </span>
  );
}

export default FieldMessage;
