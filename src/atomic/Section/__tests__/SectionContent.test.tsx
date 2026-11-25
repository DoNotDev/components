// packages/components/src/atomic/Section/__tests__/SectionContent.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Section from '../index';

const css = readFileSync(resolve(__dirname, '../Section.css'), 'utf8');

// Regression (shop review): the content was display: block, so its children touched
// (no gap) and `align` / `justify` (align-items / justify-content) did nothing.
describe('Section content', () => {
  it('is a gapped flex column, so align and justify apply', () => {
    expect(css).toMatch(
      /\.dndev-section-content \{[^}]*display: flex;[^}]*flex-direction: column;[^}]*gap: var\(--gap-md\);/
    );
    const html = renderToStaticMarkup(
      <Section align="start" justify="center">
        <span>a</span>
      </Section>
    );
    expect(html).toContain('data-align="start"');
    expect(html).toContain('data-justify="center"');
  });

  it('spaces the title by the content gap, not by a margin of its own', () => {
    expect(css).toMatch(
      /\.dndev-section-content > \.dndev-section-title,\s*\.dndev-section-content > \.dndev-section-header \{\s*margin-block-end: 0;\s*\}/
    );
  });
});
