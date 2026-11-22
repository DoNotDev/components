'use client';
// packages/components/src/atomic/PinInput/index.tsx

/**
 * @fileoverview PinInput component
 * @description N-character PIN / OTP input: one real input under N visual slots.
 *
 * @version 0.2.0
 * @since 0.1.3
 * @author AMBROISE PARK Consulting
 */

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { InputHTMLAttributes, Ref } from 'react';

import { cn } from '../../utils/helpers';
import Label, { FieldInfo } from '../Label';

import './PinInput.css';

/** Props for the PinInput component -- N-digit PIN / OTP input. */
export interface PinInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'maxLength' | 'pattern' | 'inputMode'
> {
  /** Controlled PIN value (0..length chars). */
  value: string;
  /** Called on every change. Receives the full current PIN (may be shorter than length). */
  onChange: (next: string) => void;
  /** Called when the PIN reaches `length` characters (once per distinct complete PIN). */
  onComplete?: (value: string) => void;
  /**
   * Number of digits. Typical values: 4 (PIN), 6 (OTP), 8 (recovery code).
   * @default 4
   */
  length?: number;
  /**
   * Whether to render digits as dots (•) instead of the typed character.
   * When true, a trailing eye toggle button lets the user reveal the digits
   * (same UX as `PasswordInput`). @default true
   */
  mask?: boolean;
  /**
   * Hide the eye toggle button even when `mask` is true (use when the caller
   * wants a mask-only, never-revealable PIN — rare). @default false
   */
  hideMaskToggle?: boolean;
  /** Shake animation trigger — flip to `true` to shake on error. */
  shake?: boolean;
  /** Restrict input to digits only. Set false for alphanumeric OTPs. @default true */
  numericOnly?: boolean;
  /** Label rendered above the slots (names the input). */
  label?: string;
  /** Help text: an (i) after the label shows it on hover, focus or tap. Needs `label`. */
  info?: string;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
  /** Focus the input on mount, and again when it is re-enabled. */
  autoFocus?: boolean;
  /**
   * No effect, kept for compatibility: the PIN is one input, announced as a
   * whole through `label` / `aria-label`; the slots are visual only.
   */
  digitAriaLabel?: (index: number, length: number) => string;
  /**
   * Labels for the mask-reveal button (when `mask` is true and
   * `hideMaskToggle` is false). Default: `{ show: 'Show PIN', hide: 'Hide PIN' }`.
   */
  revealAriaLabel?: { show: string; hide: string };
  /** The underlying input (React 19 ref prop), e.g. to focus it again after an action */
  ref?: Ref<HTMLInputElement>;
}

/**
 * PinInput Component
 *
 * N-character PIN / OTP input, built like `input-otp`: ONE real `<input>`
 * stretched transparently over `length` visual slots. Typing, paste anywhere,
 * Backspace / Delete, selection, arrows, Home / End, IME and OS one-time-code
 * autofill are the browser's own input behaviour; the component only filters
 * the value to valid characters, clamps it to `length`, draws the slots
 * (character, `•` when masked, a caret on the active slot) and calls
 * `onComplete` when the PIN is full. A paste holding `length` or more valid
 * characters replaces the whole PIN; a shorter one is inserted at the caret.
 * Clicking a filled slot selects that character so the next keystroke replaces
 * it; the active slot follows the input's selection (click, select, keyup, focus).
 *
 * Numeric by default (`numericOnly={false}` for alphanumeric codes),
 * `autoComplete="one-time-code"`, slots shrink to fit narrow containers,
 * SSR-safe (no browser access during render). When the parent clears `value`,
 * the input is refocused at the start. Rest props go to the input.
 *
 * @component
 * @version 0.2.0
 * @since 0.1.3
 * @author AMBROISE PARK Consulting
 * @example Basic 4-digit PIN
 * ```tsx
 * <PinInput
 *   value={pin}
 *   onChange={setPin}
 *   onComplete={(p) => login(p)}
 *   autoFocus
 * />
 * ```
 * @example 6-digit OTP, visible
 * ```tsx
 * <PinInput
 *   value={code}
 *   onChange={setCode}
 *   length={6}
 *   mask={false}
 *   label="Verification code"
 * />
 * ```
 * @param {PinInputProps} props - The props for the PIN input
 * @returns {JSX.Element} The rendered PIN input
 */
const PinInput = ({
  value,
  onChange,
  onComplete,
  length = 4,
  mask = true,
  hideMaskToggle = false,
  shake = false,
  numericOnly = true,
  label,
  info,
  required,
  autoFocus,
  disabled,
  className,
  digitAriaLabel: _digitAriaLabel,
  revealAriaLabel,
  'aria-label': ariaLabel,
  onClick,
  onPaste,
  onSelect,
  onKeyUp,
  onFocus,
  ref: externalRef,
  ...rest
}: PinInputProps) => {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const prevValue = useRef(value);
  const [caret, setCaret] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (autoFocus && !disabled) ref.current?.focus();
  }, [autoFocus, disabled]);

  // The parent cleared the PIN (e.g. wrong code): back to the first slot.
  useEffect(() => {
    if (value === '' && prevValue.current !== '' && !disabled) {
      ref.current?.focus();
      ref.current?.setSelectionRange(0, 0);
      setCaret(0);
    }
    prevValue.current = value;
  }, [value, disabled]);

  const invalid = numericOnly ? /\D/g : /[^A-Za-z0-9]/g;

  const commit = (raw: string): void => {
    const next = raw.replace(invalid, '').slice(0, length);
    if (next === value) return;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  const setRefs = (el: HTMLInputElement | null): void => {
    ref.current = el;
    if (typeof externalRef === 'function') externalRef(el);
    else if (externalRef) externalRef.current = el;
  };

  /** The active slot follows the input's real selection. */
  const syncCaret = (el: HTMLInputElement): void =>
    setCaret(el.selectionStart ?? 0);

  const active = Math.min(caret, length - 1);
  const showToggle = mask && !hideMaskToggle;

  const group = (
    <div
      className={cn('dndev-pin-input', className)}
      data-shake={shake ? 'true' : undefined}
    >
      <div className="dndev-pin-input__slots">
        {Array.from({ length }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="dndev-pin-input__slot"
            data-active={index === active ? 'true' : undefined}
            data-caret={
              index === active && index === value.length ? 'true' : undefined
            }
          >
            {value[index] && (mask && !revealed ? '•' : value[index])}
          </div>
        ))}
        <input
          {...rest}
          ref={setRefs}
          id={id}
          type="text"
          inputMode={numericOnly ? 'numeric' : 'text'}
          pattern={numericOnly ? '\\d*' : '[A-Za-z0-9]*'}
          maxLength={length}
          autoComplete="one-time-code"
          spellCheck={false}
          value={value}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel ?? (label ? undefined : 'PIN input')}
          className="dndev-pin-input__field"
          onChange={(event) => commit(event.target.value)}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented) return;
            event.preventDefault();
            const el = event.currentTarget;
            const text = event.clipboardData.getData('text');
            // A whole code replaces the PIN, wherever the caret is.
            if (text.replace(invalid, '').length >= length) {
              commit(text);
              return;
            }
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? start;
            commit(value.slice(0, start) + text + value.slice(end));
          }}
          onSelect={(event) => {
            onSelect?.(event);
            syncCaret(event.currentTarget);
          }}
          onKeyUp={(event) => {
            onKeyUp?.(event);
            syncCaret(event.currentTarget);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            syncCaret(event.currentTarget);
          }}
          onClick={(event) => {
            onClick?.(event);
            // Caret to the clicked slot; a filled slot is selected (typing replaces it).
            const el = event.currentTarget;
            const box = el.getBoundingClientRect();
            if (box.width) {
              const slot = Math.floor(((event.clientX - box.left) / box.width) * length);
              const at = Math.max(0, Math.min(slot, value.length));
              el.setSelectionRange(at, at < value.length ? at + 1 : at);
            }
            syncCaret(el);
          }}
        />
      </div>
      {showToggle ? (
        <button
          type="button"
          className="dndev-pin-input__reveal"
          onClick={() => setRevealed((r) => !r)}
          aria-label={
            revealed
              ? (revealAriaLabel?.hide ?? 'Hide PIN')
              : (revealAriaLabel?.show ?? 'Show PIN')
          }
          aria-pressed={revealed}
          tabIndex={-1}
        >
          {revealed ? (
            <EyeOff className="dndev-size-md" />
          ) : (
            <Eye className="dndev-size-md" />
          )}
        </button>
      ) : null}
    </div>
  );

  if (!label) return group;

  return (
    <div className="dndev-pin-input-field" data-disabled={disabled ? 'true' : undefined}>
      <div className="dndev-pin-input-field__label">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        {info && <FieldInfo text={info} />}
      </div>
      {group}
    </div>
  );
};

export default PinInput;
