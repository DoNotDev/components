/** Integer lot constraints for editable quantities. */
export interface QuantityRules {
  min: number;
  step: number;
  max: number;
  allowZero: boolean;
}

/** Validate configuration and compute the largest complete lot below max. */
export function quantityRules(min = 1, step = 1, max = Number.MAX_SAFE_INTEGER, allowZero = false): QuantityRules {
  if (!Number.isSafeInteger(min) || min < 1 || !Number.isSafeInteger(step) || step < 1 || !Number.isSafeInteger(max) || max < min) {
    throw new RangeError('QuantityStepper requires positive safe integer min/step and a safe integer max >= min.');
  }
  return { min, step, max: min + Math.floor((max - min) / step) * step, allowZero };
}

/** Parse decimal integers only; align upwards to a lot, then clamp to complete lots. */
export function normalizeQuantity(text: string, rules: QuantityRules): number | undefined {
  if (!/^\d+$/.test(text.trim())) return undefined;
  const value = Number(text.trim());
  if (!Number.isSafeInteger(value)) return undefined;
  if (value === 0 && rules.allowZero) return 0;
  if (value <= rules.min) return rules.min;
  if (value >= rules.max) return rules.max;
  return Math.min(rules.max, rules.min + Math.ceil((value - rules.min) / rules.step) * rules.step);
}

/** Move through complete lots, including the optional zero sentinel. */
export function moveQuantity(value: number, direction: -1 | 1, count: number, rules: QuantityRules): number {
  if (value === 0 && direction === -1) return 0;
  if (direction === -1 && value <= rules.min) return rules.allowZero ? 0 : rules.min;
  const base = value === 0 ? rules.min : value;
  const distance = Math.min(count, Math.floor(Number.MAX_SAFE_INTEGER / rules.step)) * rules.step;
  if (direction === 1) return value === 0 ? rules.min : base + Math.min(distance, rules.max - base);
  const next = base - Math.min(distance, base - rules.min);
  return next === rules.min && count > (base - rules.min) / rules.step && rules.allowZero ? 0 : next;
}
