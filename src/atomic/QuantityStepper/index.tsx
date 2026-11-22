'use client';
// packages/components/src/atomic/QuantityStepper/index.tsx

/**
 * @fileoverview QuantityStepper component
 * @description Cart quantity control: [ − qty + ] in one outlined field.
 *
 * @version 0.1.0
 * @since 0.1.50
 * @author AMBROISE PARK Consulting
 */

import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, MouseEvent, PointerEvent } from 'react';
import { Minus, Plus } from 'lucide-react';

import { cn } from '../../utils/helpers';
import { moveQuantity, normalizeQuantity, quantityRules } from './quantity';

import './QuantityStepper.css';

/** Press-and-hold: delay before the first repeat, then the repeat interval (halved after 5 repeats, quartered after 15). */
const HOLD_DELAY_MS = 400;
const HOLD_REPEAT_MS = 150;

/** Props for the QuantityStepper component -- [ − qty + ] quantity control. */
export interface QuantityStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'onChange'> {
  /** Controlled quantity. Zero may be used as the initial, not-yet-added value. */
  value: number;
  /** Enables native text editing; receives validated quantities on commit, not on each keystroke. Takes precedence over legacy callbacks. */
  onChange?: (value: number) => void;
  /** First positive quantity (safe integer). @default 1 */
  min?: number;
  /** Lot size (positive safe integer); valid quantities are min + k * step. @default 1 */
  step?: number;
  /** Stock limit; rounded down to the last complete lot. */
  max?: number;
  /** Allows committing zero, in addition to positive lots. @default false */
  allowZero?: boolean;
  /** Shows only a square + at zero (inline end), reserving the block size; expanding animates the inline size. @default false */
  collapseWhenZero?: boolean;
  /** Stack the controls: plus, quantity, minus (also DOM and tab order). @default false */
  vertical?: boolean;
  /** Called by −. Omit to disable − (at the minimum). */
  onDecrement?: () => void;
  /** Called by +. Omit to disable + (stock or limit reached). */
  onIncrement?: () => void;
  /** Makes the quantity itself clickable (e.g. open the cart). Omit for plain text. */
  onValueClick?: () => void;
  /** Disables the whole control (e.g. while saving) */
  disabled?: boolean;
  /**
   * Stretch to the container width (cards, mobile)
   * @default false
   */
  fullWidth?: boolean;
  /** Accessible name of the group, e.g. "Quantity of Toner" */
  'aria-label': string;
  /** Accessible name of − */
  decrementLabel: string;
  /** Accessible name of + */
  incrementLabel: string;
  /** Accessible name of the clickable quantity (with `onValueClick`) */
  valueLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/** Restore both visual and accessible state after a commit, cancellation, or parent update. */
function restoreEditor(input: HTMLInputElement | null, value: number) {
  if (!input) return;
  input.value = String(value);
  input.setAttribute('aria-valuenow', String(value));
  input.removeAttribute('aria-invalid');
}

/**
 * Quantity control in the e-commerce standard form: one outlined field, borderless
 * − / + buttons, the quantity centred with tabular figures. Stateless: the caller owns
 * the value. Legacy mode uses direction callbacks; additive onChange mode owns lot
 * normalization and offers an uncontrolled text spinbutton committed on blur/Enter.
 * onChange takes precedence over the legacy direction and value-click callbacks.
 *
 * @component
 * @example
 * ```tsx
 * <QuantityStepper
 *   value={qty}
 *   onDecrement={qty > 1 ? () => setQty(qty - 1) : undefined}
 *   onIncrement={() => setQty(qty + 1)}
 *   aria-label="Quantity"
 *   decrementLabel="Remove one"
 *   incrementLabel="Add one"
 * />
 * ```
 */
const QuantityStepper = ({
  value,
  onDecrement,
  onIncrement,
  onValueClick,
  onChange,
  min = 1,
  step = 1,
  max,
  allowZero = false,
  collapseWhenZero = false,
  vertical = false,
  disabled = false,
  fullWidth = false,
  decrementLabel,
  incrementLabel,
  valueLabel,
  className,
  onBlur,
  ...props
}: QuantityStepperProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const collapsed = collapseWhenZero && value === 0;
  const rules = onChange ? quantityRules(min, step, max, allowZero) : undefined;

  if (rules && (!Number.isSafeInteger(value) || value < 0 || (value !== 0 && (value < rules.min || value > rules.max || (value - rules.min) % rules.step !== 0)))) {
    throw new RangeError('QuantityStepper value must be zero or a complete lot within its bounds.');
  }

  useEffect(() => {
    restoreEditor(inputRef.current, value);
  }, [value, min, step, max, allowZero, onChange !== undefined]);

  useEffect(() => {
    const group = groupRef.current;
    const active = group?.ownerDocument.activeElement;
    if (collapsed && active && group?.contains(active) && active !== plusRef.current) {
      plusRef.current?.focus();
    }
  }, [collapsed]);

  // Press-and-hold repeat. Editable mode steps a DOM draft and commits once on release
  // (one parent update, not one save per tick); legacy mode calls its callback per tick.
  const hold = useRef<{ timer: ReturnType<typeof setTimeout>; draft: number; ticks: number } | null>(null);
  const suppressClick = useRef(false);
  const legacy = useRef({ onIncrement, onDecrement });
  legacy.current = { onIncrement, onDecrement };

  useEffect(() => {
    if (disabled && hold.current) {
      clearTimeout(hold.current.timer);
      hold.current = null;
    }
  }, [disabled]);
  useEffect(() => () => {
    if (hold.current) clearTimeout(hold.current.timer);
  }, []);

  const change = (next: number) => {
    restoreEditor(inputRef.current, value);
    if (!disabled && next !== value) onChange?.(next);
  };
  const commit = (input: HTMLInputElement) => {
    if (!rules || disabled || collapsed || input.value === String(value)) return;
    const next = normalizeQuantity(input.value, rules);
    restoreEditor(input, value);
    if (next !== undefined) change(next);
  };
  // Cancel pointer focus until click has consumed the draft. Focusing the button
  // afterwards closes a touch keyboard without ever focusing the editor on tap.
  const prepareStep = (event: PointerEvent<HTMLButtonElement>) => {
    if (rules && event.button === 0 && !event.currentTarget.disabled) event.preventDefault();
  };
  const draftBase = () => {
    const draft = inputRef.current?.value;
    return !rules || draft === undefined || draft === String(value) ? value : normalizeQuantity(draft, rules) ?? value;
  };
  const stepQuantity = (direction: -1 | 1) => {
    if (!rules || disabled) return;
    change(moveQuantity(draftBase(), direction, 1, rules));
  };
  const startHold = (direction: -1 | 1, event: PointerEvent<HTMLButtonElement>) => {
    prepareStep(event);
    if (event.button !== 0 || event.currentTarget.disabled || disabled) return;
    if (hold.current) clearTimeout(hold.current.timer);
    suppressClick.current = false;
    const tick = () => {
      const state = hold.current;
      if (!state) return;
      if (rules) {
        const next = moveQuantity(state.draft, direction, 1, rules);
        if (next === state.draft) return; // bound reached: wait for release
        state.draft = next;
        restoreEditor(inputRef.current, next);
        groupRef.current?.removeAttribute('data-collapsed');
      } else {
        const callback = direction === 1 ? legacy.current.onIncrement : legacy.current.onDecrement;
        if (!callback) return;
        callback();
      }
      suppressClick.current = true;
      state.ticks += 1;
      state.timer = setTimeout(tick, state.ticks < 5 ? HOLD_REPEAT_MS : state.ticks < 15 ? HOLD_REPEAT_MS / 2 : HOLD_REPEAT_MS / 4);
    };
    hold.current = { timer: setTimeout(tick, HOLD_DELAY_MS), draft: draftBase(), ticks: 0 };
  };
  const endHold = () => {
    const state = hold.current;
    if (!state) return;
    clearTimeout(state.timer);
    hold.current = null;
    if (rules && state.ticks > 0) change(state.draft);
  };
  const holdHandlers = (direction: -1 | 1) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => startHold(direction, event),
    onPointerUp: endHold,
    onPointerLeave: endHold,
    onPointerCancel: endHold,
    // Long-press must not open the touch context menu.
    onContextMenu: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
  });
  /** A click after a repeating hold was already applied by the hold. */
  const consumedByHold = () => {
    const consumed = suppressClick.current;
    suppressClick.current = false;
    return consumed;
  };
  const decrement = (
    <button
      key="minus"
      type="button"
      className="dndev-quantity-stepper-decrement"
      aria-label={decrementLabel}
      aria-hidden={collapsed || undefined}
      tabIndex={collapsed ? -1 : undefined}
      disabled={disabled || (rules ? (!editing || collapsed) && value <= (allowZero ? 0 : min) : !onDecrement)}
      {...holdHandlers(-1)}
      onClick={(event) => {
        if (consumedByHold()) event.currentTarget.focus();
        else if (rules) {
          stepQuantity(-1);
          event.currentTarget.focus();
        } else onDecrement?.();
      }}
    >
      <Minus aria-hidden="true" focusable="false" />
    </button>
  );
  const increment = (
    <button
      key="plus"
      ref={plusRef}
      type="button"
      className="dndev-quantity-stepper-increment"
      aria-label={incrementLabel}
      disabled={disabled || (rules ? !editing && value >= rules.max : !onIncrement)}
      {...holdHandlers(1)}
      onClick={(event) => {
        if (consumedByHold()) event.currentTarget.focus();
        else if (rules) {
          stepQuantity(1);
          event.currentTarget.focus();
        } else onIncrement?.();
      }}
    >
      <Plus aria-hidden="true" focusable="false" />
    </button>
  );
  const quantity = onChange ? (
    <input
      key="quantity"
      ref={inputRef}
      className="dndev-quantity-stepper-value"
      type="text"
      inputMode="numeric"
      enterKeyHint="done"
      autoComplete="off"
      spellCheck={false}
      pattern="[0-9]*"
      role="spinbutton"
      aria-label={valueLabel ?? props['aria-label']}
      aria-valuemin={allowZero || value === 0 ? 0 : min}
      aria-valuemax={rules?.max}
      aria-valuenow={value}
      aria-hidden={collapsed || undefined}
      tabIndex={collapsed ? -1 : undefined}
      disabled={disabled}
      defaultValue={value}
      onFocus={(event) => {
        setEditing(true);
        event.currentTarget.select();
      }}
      onInput={(event) => {
        if (!rules || disabled || collapsed) return;
        const input = event.currentTarget;
        const text = input.value.trim();
        const draft = Number(text);
        const numeric = /^\d+$/.test(text) && Number.isSafeInteger(draft);
        if (numeric) input.setAttribute('aria-valuenow', String(draft));
        else input.removeAttribute('aria-valuenow');
        const valid = numeric && (draft === 0 ? allowZero || value === 0
          : draft >= rules.min && draft <= rules.max && (draft - rules.min) % rules.step === 0);
        if (valid) input.removeAttribute('aria-invalid');
        else input.setAttribute('aria-invalid', 'true');
      }}
      onKeyDown={(event) => {
        if (event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey || !rules) return;
        const input = event.currentTarget;
        if (event.key === 'Escape') {
          event.preventDefault();
          restoreEditor(input, value);
        } else if (event.key === 'Enter') {
          event.preventDefault();
          commit(input);
        } else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          const base = input.value === String(value) ? value : normalizeQuantity(input.value, rules) ?? value;
          const next = event.key === 'Home' ? (allowZero ? 0 : min)
            : event.key === 'End' ? rules.max
            : moveQuantity(base, event.key === 'ArrowDown' || event.key === 'PageDown' ? -1 : 1, event.key.startsWith('Page') ? 10 : 1, rules);
          change(next);
        }
      }}
    />
  ) : onValueClick ? (
    <button key="quantity" type="button" className="dndev-quantity-stepper-value" aria-label={valueLabel} aria-hidden={collapsed || undefined} tabIndex={collapsed ? -1 : undefined} disabled={disabled} onClick={onValueClick}>
      {value}
    </button>
  ) : (
    <output key="quantity" className="dndev-quantity-stepper-value" aria-live="polite" aria-hidden={collapsed || undefined}>
      {value}
    </output>
  );

  return (
    <div
      {...props}
      ref={groupRef}
      role="group"
      onBlur={(event) => {
        // Tabbing to a step button must preserve the draft for its activation.
        // Leaving the group commits it once, including when focus left the input
        // for a button first. Enter/step already reset the DOM to controlled value.
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEditing(false);
          if (inputRef.current) commit(inputRef.current);
        }
        onBlur?.(event);
      }}
      className={cn('dndev-quantity-stepper', className)}
      data-full-width={fullWidth || undefined}
      data-disabled={disabled || undefined}
      data-collapsed={collapsed || undefined}
      data-vertical={vertical || undefined}
    >
      {vertical ? [increment, quantity, decrement] : [decrement, quantity, increment]}
    </div>
  );
};

export default QuantityStepper;
