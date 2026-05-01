import { describe, it, expect, beforeEach } from 'vitest';

import { isRTLLanguage } from '../rtl';

describe('isRTLLanguage', () => {
  beforeEach(() => {
    document.documentElement.dir = '';
    document.documentElement.lang = '';
  });

  it('detects Arabic as RTL', () => {
    expect(isRTLLanguage('ar')).toBe(true);
  });

  it('detects Hebrew as RTL', () => {
    expect(isRTLLanguage('he')).toBe(true);
  });

  it('detects Persian as RTL', () => {
    expect(isRTLLanguage('fa')).toBe(true);
  });

  it('detects Urdu as RTL', () => {
    expect(isRTLLanguage('ur')).toBe(true);
  });

  it('returns false for English', () => {
    expect(isRTLLanguage('en')).toBe(false);
  });

  it('returns false for French', () => {
    expect(isRTLLanguage('fr')).toBe(false);
  });

  it('returns false for unknown language code', () => {
    expect(isRTLLanguage('xx')).toBe(false);
  });

  it('detects RTL from dir attribute when no language param', () => {
    document.documentElement.dir = 'rtl';
    expect(isRTLLanguage()).toBe(true);
  });

  it('returns false from dir=ltr when no language param', () => {
    document.documentElement.dir = 'ltr';
    expect(isRTLLanguage()).toBe(false);
  });

  it('falls back to lang attribute when dir not set', () => {
    document.documentElement.lang = 'ar';
    expect(isRTLLanguage()).toBe(true);
  });

  it('returns false for LTR lang when dir not set', () => {
    document.documentElement.lang = 'en';
    expect(isRTLLanguage()).toBe(false);
  });
});
