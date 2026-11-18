import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

describe('Toaster stacking', () => {
  it('uses the toast layer token above modal Sheets', () => {
    const css = readFileSync(resolve(__dirname, '../Toaster.css'), 'utf-8');
    const tokens = readFileSync(resolve(__dirname, '../../../styles/variables.css'), 'utf-8');
    const sheet = readFileSync(resolve(__dirname, '../../Sheet/Sheet.css'), 'utf-8');
    expect(css).toMatch(/\.dndev-toast-viewport\s*\{[^}]*z-index:\s*var\(--z-toast\)/);
    expect(sheet).toContain('var(--z-modal)');
    const toastLayer = tokens.match(/--z-toast:\s*(\d+)/);
    const modalLayer = tokens.match(/--z-modal:\s*(\d+)/);
    expect(toastLayer).not.toBeNull();
    expect(modalLayer).not.toBeNull();
    expect(Number(toastLayer?.[1])).toBeGreaterThan(Number(modalLayer?.[1]));
  });
});
