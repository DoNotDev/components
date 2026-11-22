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
