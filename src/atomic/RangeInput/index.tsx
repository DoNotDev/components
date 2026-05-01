// packages/components/src/atomic/RangeInput/index.tsx

/**
 * @fileoverview RangeInput component
 * @description Two-input range component for min/max values (e.g., price ranges, date ranges)
 *
 * @version 0.1.0
 * @since 0.0.1
 * @author AMBROISE PARK Consulting
 */

import { X } from 'lucide-react';

import Input from '../Input';
import { FloatingLabel } from '../Label';
import Text from '../Text';

import type { InputHTMLAttributes } from 'react';

import './RangeInput.css';

/** Props for the RangeInput component -- two-input range for min/max values. */
export interface RangeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  /** Label for the range (single FloatingLabel wrapping both inputs) */
  label?: string;
  /** Placeholder for min input */
  minPlaceholder?: string;
  /** Placeholder for max input */
  maxPlaceholder?: string;
  /** Current min value */
  minValue?: string;
  /** Current max value */
  maxValue?: string;
  /** Actual min value from data (for auto-populate on focus) */
  actualMin?: string | number;
  /** Actual max value from data (for auto-populate on focus) */
  actualMax?: string | number;
  /** Change handler: (min, max) => void */
  onChange: (min: string, max: string) => void;
  /** Clear handler - required, X button always visible */
  onClear: () => void;
}

/**
 * RangeInput - Two-input component for min/max ranges
 *
 * Features:
 * - Single FloatingLabel wrapping both inputs (when label provided)
 * - Auto-populates with actual data min/max on focus if empty
 * - Selects all text on focus
 * - Clear button always visible (disabled when empty)
 *
 * @component
 * @example
 * ```tsx
 * <RangeInput
 *   type="number"
 *   label="Price"
 *   onChange={(min, max) => setFilter({ min, max })}
 *   onClear={() => setFilter({ min: '', max: '' })}
 * />
 * ```
 */
export function RangeInput({
  type = 'number',
  label,
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  minValue = '',
  maxValue = '',
  actualMin,
  actualMax,
  min,
  max,
  onChange,
  onClear,
  ...props
}: RangeInputProps) {
  const handleMinFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if (
      !minValue &&
      actualMin !== null &&
      actualMin !== undefined &&
      actualMin !== ''
    ) {
      onChange(String(actualMin), maxValue);
    }
  };

  const handleMaxFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
    if (
      !maxValue &&
      actualMax !== null &&
      actualMax !== undefined &&
      actualMax !== ''
    ) {
      onChange(minValue, String(actualMax));
    }
  };

  const hasValue = !!(minValue || maxValue);

  const inputs = (
    <>
      <Input
        type={type}
        placeholder={minPlaceholder}
        value={minValue}
        min={min}
        max={max}
        bare
        onFocus={handleMinFocus}
        onChange={(e) => onChange(e.target.value, maxValue)}
        {...props}
      />
      <Text
        level="small"
        variant="muted"
        className="dndev-range-input-separator"
      >
        –
      </Text>
      <Input
        type={type}
        placeholder={maxPlaceholder}
        value={maxValue}
        min={min}
        max={max}
        bare
        onFocus={handleMaxFocus}
        onChange={(e) => onChange(minValue, e.target.value)}
        {...props}
      />
      <button
        type="button"
        className="dndev-inline-action-btn dndev-range-input-clear"
        onClick={onClear}
        disabled={!hasValue}
        aria-label="Clear"
      >
        <X />
      </button>
    </>
  );

  if (label) {
    return (
      <FloatingLabel label={label}>
        <div className="dndev-range-input">{inputs}</div>
      </FloatingLabel>
    );
  }

  return <div className="dndev-range-input">{inputs}</div>;
}

export default RangeInput;
