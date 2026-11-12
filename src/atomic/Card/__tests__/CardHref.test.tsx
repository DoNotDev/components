// packages/components/src/atomic/Card/__tests__/CardHref.test.tsx

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import { LinkRendererProvider } from '../../../utils/linkComponent';
import type { LinkRendererProps } from '../../../utils/linkComponent';
import Card from '../index';

describe('Card href', () => {
  it('renders the title as a real <a href> (crawlable)', () => {
    const html = renderToStaticMarkup(
      <Card title="Bakuchiol Cream" href="/produits/bakuchiol" />
    );
    expect(html).toContain('href="/produits/bakuchiol"');
    expect(html).toMatch(/<a[^>]*class="dndev-card-link"[^>]*>Bakuchiol Cream<\/a>/);
    expect(html).toContain('data-has-link="true"');
    expect(html).toContain('data-clickable="true"');
  });

  it('keeps controls outside the link (no button inside <a>)', () => {
    const html = renderToStaticMarkup(
      <Card title="P" href="/p" footer={<button type="button">+</button>} />
    );
    expect(html).not.toMatch(/<a[^>]*>(?:(?!<\/a>).)*<button/);
  });

  it('uses the provided router link renderer', () => {
    const RouterLink = ({ href, children, ...rest }: LinkRendererProps) => (
      <a data-router="true" href={href} {...rest}>
        {children}
      </a>
    );
    const html = renderToStaticMarkup(
      <LinkRendererProvider value={RouterLink}>
        <Card title="P" href="/p" />
      </LinkRendererProvider>
    );
    expect(html).toContain('data-router="true"');
  });

  it('renders an overlay link with the card aria-label when there is no title', () => {
    const html = renderToStaticMarkup(
      <Card href="/p" aria-label="Open P" cover="/p.webp" />
    );
    expect(html).toMatch(/<a[^>]*href="\/p"[^>]*aria-label="Open P"|<a[^>]*aria-label="Open P"[^>]*href="\/p"/);
  });

  it('without href, renders no link', () => {
    expect(renderToStaticMarkup(<Card title="P" />)).not.toContain('<a');
  });
});
