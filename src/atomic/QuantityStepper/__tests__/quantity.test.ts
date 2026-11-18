import { describe, expect, it } from 'vitest';

import { moveQuantity, normalizeQuantity, quantityRules } from '../quantity';

describe('quantity lot rules', () => {
  it('defaults to positive integers and aligns lots from min, not zero', () => {
    expect(quantityRules().min).toBe(1);
    expect(quantityRules().step).toBe(1);
    const rules = quantityRules(3, 4, 14);
    expect(rules.max).toBe(11);
    for (const [text, expected] of [['0', 3], ['1', 3], ['3', 3], ['4', 7], ['8', 11], ['14', 11], [' 7 ', 7]] as const) {
      expect(normalizeQuantity(text, rules)).toBe(expected);
    }
  });

  it('accepts zero only when enabled', () => {
    expect(normalizeQuantity('0', quantityRules(3, 4, 14, true))).toBe(0);
    expect(normalizeQuantity('1', quantityRules(3, 4, 14, true))).toBe(3);
  });

  it('rejects malformed, fractional, negative and unsafe input without NaN', () => {
    for (const text of ['', ' ', '-1', '+1', '1.5', '1.0', '1e3', '0x10', 'NaN', 'Infinity', '2units', '9007199254740992', '9'.repeat(400)]) {
      expect(normalizeQuantity(text, quantityRules())).toBeUndefined();
    }
  });

  it('rejects invalid configurations', () => {
    for (const [min, step, max] of [[0, 1, 10], [-1, 1, 10], [1, 0, 10], [1, 1.5, 10], [3, 1, 2], [1, 1, Infinity], [NaN, 1, 10], [1, Number.MAX_SAFE_INTEGER + 1, 10]]) {
      expect(() => quantityRules(min, step, max)).toThrow(RangeError);
    }
  });

  it('steps from zero to min, clamps at lots, and pages safely at integer limits', () => {
    const rules = quantityRules(3, 4, 14, true);
    expect(moveQuantity(0, 1, 1, rules)).toBe(3);
    expect(moveQuantity(3, -1, 1, rules)).toBe(0);
    expect(moveQuantity(7, -1, 1, rules)).toBe(3);
    expect(moveQuantity(7, -1, 10, rules)).toBe(0);
    expect(moveQuantity(7, 1, 10, rules)).toBe(11);
    expect(moveQuantity(11, 1, 1, rules)).toBe(11);
    expect(moveQuantity(1, -1, 1, quantityRules())).toBe(1);
    expect(moveQuantity(Number.MAX_SAFE_INTEGER - 1, 1, 10, quantityRules())).toBe(Number.MAX_SAFE_INTEGER);
  });
});
