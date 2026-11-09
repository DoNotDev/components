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

import { Minus, Plus } from 'lucide-react';
import type { HTMLAttributes } from 'react';

import { cn } from '../../utils/helpers';
import Button from '../Button';

import './QuantityStepper.css';

/** Props for the QuantityStepper component -- [ − qty + ] quantity control. */
export interface QuantityStepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'onChange'> {
  /** Quantity shown between the buttons */
  value: number;
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

/**
 * Quantity control in the e-commerce standard form: one outlined field, borderless
 * − / + buttons, the quantity centred with tabular figures. Stateless: the caller owns
 * the value and the step rules (lots, minimums, stock) and passes `undefined` handlers
 * to disable a direction.
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
  disabled = false,
  fullWidth = false,
  decrementLabel,
  incrementLabel,
  valueLabel,
  className,
  ...props
}: QuantityStepperProps) => (
  <div
    role="group"
    className={cn('dndev-quantity-stepper', className)}
    data-full-width={fullWidth || undefined}
    data-disabled={disabled || undefined}
    {...props}
  >
    <Button variant="ghost" icon={Minus} display="compact" aria-label={decrementLabel} disabled={disabled || !onDecrement} onClick={onDecrement} />
    {onValueClick ? (
      <button type="button" className="dndev-quantity-stepper-value" aria-label={valueLabel} disabled={disabled} onClick={onValueClick}>
        {value}
      </button>
    ) : (
      <output className="dndev-quantity-stepper-value" aria-live="polite">
        {value}
      </output>
    )}
    <Button variant="ghost" icon={Plus} display="compact" aria-label={incrementLabel} disabled={disabled || !onIncrement} onClick={onIncrement} />
  </div>
);

export default QuantityStepper;
