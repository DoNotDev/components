// packages/components/src/atomic/DescriptionList/__tests__/DescriptionListSpacing.test.ts

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../DescriptionList.css'), 'utf8');

// Regression (shop review): horizontal rows (one line each) were --gap-lg apart, looser
// than the two-line vertical items (cart recap rows ~68px apart).
describe('DescriptionList spacing', () => {
  it('spaces horizontal rows by --gap-sm, vertical items by --gap-md', () => {
    expect(css).toMatch(/&\[data-orientation='horizontal'\] \{\s*gap: var\(--gap-sm\);/);
    expect(css).toMatch(/\.dndev-description-list \{[^}]*gap: var\(--gap-md\);/);
  });
});
