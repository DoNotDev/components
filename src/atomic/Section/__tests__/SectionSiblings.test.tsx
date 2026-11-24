import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Section from '../index';

afterEach(cleanup);

const css = readFileSync(resolve(__dirname, '../Section.css'), 'utf8');

describe('Consecutive Sections', () => {
  it('renders sibling roots next to each other, ghost by default', () => {
    const { container } = render(
      <>
        <Section>a</Section>
        <Section>b</Section>
      </>
    );
    expect(
      container.querySelector(
        '.dndev-section-full-width[data-tone="ghost"] + .dndev-section-full-width[data-tone="ghost"]'
      )
    ).not.toBeNull();
  });

  // One shared gap: the previous Section's bottom padding. Both sides must be ghost.
  it('drops the top padding of a ghost Section that follows a ghost Section', () => {
    expect(css).toMatch(
      /\.dndev-section-full-width\[data-tone='ghost'\]\s*\+\s*\.dndev-section-full-width\[data-tone='ghost'\]\s*>\s*\.dndev-section-content\s*\{\s*padding-top:\s*0;\s*\}/
    );
  });

  // A band edge must not touch text: a toned neighbour on either side keeps its padding.
  it('has no sibling rule that touches a toned Section', () => {
    const rules = css.match(/[^{}]*\+[^{}]*\{[^}]*\}/g) ?? [];
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      expect(rule).not.toMatch(/data-tone='(?!ghost')/);
      expect(rule).not.toMatch(/:not\(\[data-tone/);
    }
  });

  it('does not use :has() (Safari 14.1)', () => {
    expect(css.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/:has\(/);
  });
});
