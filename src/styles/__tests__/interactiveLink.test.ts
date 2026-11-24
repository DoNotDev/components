import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../patterns.css'), 'utf8');
const text = readFileSync(
  resolve(__dirname, '../../atomic/Text/Text.css'),
  'utf8'
);

describe('.dndev-interactive rendered as <a>', () => {
  it('has no underline by default', () => {
    expect(css).toMatch(/\n\.dndev-interactive\s*\{[^}]*\n\s*text-decoration:\s*none;/);
  });

  it('keeps the underline for variant="link"', () => {
    expect(css).toMatch(
      /&\[data-variant='link'\]\s*\{[^}]*text-decoration:\s*underline;/
    );
  });

  it('is never reached by the Text link rule', () => {
    expect(text).toMatch(/a:not\(\.dndev-interactive\)\s*\{/);
  });
});
