import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import List from '../index';

afterEach(cleanup);

const css = readFileSync(resolve(__dirname, '../List.css'), 'utf8');

describe('List ordered', () => {
  it('renders an <ol> flagged data-ordered', () => {
    const { container } = render(<List items={['Cleanse', 'Apply']} ordered />);
    const list = container.querySelector('ol');
    expect(list?.getAttribute('data-ordered')).toBe('true');
    expect(list?.querySelectorAll(':scope > li.dndev-list-item')).toHaveLength(2);
  });

  it('renders a <ul> without data-ordered by default', () => {
    const { container } = render(<List items={['A']} />);
    expect(container.querySelector('ul')?.hasAttribute('data-ordered')).toBe(false);
  });

  // Items are display:flex, which suppresses ::marker: the numbers must come from a counter.
  it('draws the numbers with a counter, since flex items have no ::marker', () => {
    expect(css).toMatch(/&\[data-ordered='true'\]:not\(\[data-marker='none'\]\)\s*\{[^}]*counter-reset:\s*dndev-list-item;/);
    expect(css).toMatch(/counter-increment:\s*dndev-list-item;/);
    expect(css).toMatch(/&::before\s*\{[^}]*content:\s*counter\(dndev-list-item\) '\.';/);
  });
});

describe('List unordered bullets', () => {
  it('flags icon-less items data-plain, not items with an icon', () => {
    const { container } = render(
      <List
        items={['Plain', { content: 'Rich' }, { content: 'Iconed', icon: <i /> }]}
      />
    );
    const lis = container.querySelectorAll(':scope > ul > li');
    expect(lis[0].getAttribute('data-plain')).toBe('true');
    expect(lis[1].getAttribute('data-plain')).toBe('true');
    expect(lis[2].hasAttribute('data-plain')).toBe(false);
  });

  it('does not flag items that take the container icon', () => {
    const { container } = render(<List items={['A']} icon={<i />} />);
    expect(container.querySelector('li')?.hasAttribute('data-plain')).toBe(false);
  });

  it('draws the bullet for plain items of unordered lists only', () => {
    expect(css).toMatch(
      /&:not\(\[data-ordered='true'\]\)[^{]*\{[^]*?\.dndev-list-item\[data-plain='true'\]::before\s*\{[^}]*content:\s*'\\2022';/
    );
  });
});

describe('List marker', () => {
  it('marker="none" sets data-marker and role="list", keeping the <ol>', () => {
    const { container } = render(<List items={['A', 'B']} ordered marker="none" />);
    const list = container.querySelector('ol');
    expect(list?.getAttribute('data-marker')).toBe('none');
    expect(list?.getAttribute('role')).toBe('list');
  });

  it('sets neither attribute nor role by default', () => {
    const { container } = render(<List items={['A']} />);
    const list = container.querySelector('ul');
    expect(list?.hasAttribute('data-marker')).toBe(false);
    expect(list?.hasAttribute('role')).toBe(false);
  });

  it('excludes the counter and bullet rules when marker is none', () => {
    expect(css).toMatch(/&\[data-ordered='true'\]:not\(\[data-marker='none'\]\)/);
    expect(css).toMatch(/&:not\(\[data-ordered='true'\]\):not\(\[data-marker='none'\]\)/);
    expect(css).toMatch(/&\[data-marker='none'\]\s*\{\s*list-style-type:\s*none;/);
  });
});
