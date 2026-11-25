// packages/components/src/atomic/Card/__tests__/CardLayout.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Card from '../index';

const css = readFileSync(resolve(__dirname, '../Card.css'), 'utf8');

// Regressions (shop review): `height: 100%` made a Card fill its row even under a
// parent aligned to the start (cart recap stretched to the lines column); the footer
// of equal-height cards sat at different heights (body grid, align-content: start).
describe('Card layout', () => {
  it('takes no height of its own: the parent alignment decides', () => {
    const html = renderToStaticMarkup(<Card title="Recap" footer="Pay" />);
    expect(html).not.toMatch(/height:\s*100%/);
    expect(html).toContain('<div class="dndev-card-footer">Pay</div>');
  });

  it('keeps the aspect ratio of a cover-only card', () => {
    const html = renderToStaticMarkup(<Card cover="/a.jpg" coverAspect="1 / 1" />);
    expect(html).toMatch(/aspect-ratio:\s*1 \/ 1/);
  });

  it('lets the body fill the card and pins the footer to its bottom', () => {
    expect(css).toMatch(/\.dndev-card \{[^}]*display: flex;[^}]*flex-direction: column;/);
    expect(css).not.toMatch(/\.dndev-card \{[^}]*align-content: start/);
    expect(css).toMatch(/\.dndev-card-body \{[^}]*flex: 1 1 auto;/);
    expect(css).toMatch(/\.dndev-card-footer \{\s*margin-block-start: auto;\s*\}/);
  });

  it('fills the cover region of a ReactNode cover with coverBackground', () => {
    const html = renderToStaticMarkup(
      <Card title="No picture" cover={<span />} coverBackground="muted" />
    );
    expect(html).toContain('data-background="muted"');
  });
});
