// packages/components/src/atomic/PinInput/index.tsx

/**
 * @fileoverview PinInput component
 * @description N-digit PIN / OTP input — N separate single-character
 *              boxes with auto-advance, backspace focus retreat, paste
 *              handling, and an optional onComplete callback.
 *
 * @version 0.1.0
 * @since 0.1.3
 * @author AMBROISE PARK Consulting
 */

import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '../../utils/helpers';
import { FloatingLabel } from '../Label';

import type { InputHTMLAttributes } from 'react';
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
  /** Called once when the user has entered the final digit. */
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
  /** Floating label rendered above the group. */
  label?: string;
  /** Whether the field is required - shows asterisk indicator */
  required?: boolean;
  /** Auto-focus the first box on mount. */
  autoFocus?: boolean;
  /**
   * Template for per-digit ARIA label. Receives 1-based index + length.
   * Default: `Digit {n} of {length}` — override to localize.
   */
  digitAriaLabel?: (index: number, length: number) => string;
  /**
   * Labels for the mask-reveal button (when `mask` is true and
   * `hideMaskToggle` is false). Default: `{ show: 'Show PIN', hide: 'Hide PIN' }`.
   */
  revealAriaLabel?: { show: string; hide: string };
}

/**
 * PinInput Component
 *
 * N-digit PIN / OTP input. Renders `length` single-character boxes with
 * auto-advance on entry, backspace focus retreat, SMS paste handling,
 * and an optional `onComplete` callback that fires when the user
 * enters the final digit.
 *
 * Opinionated: numeric by default (set `numericOnly={false}` for
 * alphanumeric OTPs), uses `autoComplete="one-time-code"` for iOS/Android
 * SMS autofill, respects RTL via logical CSS properties, and ships a
 * shake animation hook via `data-shake` on the container.
 *
 * @component
 * @version 0.1.0
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
 * @example 6-digit OTP with mask
 * ```tsx
 * <PinInput
 *   value={code}
 *   onChange={setCode}
 *   length={6}
 *   mask
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
  required,
  autoFocus,
  disabled,
  className,
  digitAriaLabel,
  revealAriaLabel,
  'aria-label': ariaLabel,
  ...rest
}: PinInputProps) => {
  const id = useId();
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [revealed, setRevealed] = useState(false);
  const effectiveMask = mask && !revealed;

  // Keep the refs array in sync with `length` changes
  if (refs.current.length !== length) {
    refs.current = Array.from({ length }, (_, i) => refs.current[i] ?? null);
  }

  // Auto-focus first box on mount if requested.
  useEffect(() => {
    if (autoFocus && !disabled) {
      refs.current[0]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the parent clears the value (e.g. after a bad PIN) refocus box 0.
  useEffect(() => {
    if (value.length === 0 && !disabled) {
      refs.current[0]?.focus();
    }
  }, [value, disabled]);

  const isValidChar = (ch: string): boolean => {
    if (!ch) return false;
    return numericOnly ? /^\d$/.test(ch) : /^[A-Za-z0-9]$/.test(ch);
  };

  const commit = (next: string): void => {
    const clamped = next.slice(0, length);
    onChange(clamped);
    if (clamped.length === length && onComplete) {
      onComplete(clamped);
    }
  };

  const setDigit = (index: number, raw: string): void => {
    // Handle SMS paste / autofill of the whole code in one box.
    if (raw.length > 1) {
      const filtered = Array.from(raw)
        .filter(isValidChar)
        .join('')
        .slice(0, length);
      if (filtered.length) {
        commit(filtered);
        const nextIdx = Math.min(filtered.length, length - 1);
        refs.current[nextIdx]?.focus();
      }
      return;
    }

    if (raw && !isValidChar(raw)) return;

    const chars = value.padEnd(length, ' ').split('');
    chars[index] = raw || ' ';
    const next = chars.join('').replace(/ /g, '').slice(0, length);
    commit(next);

    if (raw && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === 'Backspace') {
      const chars = value.split('');
      if (!chars[index] && index > 0) {
        event.preventDefault();
        refs.current[index - 1]?.focus();
        onChange(value.slice(0, index - 1));
      } else if (chars[index]) {
        event.preventDefault();
        onChange(value.slice(0, index));
      }
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const showToggle = mask && !hideMaskToggle;
  const toggleRevealed = (): void => setRevealed((r) => !r);

  const group = (
    <div
      className={cn('dndev-pin-input', className)}
      data-shake={shake ? 'true' : undefined}
      role="group"
      aria-label={ariaLabel ?? label ?? 'PIN input'}
    >
      {Array.from({ length }).map((_, index) => {
        const raw = value[index] ?? '';
        return (
          <input
            key={index}
            id={index === 0 ? id : undefined}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode={numericOnly ? 'numeric' : 'text'}
            pattern={numericOnly ? '[0-9]*' : undefined}
            maxLength={index === 0 ? length : 1}
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={raw}
            disabled={disabled}
            required={required && index === 0}
            aria-label={
              digitAriaLabel
                ? digitAriaLabel(index + 1, length)
                : `Digit ${index + 1} of ${length}`
            }
            className={cn(
              'dndev-input dndev-pin-input__box',
              effectiveMask && 'dndev-pin-input__box--masked'
            )}
            onChange={(event) => setDigit(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onFocus={(event) => {
              if (event.currentTarget.value) event.currentTarget.select();
            }}
            {...rest}
          />
        );
      })}
      {showToggle ? (
        <button
          type="button"
          className="dndev-pin-input__reveal"
          onClick={toggleRevealed}
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
    <FloatingLabel
      htmlFor={id}
      label={label}
      disabled={disabled}
      required={required}
    >
      {group}
    </FloatingLabel>
  );
};

export default PinInput;
