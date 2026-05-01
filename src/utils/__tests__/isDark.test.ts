import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { isDark } from '../isDark';

describe('isDark', () => {
  beforeEach(() => {
    // Reset document state
    document.documentElement.classList.remove('dark');
  });

  it('returns false in SSR (no window)', () => {
    const originalWindow = globalThis.window;
    // @ts-ignore — simulate SSR
    delete (globalThis as any).window;

    expect(isDark()).toBe(false);

    // Restore
    (globalThis as any).window = originalWindow;
  });

  it('returns true when --theme-is-dark is "1"', () => {
    document.documentElement.style.setProperty('--theme-is-dark', '1');

    expect(isDark()).toBe(true);

    document.documentElement.style.removeProperty('--theme-is-dark');
  });

  it('returns false when --theme-is-dark is "0"', () => {
    document.documentElement.style.setProperty('--theme-is-dark', '0');

    expect(isDark()).toBe(false);

    document.documentElement.style.removeProperty('--theme-is-dark');
  });

  it('falls back to "dark" class when no CSS property', () => {
    document.documentElement.classList.add('dark');

    expect(isDark()).toBe(true);
  });

  it('returns false when no dark class and no CSS property', () => {
    expect(isDark()).toBe(false);
  });
});
