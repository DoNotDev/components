import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../patterns.css'), 'utf8');

describe('.dndev-floating --floating-background token', () => {
  it('paints the theme token, defaulting to the glow gradient', () => {
    expect(css).toContain(
      'background: var(--floating-background, var(--floating-glow-gradient));'
    );
  });

  it('is never declared inside .dndev-floating (would shadow the theme value)', () => {
    expect(css).not.toMatch(/^\s*--floating-background\s*:/m);
  });

  it('RTL gradient honours the token too', () => {
    expect(css).toMatch(
      /&:dir\(rtl\)\s*\{\s*background:\s*var\(\s*--floating-background,/
    );
  });
});
