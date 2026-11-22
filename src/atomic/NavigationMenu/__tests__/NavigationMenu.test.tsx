import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NavigationMenu from '../index';

describe('NavigationMenu active item', () => {
  it('renders aria-current and data-active on the active link only', () => {
    render(
      <NavigationMenu
        display="full"
        items={[
          { label: 'Home', path: '/' },
          { label: 'Blog', path: '/blog', active: true },
        ]}
      />
    );
    const blog = screen.getByText('Blog').closest('a')!;
    expect(blog.getAttribute('aria-current')).toBe('page');
    expect(blog.getAttribute('data-active')).toBe('true');
    const home = screen.getByText('Home').closest('a')!;
    expect(home.hasAttribute('aria-current')).toBe(false);
    expect(home.hasAttribute('data-active')).toBe(false);
  });
});

describe('NavigationMenu.css', () => {
  const css = readFileSync(
    resolve(__dirname, '../NavigationMenu.css'),
    'utf8'
  );

  it('resets list-style on the sub-menu grid container', () => {
    expect(css).toMatch(
      /\.dndev-nav-menu-grid-container\s*\{[^}]*list-style:\s*none/
    );
  });

  it('styles the active link', () => {
    expect(css).toContain(".dndev-nav-menu-item-container[data-active='true']");
  });
});
