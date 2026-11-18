import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(__dirname, '../SwipeAction.css'), 'utf-8');
const source = readFileSync(resolve(__dirname, '../index.tsx'), 'utf-8');

describe('SwipeAction native styling contract', () => {
  it('delegates scrolling/snapping/pinch to the browser, with no custom gesture engine', () => {
    expect(css).toContain('overflow-x: auto');
    expect(css).toContain('scroll-snap-type: x mandatory');
    expect(css).toContain('touch-action: pan-x pan-y pinch-zoom');
    expect(css).toContain('touch-action: pan-y pinch-zoom');
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*scroll-behavior: auto/);
    expect(css).not.toContain('transform:');
    for (const obsolete of ['onPointerMove', 'onPointerUp', 'touchmove', 'setPointerCapture', 'swipeProgress']) {
      expect(source).not.toContain(obsolete);
    }
  });
  it('lets native clipping progressively reveal paint without endpoint visibility gating', () => {
    expect(css).not.toContain('visibility:');
    expect(css).not.toContain('opacity:');
    expect(css).not.toMatch(/\.dndev-swipe-action-delete\s*\{[^}]*display:\s*none/);
    expect(source).toContain('aria-hidden={!revealed}');
    expect(source).toContain('inert={!revealed}');
    expect(source).toContain('tabIndex={revealed ? 0 : -1}');
    expect(source).toContain('disabled={disabled || !revealed}');
  });
  it('uses destructive tokens, touch targets and logical layout for RTL', () => {
    expect(css).toContain('var(--destructive)');
    expect(css).toContain('var(--destructive-foreground)');
    expect(css).toContain('min-inline-size: 44px');
    expect(css).toContain('min-block-size: 44px');
    expect(css).toContain('scroll-snap-align: start');
    expect(css).toContain('scroll-snap-align: end');
    expect(css).toContain('outline: 2px solid var(--ring)');
  });
  it('keeps wrapped labels in flow and scopes interactive exclusion within content', () => {
    expect(css).toContain('overflow-wrap: anywhere');
    expect(css).not.toContain('position: absolute');
    expect(css).toContain('.dndev-swipe-action-content :is(');
    expect(css).toContain('[tabindex]');
  });
});
