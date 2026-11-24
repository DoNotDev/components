// packages/components/src/atomic/Collapsible/__tests__/CollapsibleClosedContent.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import Collapsible from '../index';

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];

beforeAll(() => {
  // The real stylesheet: closed content is hidden by CSS, not unmounted.
  const style = document.createElement('style');
  style.textContent = readFileSync(resolve(__dirname, '../Collapsible.css'), 'utf-8');
  document.head.append(style);
});

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

function mount(defaultOpen = false) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() =>
    root.render(
      <Collapsible trigger="Details" defaultOpen={defaultOpen}>
        <a href="#usage">Usage text</a>
      </Collapsible>
    )
  );
  const content = container.querySelector<HTMLElement>('.dndev-collapsible-content')!;
  const trigger = container.querySelector<HTMLButtonElement>('button')!;
  return { content, trigger };
}

describe('Collapsible closed content', () => {
  it('is in the server HTML (crawlable), marked closed', () => {
    const html = renderToString(<Collapsible trigger="Details">Usage text</Collapsible>);
    expect(html).toMatch(/<div[^>]*data-state="closed"[^>]*class="dndev-collapsible-content"[^>]*>Usage text<\/div>/);
  });

  it('is hidden by CSS while closed (display:none: not focusable, not announced)', () => {
    const { content } = mount();
    expect(content.textContent).toBe('Usage text');
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(getComputedStyle(content).display).toBe('none');
  });

  it('toggles: open shows the content, close hides it again', () => {
    const { content, trigger } = mount();
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(getComputedStyle(content).display).not.toBe('none');
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(getComputedStyle(content).display).toBe('none');
    expect(content.textContent).toBe('Usage text');
  });
});
