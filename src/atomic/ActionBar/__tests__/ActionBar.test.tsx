// packages/components/src/atomic/ActionBar/__tests__/ActionBar.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act, createRef } from 'react';
import type { RefObject } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ActionBar from '../index';

// DOM from the vitest environment; act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void;
const observers: {
  callback: Callback;
  targets: Element[];
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];

class MockIntersectionObserver {
  callback: Callback;
  targets: Element[] = [];
  disconnect = vi.fn();
  constructor(callback: Callback) {
    this.callback = callback;
    observers.push(this);
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}

const resizeObservers: {
  callback: () => void;
  targets: Element[];
  disconnect: ReturnType<typeof vi.fn>;
}[] = [];

class MockResizeObserver {
  callback: () => void;
  targets: Element[] = [];
  disconnect = vi.fn();
  constructor(callback: () => void) {
    this.callback = callback;
    resizeObservers.push(this);
  }
  observe(target: Element) {
    this.targets.push(target);
  }
  unobserve() {}
}

let root: Root | undefined;
let host: HTMLDivElement;

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  host.remove();
  observers.length = 0;
  resizeObservers.length = 0;
  document.documentElement.style.removeProperty('--action-bar-height');
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function bar() {
  return document.body.querySelector<HTMLDivElement>('.dndev-action-bar');
}

function expectShown(shown: boolean) {
  const el = bar()!;
  expect(el.hasAttribute('data-open')).toBe(shown);
  expect(el.hasAttribute('inert')).toBe(!shown);
  expect(el.getAttribute('aria-hidden')).toBe(shown ? null : 'true');
}

function intersect(entry: { isIntersecting: boolean; bottom: number }) {
  act(() =>
    observers[0]!.callback([
      {
        isIntersecting: entry.isIntersecting,
        boundingClientRect: { bottom: entry.bottom } as DOMRectReadOnly,
      },
    ])
  );
}

function reservedHeight() {
  return document.documentElement.style.getPropertyValue('--action-bar-height');
}

/** The bar's border-box height is `height` (0 = display: none), then ResizeObserver reports. */
function resize(height: number) {
  vi.spyOn(bar()!, 'offsetHeight', 'get').mockReturnValue(height);
  act(() => resizeObservers.at(-1)!.callback());
}

function Page({ card }: { card: RefObject<HTMLDivElement | null> }) {
  return (
    <>
      <div ref={card}>Buy card</div>
      <ActionBar revealAfter={card} hideFrom="laptop" aria-label="Buy">
        <button type="button">Add</button>
      </ActionBar>
    </>
  );
}

describe('ActionBar', () => {
  it('renders nothing on the server (hidden), whatever the props', () => {
    expect(renderToString(<ActionBar>Bar</ActionBar>)).toBe('');
    expect(renderToString(<Page card={createRef<HTMLDivElement>()} />)).toBe(
      '<div>Buy card</div>'
    );
    expect(reservedHeight()).toBe('');
  });

  it('hydrates server HTML without a mismatch, then mounts hidden into <body>', () => {
    const card = createRef<HTMLDivElement>();
    host.innerHTML = renderToString(<Page card={card} />);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      root = hydrateRoot(host, <Page card={card} />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(bar()!.parentElement).toBe(document.body);
    expectShown(false);
    expect(resizeObservers).toHaveLength(0);
    expect(reservedHeight()).toBe('');
  });

  it('without revealAfter is always shown, with its content and passthrough attributes', () => {
    root = createRoot(host);
    act(() =>
      root!.render(
        <ActionBar className="extra" role="region" aria-label="Buy">
          <button type="button">Add</button>
        </ActionBar>
      )
    );
    expectShown(true);
    expect(bar()!.className).toBe('dndev-action-bar extra');
    expect(bar()!.getAttribute('role')).toBe('region');
    expect(bar()!.getAttribute('aria-label')).toBe('Buy');
    expect(bar()!.hasAttribute('data-hide-from')).toBe(false);
    expect(bar()!.textContent).toBe('Add');
    expect(observers).toHaveLength(0);
  });

  it('hideFrom sets the breakpoint attribute the CSS hides from', () => {
    root = createRoot(host);
    act(() => root!.render(<ActionBar hideFrom="tablet">Bar</ActionBar>));
    expect(bar()!.getAttribute('data-hide-from')).toBe('tablet');
  });

  it('revealAfter: shown only once the element has scrolled up out of view', () => {
    vi.stubGlobal('innerHeight', 800);
    const card = createRef<HTMLDivElement>();
    root = createRoot(host);
    act(() => root!.render(<Page card={card} />));
    expect(observers).toHaveLength(1);
    expect(observers[0]!.targets).toEqual([card.current]);
    expectShown(false);

    intersect({ isIntersecting: true, bottom: 500 }); // visible
    expectShown(false);
    intersect({ isIntersecting: false, bottom: -20 }); // scrolled past
    expectShown(true);
    intersect({ isIntersecting: false, bottom: 60 }); // clipped under a header by <main>
    expectShown(true);
    intersect({ isIntersecting: true, bottom: 120 }); // back in view
    expectShown(false);
    intersect({ isIntersecting: false, bottom: 1400 }); // not reached yet (below)
    expectShown(false);

    const { disconnect } = observers[0]!;
    act(() => root!.unmount());
    root = undefined;
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(bar()).toBeNull();
  });

  it('reserves its measured height on <html> only while shown', () => {
    vi.stubGlobal('innerHeight', 800);
    const card = createRef<HTMLDivElement>();
    root = createRoot(host);
    act(() => root!.render(<Page card={card} />));
    expect(resizeObservers).toHaveLength(0); // hidden: nothing measured or reserved
    expect(reservedHeight()).toBe('');

    intersect({ isIntersecting: false, bottom: -20 }); // scrolled past: shown
    expect(resizeObservers).toHaveLength(1);
    expect(resizeObservers[0]!.targets).toEqual([bar()]);
    resize(64);
    expect(reservedHeight()).toBe('64px');
    resize(88); // content or safe area grew
    expect(reservedHeight()).toBe('88px');
    resize(0); // display: none (hideFrom): nothing to reserve
    expect(reservedHeight()).toBe('');
    resize(64);
    expect(reservedHeight()).toBe('64px');

    intersect({ isIntersecting: true, bottom: 120 }); // back in view: hidden
    expect(resizeObservers[0]!.disconnect).toHaveBeenCalledTimes(1);
    expect(reservedHeight()).toBe('');

    intersect({ isIntersecting: false, bottom: -20 }); // shown again, then unmounted
    resize(64);
    expect(reservedHeight()).toBe('64px');
    act(() => root!.unmount());
    root = undefined;
    expect(resizeObservers[1]!.disconnect).toHaveBeenCalledTimes(1);
    expect(reservedHeight()).toBe('');
  });

  it('without revealAfter reserves its height once the portal has mounted it', () => {
    root = createRoot(host);
    act(() => root!.render(<ActionBar>Bar</ActionBar>));
    expect(resizeObservers).toHaveLength(1);
    expect(resizeObservers[0]!.targets).toEqual([bar()]);
    resize(56);
    expect(reservedHeight()).toBe('56px');
    act(() => root!.unmount());
    root = undefined;
    expect(reservedHeight()).toBe('');
  });
});

describe('ActionBar CSS contract', () => {
  const css = readFileSync(resolve(__dirname, '../ActionBar.css'), 'utf-8');

  it('is fixed at the bottom with logical insets, safe area and z-index token', () => {
    expect(css).toContain('position: fixed');
    expect(css).toContain('inset-inline: 0');
    expect(css).toContain('inset-block-end: 0');
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('z-index: var(--z-header)');
    expect(css).not.toMatch(/(^|[\s;{])(left|right|top|bottom)\s*:/m);
  });

  it('hides with visibility (not focusable) and drops the slide under reduced motion', () => {
    expect(css).toMatch(/\.dndev-action-bar \{[^}]*visibility: hidden/);
    expect(css).toMatch(/\[data-open\] \{[^}]*visibility: visible/);
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition: none/
    );
  });

  it('hides from each breakpoint threshold', () => {
    for (const [name, px] of [
      ['tablet', 768],
      ['laptop', 1024],
      ['desktop', 1440],
    ] as const) {
      expect(css).toMatch(
        new RegExp(
          `@media \\(min-width: ${px}px\\) \\{\\s*\\.dndev-action-bar\\[data-hide-from='${name}'\\] \\{\\s*display: none;`
        )
      );
    }
  });
});
