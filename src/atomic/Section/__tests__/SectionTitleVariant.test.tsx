// packages/components/src/atomic/Section/__tests__/SectionTitleVariant.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Section from '../index';

// titleVariant="heading" (admin header: plain title) and titleMeta (muted text beside it).

const parse = (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  return host;
};

describe('Section titleVariant / titleMeta', () => {
  it('keeps the label look by default, markup unchanged without titleMeta', () => {
    const host = parse(renderToString(<Section title="Features">x</Section>));
    const title = host.querySelector('h2.dndev-section-title')!;
    expect(title.getAttribute('data-title-variant')).toBe('label');
    expect(host.querySelector('.dndev-section-header')).toBeNull();
    expect(host.querySelector('.dndev-section-title-meta')).toBeNull();
  });

  it('renders a plain heading with the meta beside it, actions at the end', () => {
    const host = parse(
      renderToString(
        <Section
          title="Products"
          titleVariant="heading"
          titleMeta="64 products"
          actions={<button>Add</button>}
        >
          x
        </Section>
      )
    );
    const header = host.querySelector('.dndev-section-header')!;
    const group = header.querySelector('.dndev-section-title-group')!;
    expect(group.querySelector('h2')!.textContent).toBe('Products');
    expect(group.querySelector('h2')!.getAttribute('data-title-variant')).toBe('heading');
    // The meta is outside the heading
    expect(group.querySelector('.dndev-section-title-meta')!.textContent).toBe('64 products');
    expect(group.querySelector('h2 .dndev-section-title-meta')).toBeNull();
    expect(header.querySelector('.dndev-section-actions button')!.textContent).toBe('Add');
  });

  it('renders the meta row without actions', () => {
    const host = parse(
      renderToString(
        <Section title="Products" titleMeta="2 products">
          x
        </Section>
      )
    );
    expect(host.querySelector('.dndev-section-header .dndev-section-title-meta')).toBeTruthy();
    expect(host.querySelector('.dndev-section-actions')).toBeNull();
  });

  // Owner decision 2026-11-25 F4: no own colour (the label's accent !important wins)
  it('heading variant: normal case, no letter spacing, the label colour (CSS)', () => {
    const css = readFileSync(resolve(__dirname, '../Section.css'), 'utf8');
    const rule = css.match(
      /\.dndev-section-title\[data-title-variant='heading'\]\s*\{([^}]*)\}/
    )![1]!;
    expect(rule).toContain('text-transform: none');
    expect(rule).toContain('letter-spacing: normal');
    expect(rule).not.toContain('color:');
  });
});
