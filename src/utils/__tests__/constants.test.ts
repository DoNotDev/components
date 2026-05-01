import { describe, it, expect } from 'vitest';

import {
  THEME_VARIANT,
  SURFACE_VARIANT,
  FLOATING_VARIANT,
  CONTROL_VARIANT,
  TONE,
  TEXT_ALIGN,
} from '../constants';

describe('THEME_VARIANT', () => {
  it('contains all expected variants', () => {
    expect(THEME_VARIANT.DEFAULT).toBe('default');
    expect(THEME_VARIANT.MUTED).toBe('muted');
    expect(THEME_VARIANT.PRIMARY).toBe('primary');
    expect(THEME_VARIANT.SECONDARY).toBe('secondary');
    expect(THEME_VARIANT.ACCENT).toBe('accent');
    expect(THEME_VARIANT.SUCCESS).toBe('success');
    expect(THEME_VARIANT.WARNING).toBe('warning');
    expect(THEME_VARIANT.DESTRUCTIVE).toBe('destructive');
  });

  it('has exactly 8 variants', () => {
    expect(Object.keys(THEME_VARIANT)).toHaveLength(8);
  });
});

describe('SURFACE_VARIANT', () => {
  it('extends THEME_VARIANT with OUTLINE and GLASS', () => {
    expect(SURFACE_VARIANT.OUTLINE).toBe('outline');
    expect(SURFACE_VARIANT.GLASS).toBe('glass');
  });

  it('includes all THEME_VARIANT values', () => {
    for (const key of Object.keys(THEME_VARIANT)) {
      expect(SURFACE_VARIANT).toHaveProperty(
        key,
        THEME_VARIANT[key as keyof typeof THEME_VARIANT]
      );
    }
  });

  it('has exactly 10 variants', () => {
    expect(Object.keys(SURFACE_VARIANT)).toHaveLength(10);
  });
});

describe('FLOATING_VARIANT', () => {
  it('is same as THEME_VARIANT', () => {
    expect(FLOATING_VARIANT).toBe(THEME_VARIANT);
  });
});

describe('CONTROL_VARIANT', () => {
  it('is same as THEME_VARIANT', () => {
    expect(CONTROL_VARIANT).toBe(THEME_VARIANT);
  });
});

describe('TONE', () => {
  it('contains all expected tone values', () => {
    expect(TONE.GHOST).toBe('ghost');
    expect(TONE.BASE).toBe('base');
    expect(TONE.MUTED).toBe('muted');
    expect(TONE.CONTRAST).toBe('contrast');
    expect(TONE.ACCENT).toBe('accent');
    expect(TONE.PRIMARY).toBe('primary');
  });

  it('has exactly 6 tones', () => {
    expect(Object.keys(TONE)).toHaveLength(6);
  });
});

describe('TEXT_ALIGN', () => {
  it('contains all expected alignment values', () => {
    expect(TEXT_ALIGN.START).toBe('start');
    expect(TEXT_ALIGN.CENTER).toBe('center');
    expect(TEXT_ALIGN.END).toBe('end');
  });

  it('has exactly 3 alignments', () => {
    expect(Object.keys(TEXT_ALIGN)).toHaveLength(3);
  });
});
