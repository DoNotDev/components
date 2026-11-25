// packages/components/src/atomic/PageTitle/__tests__/PageTitle.test.tsx

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PageTitle from '../index';

const count = (html: string, re: RegExp) => (html.match(re) ?? []).length;

describe('PageTitle', () => {
  it('renders exactly one h1 with the title', () => {
    const html = renderToString(<PageTitle title="Orders" />);
    expect(count(html, /<h1[\s>]/g)).toBe(1);
    expect(html).toMatch(/<h1[^>]*>Orders<\/h1>/);
  });

  it('is start-aligned', () => {
    const html = renderToString(<PageTitle title="Orders" />);
    expect(html).toMatch(/<h1[^>]*data-text-align="start"/);
  });

  it('string meta: a muted line, not a second heading', () => {
    const html = renderToString(<PageTitle title="CGV" meta="Version 3" />);
    expect(html).toContain('Version 3');
    expect(html).toMatch(/<[a-z]+[^>]*>Version 3<\/[a-z]+>/);
    expect(count(html, /<h[1-6][\s>]/g)).toBe(1);
  });

  it('node meta: rendered as is', () => {
    const html = renderToString(
      <PageTitle title="Order" meta={<span id="status">Paid</span>} />
    );
    expect(html).toContain('<span id="status">Paid</span>');
  });

  it('no meta: only the title', () => {
    const html = renderToString(<PageTitle title="Orders" />);
    expect(html).not.toContain('muted');
  });

  it('contentWidth is passed to the Section', () => {
    const html = renderToString(<PageTitle title="CGV" contentWidth="docs" />);
    expect(html).toContain('data-content-width="docs"');
    expect(renderToString(<PageTitle title="CGV" />)).not.toContain(
      'data-content-width'
    );
  });
});
