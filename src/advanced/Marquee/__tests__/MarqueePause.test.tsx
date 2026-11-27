// packages/components/src/advanced/Marquee/__tests__/MarqueePause.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import MarqueeContent from '../MarqueeContent';

const css = readFileSync(resolve(__dirname, '../Marquee.css'), 'utf-8');

function container(props: { pauseOnHover?: boolean; pauseOnFocusWithin?: boolean }) {
  const host = document.createElement('div');
  host.innerHTML = renderToString(
    <MarqueeContent items={['a', 'b']} renderItem={(item) => item} {...props} />
  );
  return host.querySelector<HTMLElement>('[role="region"]')!;
}

// Regression: the props set Tailwind-style classes (`group`, `focus-within:group`)
// that no CSS matched as intended; pauseOnFocusWithin alone never paused.
describe('Marquee pause hooks', () => {
  it('each prop sets its own hook, read by Marquee.css', () => {
    expect(css).toContain('[data-marquee-pause-hover]:hover &');
    expect(css).toContain('[data-marquee-pause-focus]:focus-within &');
  });

  it('pauseOnFocusWithin alone marks focus only', () => {
    const el = container({ pauseOnHover: false, pauseOnFocusWithin: true });
    expect(el.hasAttribute('data-marquee-pause-focus')).toBe(true);
    expect(el.hasAttribute('data-marquee-pause-hover')).toBe(false);
  });

  it('pauseOnHover alone marks hover only', () => {
    const el = container({ pauseOnHover: true, pauseOnFocusWithin: false });
    expect(el.hasAttribute('data-marquee-pause-hover')).toBe(true);
    expect(el.hasAttribute('data-marquee-pause-focus')).toBe(false);
  });

  it('sets no Tailwind-style class', () => {
    const el = container({});
    expect(el.className).not.toMatch(/\bgroup\b|focus-within:/);
  });
});
