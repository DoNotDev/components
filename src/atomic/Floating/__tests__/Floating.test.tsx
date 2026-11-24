// packages/components/src/atomic/Floating/__tests__/Floating.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Floating from '../index';
import type { FloatingPlacement } from '../index';

// DOM from the vitest environment; act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let root: Root | undefined;
let host: HTMLDivElement;

beforeEach(() => {
  host = document.createElement('div');
  document.body.append(host);
});

afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  host.remove();
  vi.restoreAllMocks();
});

function control() {
  return document.body.querySelector<HTMLDivElement>('.dndev-floating-control');
}

function Page({ placement }: { placement?: FloatingPlacement }) {
  return (
    <>
      <Floating aria-label="Navigation" placement={placement}>
        <a href="/catalogue">Back</a>
      </Floating>
      <p>Product</p>
    </>
  );
}

describe('Floating, top placements (in place, sticky)', () => {
  it('renders in place in the server HTML', () => {
    expect(renderToString(<Page />)).toBe(
      '<div aria-label="Navigation" class="dndev-floating-control" data-placement="top-start"><a href="/catalogue">Back</a></div><p>Product</p>'
    );
    expect(renderToString(<Floating placement="top-end">Help</Floating>)).toBe(
      '<div class="dndev-floating-control" data-placement="top-end">Help</div>'
    );
  });

  it('hydrates server HTML without a mismatch, staying in place', () => {
    host.innerHTML = renderToString(<Page />);
    const ssr = host.querySelector('.dndev-floating-control');
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      root = hydrateRoot(host, <Page />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(control()).toBe(ssr);
    expect(control()!.parentElement).toBe(host);
    expect(host.firstElementChild).toBe(control());
  });

  it('defaults to top-start, with its content and passthrough attributes', () => {
    root = createRoot(host);
    act(() =>
      root!.render(
        <Floating className="extra" aria-label="Navigation" id="back">
          <a href="/catalogue">Back</a>
        </Floating>
      )
    );
    const el = control()!;
    expect(el.parentElement).toBe(host);
    expect(el.getAttribute('data-placement')).toBe('top-start');
    expect(el.className).toBe('dndev-floating-control extra');
    expect(el.getAttribute('aria-label')).toBe('Navigation');
    expect(el.id).toBe('back');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/catalogue');
  });
});

describe('Floating, bottom placements (fixed, portalled)', () => {
  it('renders nothing on the server', () => {
    expect(renderToString(<Page placement="bottom-end" />)).toBe('<p>Product</p>');
    expect(renderToString(<Floating placement="bottom-start">Help</Floating>)).toBe('');
  });

  it('hydrates without a mismatch, then mounts into <body>', () => {
    host.innerHTML = renderToString(<Page placement="bottom-end" />);
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      root = hydrateRoot(host, <Page placement="bottom-end" />);
    });
    expect(errors).not.toHaveBeenCalled();
    expect(control()!.parentElement).toBe(document.body);
    expect(host.contains(control())).toBe(false);
    expect(control()!.getAttribute('data-placement')).toBe('bottom-end');
    expect(control()!.textContent).toBe('Back');
  });

  it('unmounts from <body>', () => {
    root = createRoot(host);
    act(() => root!.render(<Floating placement="bottom-start">Help</Floating>));
    expect(control()!.parentElement).toBe(document.body);
    act(() => root!.unmount());
    root = undefined;
    expect(control()).toBeNull();
  });
});

describe('Floating CSS contract', () => {
  const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');
  const css = strip(readFileSync(resolve(__dirname, '../Floating.css'), 'utf-8'));
  const sectionCss = strip(
    readFileSync(resolve(__dirname, '../../Section/Section.css'), 'utf-8')
  );

  it('sits on the header layer; logical properties only; no :has() (Safari 14.1)', () => {
    expect(css).toContain('z-index: var(--z-header)');
    expect(css).not.toMatch(/(^|[\s;{])(left|right|top|bottom|width|height|margin-top|margin-bottom)\s*:/m);
    expect(css).not.toMatch(/:has\(/);
  });

  it('gutter is the Section gutter: --section-gutter, the one Section pads its content with', () => {
    expect(css).toMatch(
      /\.dndev-floating-control \{\s*--floating-control-gutter: var\(--section-gutter\);/
    );
    expect(sectionCss).toMatch(
      /\.dndev-section-content \{[^}]*padding-inline: var\(--section-gutter\);/
    );
  });

  it('top placements: sticky --gap-md below the scroll container top, --gap-md above and below, own width', () => {
    expect(css).toMatch(
      /\[data-placement\^='top'\] \{\s*--floating-control-inline-offset: var\(--floating-control-gutter\);\s*position: sticky;\s*inset-block-start: var\(--gap-md\);\s*inline-size: fit-content;\s*margin-block: var\(--gap-md\);\s*\}/
    );
  });

  it('top placements line up with the Section content edge inside PageContainer (which pads --gap-md)', () => {
    expect(css).toMatch(
      /\.dndev-container > \.dndev-floating-control\[data-placement\^='top'\] \{\s*--floating-control-inline-offset: calc\(\s*var\(--floating-control-gutter\) - var\(--gap-md\)\s*\);/
    );
    expect(css).toMatch(
      /\[data-placement='top-start'\] \{\s*margin-inline: var\(--floating-control-inline-offset\) auto;/
    );
    expect(css).toMatch(
      /\[data-placement='top-end'\] \{\s*margin-inline: auto var\(--floating-control-inline-offset\);/
    );
  });

  it('a ghost Section right after a top Floating drops its own top padding', () => {
    expect(sectionCss).toMatch(
      /\.dndev-floating-control\[data-placement\^='top'\]\s*\+\s*\.dndev-section-full-width\[data-tone='ghost'\]\s*>\s*\.dndev-section-content\s*\{\s*padding-top:\s*0;\s*\}/
    );
  });

  it('bottom placements are fixed, clear the ActionBar or the bottom safe area', () => {
    expect(css).toMatch(
      /\[data-placement\^='bottom'\] \{[^}]*position: fixed;\s*inset-block-end: calc\(\s*var\(--gap-md\) \+\s*max\(var\(--action-bar-height, 0px\), env\(safe-area-inset-bottom, 0px\)\)\s*\);/
    );
    expect(css).toMatch(
      /--floating-control-fixed-gutter: max\(\s*var\(--floating-control-gutter\),\s*env\(safe-area-inset-left, 0px\),\s*env\(safe-area-inset-right, 0px\)\s*\);/
    );
    expect(css).toMatch(
      /\[data-placement='bottom-start'\] \{\s*inset-inline-start: calc\(\s*var\(--sidebar-width, 0px\) \+ var\(--floating-control-fixed-gutter\)\s*\);/
    );
    expect(css).toMatch(
      /\[data-placement='bottom-end'\] \{\s*inset-inline-end: var\(--floating-control-fixed-gutter\);/
    );
  });
});
