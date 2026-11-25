import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(resolve(__dirname, path), 'utf8');
const tokens = read('../../../styles/variables.css');

// Regression (shop, desktop Chrome, classic 10px scrollbar): `bleed` was `100vw` wide,
// scrollbar included: it overflowed the layout's <main> (the scroll container) by half the
// scrollbar and sat half a scrollbar off the content. The page width is main's content box:
// `100cqi` (main is the inline-size container; the viewport without one).
describe('bleed spans the page width (cqi), never the viewport', () => {
  it.each([
    ['Section', '../Section.css', 'dndev-section-bleed'],
    ['CallToAction', '../../CallToAction/CallToAction.css', 'dndev-cta--bleed'],
    ['HeroSection', '../../HeroSection/HeroSection.css', 'dndev-hero-section--bleed'],
  ])('%s', (_name, path, className) => {
    const css = read(path);
    expect(css).toMatch(
      new RegExp(
        `\\.${className} \\{[^}]*width: var\\(--page-bleed-width\\);[^}]*margin-inline: var\\(--page-bleed-margin\\);`
      )
    );
    expect(tokens).toContain('--page-bleed-width: 100cqi;');
    expect(tokens).toContain('--page-bleed-margin: calc(50% - 50cqi);');
    expect(css).not.toMatch(/^\s*(max-)?width:[^;]*\d+d?vw/m);
    expect(css).not.toMatch(/^\s*margin-inline:[^;]*\d+d?vw/m);
  });
});
