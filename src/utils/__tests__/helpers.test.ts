import { describe, it, expect } from 'vitest';

import { cn, getVariantDataAttrs } from '../helpers';

describe('cn', () => {
  it('merges string class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles objects', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });

  it('deduplicates is handled by clsx (no tailwind-merge)', () => {
    // cn uses clsx, not twMerge — so duplicates are kept
    expect(cn('p-2', 'p-4')).toBe('p-2 p-4');
  });
});

describe('getVariantDataAttrs', () => {
  it('converts variant props to data attributes', () => {
    const result = getVariantDataAttrs({ variant: 'primary', size: 'md' });

    expect(result).toEqual({
      'data-variant': 'primary',
      'data-size': 'md',
    });
  });

  it('skips null and undefined values', () => {
    const result = getVariantDataAttrs({
      variant: 'primary',
      size: null,
      shadow: undefined,
    });

    expect(result).toEqual({ 'data-variant': 'primary' });
  });

  it('handles all supported props', () => {
    const result = getVariantDataAttrs({
      variant: 'ghost',
      size: 'lg',
      shadow: 'md',
      radius: 'full',
      hover: 'scale',
      glow: 'blue',
      side: 'left',
    });

    expect(result).toEqual({
      'data-variant': 'ghost',
      'data-size': 'lg',
      'data-shadow': 'md',
      'data-radius': 'full',
      'data-hover': 'scale',
      'data-glow': 'blue',
      'data-side': 'left',
    });
  });

  it('returns empty object for no matching props', () => {
    const result = getVariantDataAttrs({});

    expect(result).toEqual({});
  });

  it('returns empty object for all-null props', () => {
    const result = getVariantDataAttrs({
      variant: null,
      size: null,
    });

    expect(result).toEqual({});
  });
});
