import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Section from '../index';

afterEach(cleanup);

const css = readFileSync(resolve(__dirname, '../Section.css'), 'utf8');

describe('Section nested in a Section', () => {
  it('renders the inner Section inside the outer content wrapper', () => {
    const { container } = render(
      <Section>
        <Section title="Description">text</Section>
      </Section>
    );
    expect(
      container.querySelector(
        '.dndev-section-content .dndev-section-full-width[data-tone="ghost"] > .dndev-section-content'
      )
    ).not.toBeNull();
  });

  // The page band (max-width, auto margins, side + block padding) belongs to the outer Section only.
  it('is flush: no padding, max-width or margins on a nested ghost content wrapper', () => {
    expect(css).toMatch(
      /\.dndev-section-content\s+\.dndev-section-full-width\[data-tone='ghost'\]\s*>\s*\.dndev-section-content\s*\{[^}]*max-width:\s*none;[^}]*margin-inline:\s*0;[^}]*padding-inline:\s*0;[^}]*padding-block:\s*0;/
    );
  });

  it('keeps a nested root at its container width, even with bleed', () => {
    expect(css).toMatch(
      /\.dndev-section-content\s+\.dndev-section-full-width\s*\{[^}]*width:\s*100%;[^}]*margin-inline:\s*0;/
    );
  });

  // A tone background must not sit on the text edge: only the ghost default is flush.
  it('does not strip the padding of a nested toned Section', () => {
    expect(css).not.toMatch(/\.dndev-section-content\s+\.dndev-section-full-width\s*>\s*\.dndev-section-content/);
  });
});
