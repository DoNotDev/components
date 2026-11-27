// packages/components/src/atomic/Accordion/__tests__/AccordionClosedContent.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import Accordion from '../index';

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
const items = [
  { value: 'usage', trigger: 'Usage', content: 'Usage text' },
  { value: 'inci', trigger: 'INCI', content: 'Aqua, Glycerin' },
];

beforeAll(() => {
  // The real stylesheet: closed content is hidden by CSS, not unmounted.
  const style = document.createElement('style');
  style.textContent = readFileSync(resolve(__dirname, '../Accordion.css'), 'utf-8');
  document.head.append(style);
});

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

function mount() {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(<Accordion type="single" collapsible items={items} />));
  const contents = [...container.querySelectorAll<HTMLElement>('[role="region"]')];
  const triggers = [...container.querySelectorAll<HTMLButtonElement>('button')];
  return { contents, triggers };
}

/** Visibility of a region's collapse layer (the element the CSS hides). */
const shown = (content: HTMLElement) =>
  getComputedStyle(
    content.querySelector<HTMLElement>(':scope > .dndev-accordion-content-grid')!
  ).visibility;

describe('Accordion closed content', () => {
  it.each(['single', 'multiple'] as const)('is in the server HTML (%s)', (type) => {
    const html = renderToString(<Accordion type={type} items={items} />);
    expect(html).toContain('Usage text');
    expect(html).toContain('Aqua, Glycerin');
    expect(html.match(/data-state="closed"[^>]*role="region"/g)).toHaveLength(2);
  });

  it('is collapsed and hidden by CSS while closed (visibility:hidden: not focusable, not announced)', () => {
    const { contents } = mount();
    expect(contents).toHaveLength(2);
    for (const content of contents) {
      expect(content.getAttribute('data-state')).toBe('closed');
      const grid = content.querySelector<HTMLElement>(':scope > .dndev-accordion-content-grid')!;
      expect(getComputedStyle(grid).visibility).toBe('hidden');
      expect(getComputedStyle(grid).gridTemplateRows).toBe('0fr');
    }
  });

  it('toggles one item at a time', () => {
    const { contents, triggers } = mount();
    act(() => triggers[0].click());
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(shown(contents[0])).not.toBe('hidden');
    expect(shown(contents[1])).toBe('hidden');
    act(() => triggers[1].click());
    expect(shown(contents[0])).toBe('hidden');
    expect(shown(contents[1])).not.toBe('hidden');
    act(() => triggers[1].click());
    expect(shown(contents[1])).toBe('hidden');
  });
});
