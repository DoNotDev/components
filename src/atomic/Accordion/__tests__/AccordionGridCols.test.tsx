// packages/components/src/atomic/Accordion/__tests__/AccordionGridCols.test.tsx

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import Accordion from '../index';

const items = [
  { value: 'a', trigger: 'Question A', content: 'Answer A' },
  { value: 'b', trigger: 'Question B', content: 'Answer B' },
];

const rootTag = (html: string) => html.slice(0, html.indexOf('>') + 1);

describe('Accordion gridCols', () => {
  it('absent: single column root, no grid class, attributes or inline style', () => {
    const root = rootTag(
      renderToString(<Accordion type="single" collapsible items={items} />)
    );
    expect(root).toContain('dndev-accordion');
    expect(root).not.toContain('dndev-grid-component');
    expect(root).not.toContain('data-gap');
    expect(root).not.toContain('style=');
  });

  it('numeric tuple: grid class, custom properties, start alignment', () => {
    const root = rootTag(
      renderToString(<Accordion items={items} gridCols={[1, 1, 2, 2]} />)
    );
    expect(root).toContain('dndev-grid-component');
    expect(root).toContain('data-align="start"');
    expect(root).toContain('data-gap="medium"');
    expect(root).toContain('data-responsive="true"');
    expect(root).toContain('--grid-cols-mobile:1');
    expect(root).toContain('--grid-cols-laptop:2');
    expect(root).toContain('--grid-cols-desktop:2');
  });

  it('template tuple: responsive template properties', () => {
    const root = rootTag(
      renderToString(
        <Accordion items={items} gridCols={['1fr', '1fr', '1fr 1fr', '1fr 1fr']} />
      )
    );
    expect(root).toContain('data-responsive-tpl="true"');
    expect(root).toContain('--grid-tpl-laptop:1fr 1fr');
  });

  it('applies to type="multiple" and keeps every item in order', () => {
    const html = renderToString(
      <Accordion type="multiple" items={items} gridCols={2} />
    );
    expect(rootTag(html)).toContain('dndev-grid-component');
    expect(html.indexOf('Question A')).toBeGreaterThan(-1);
    expect(html.indexOf('Question A')).toBeLessThan(html.indexOf('Question B'));
  });
});
