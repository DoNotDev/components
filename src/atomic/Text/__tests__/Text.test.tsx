import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Text from '../index';

describe('Text data-level', () => {
  it('emits data-level="body" for an explicit level="body" on a heading tag', () => {
    const { container } = render(
      <Text as="h2" level="body">
        t
      </Text>
    );
    expect(container.querySelector('h2')?.getAttribute('data-level')).toBe(
      'body'
    );
  });

  it('omits data-level for the implicit body default', () => {
    const { container } = render(<Text>t</Text>);
    expect(container.firstElementChild?.hasAttribute('data-level')).toBe(false);
  });

  it('keeps the auto-mapped level on heading tags', () => {
    const { container } = render(<Text as="h3">t</Text>);
    expect(container.querySelector('h3')?.getAttribute('data-level')).toBe(
      'h3'
    );
  });

  it('CSS scopes [data-level="body"] under .dndev-text-base (class + attribute beats element selectors)', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).toMatch(/&\[data-level='body'\]\s*\{\s*font-size/);
  });
});

describe('Text heading tag at a text level', () => {
  it('CSS gives h1-h6 at body / small / caption the body font, not the headline font', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).toMatch(
      /&:is\(h1, h2, h3, h4, h5, h6\):is\(\s*\[data-level='body'\],\s*\[data-level='small'\],\s*\[data-level='caption'\]\s*\)\s*\{\s*font-family: var\(--font-family, var\(--font-sans\)\);/
    );
  });
});

describe('Text as="s"', () => {
  it('renders a struck-through <s> (former price) with the Text styling hooks', () => {
    const { container } = render(
      <Text as="s" variant="muted" aria-label="was 12 €">
        12 €
      </Text>
    );
    const s = container.querySelector('s');
    expect(s?.classList.contains('dndev-text-base')).toBe(true);
    expect(s?.getAttribute('data-variant')).toBe('muted');
    expect(s?.getAttribute('aria-label')).toBe('was 12 €');
  });

  it('CSS keeps the line-through on <s>', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).toMatch(/&:is\(s\)\s*\{\s*text-decoration-line: line-through/);
  });
});

describe('Text links', () => {
  it('CSS underlines a link inside Text, except framework controls', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).toMatch(
      /&:not\(\[data-level\^='h'\]\)\s+a:not\(\.dndev-interactive\)\s*\{\s*text-decoration:\s*underline;\s*text-underline-offset:\s*2px;/
    );
  });

  // A heading-level Text (Card title at h3) wraps a Link that is a title, not running text.
  it('CSS leaves a link inside a heading level (h1-h6) without underline', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).not.toMatch(/^\s*&\s+a:not\(\.dndev-interactive\)/m);
    expect(css).toMatch(/&:not\(\[data-level\^='h'\]\)\s+a:not/);
  });
});

describe('Text underline / lines', () => {
  it('sets data-underline only when underline is true', () => {
    const { container, rerender } = render(<Text underline>t</Text>);
    expect(container.firstElementChild?.hasAttribute('data-underline')).toBe(true);
    rerender(<Text>t</Text>);
    expect(container.firstElementChild?.hasAttribute('data-underline')).toBe(false);
  });

  it('sets data-lines and --text-lines for a positive integer, keeping the caller style', () => {
    const { container } = render(
      <Text lines={2} style={{ color: 'red' }}>t</Text>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('data-lines')).toBe('2');
    expect(el.style.getPropertyValue('--text-lines')).toBe('2');
    expect(el.style.color).toBe('red');
  });

  it.each([0, -1, 1.5, Number.NaN])('ignores lines=%s', (n) => {
    const { container } = render(<Text lines={n}>t</Text>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-lines')).toBe(false);
    expect(el.style.getPropertyValue('--text-lines')).toBe('');
  });

  it('CSS clamps with line-clamp and underlines via data attributes', () => {
    const css = readFileSync(resolve(__dirname, '../Text.css'), 'utf8');
    expect(css).toMatch(/&\[data-lines\]\s*\{[^}]*-webkit-line-clamp: var\(--text-lines\)/);
    expect(css).toMatch(/&\[data-underline\]\s*\{\s*text-decoration-line: underline/);
  });
});
