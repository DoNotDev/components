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

describe('Accordion closed content', () => {
  it.each(['single', 'multiple'] as const)('is in the server HTML (%s)', (type) => {
    const html = renderToString(<Accordion type={type} items={items} />);
    expect(html).toContain('Usage text');
    expect(html).toContain('Aqua, Glycerin');
    expect(html.match(/data-state="closed"[^>]*role="region"/g)).toHaveLength(2);
  });

  it('is hidden by CSS while closed (display:none: not focusable, not announced)', () => {
    const { contents } = mount();
    expect(contents).toHaveLength(2);
    for (const content of contents) {
      expect(content.getAttribute('data-state')).toBe('closed');
      expect(getComputedStyle(content).display).toBe('none');
    }
  });

  it('toggles one item at a time', () => {
    const { contents, triggers } = mount();
    act(() => triggers[0].click());
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(getComputedStyle(contents[0]).display).not.toBe('none');
    expect(getComputedStyle(contents[1]).display).toBe('none');
    act(() => triggers[1].click());
    expect(getComputedStyle(contents[0]).display).toBe('none');
    expect(getComputedStyle(contents[1]).display).not.toBe('none');
    act(() => triggers[1].click());
    expect(getComputedStyle(contents[1]).display).toBe('none');
  });
});
