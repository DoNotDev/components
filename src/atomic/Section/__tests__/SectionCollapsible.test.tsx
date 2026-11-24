// packages/components/src/atomic/Section/__tests__/SectionCollapsible.test.tsx

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import Section from '../index';

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];

beforeAll(() => {
  // Closed content is hidden by the Collapsible stylesheet (content class), not unmounted.
  const style = document.createElement('style');
  style.textContent = readFileSync(resolve(__dirname, '../../Collapsible/Collapsible.css'), 'utf-8');
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
  act(() =>
    root.render(
      <Section title="Usage" titleAs="h3" collapsible>
        <a href="#apply">Apply on damp skin</a>
      </Section>
    )
  );
  const trigger = container.querySelector<HTMLButtonElement>('.dndev-section-title-trigger')!;
  const content = container.querySelector<HTMLElement>('.dndev-collapsible-content')!;
  return { trigger, content };
}

describe('Section collapsible', () => {
  it('keeps closed content in the server HTML (crawlable)', () => {
    const html = renderToString(
      <Section title="Usage" collapsible>
        Apply on damp skin
      </Section>
    );
    expect(html).toMatch(/<div[^>]*data-state="closed"[^>]*class="dndev-collapsible-content"[^>]*>Apply on damp skin<\/div>/);
  });

  it('renders the trigger as a <button> inside the title heading (disclosure pattern)', () => {
    const html = renderToString(
      <Section title="Usage" titleAs="h3" collapsible>
        Body
      </Section>
    );
    expect(html).toMatch(/<h3[^>]*class="[^"]*dndev-section-title[^"]*"[^>]*><button[^>]*type="button"[^>]*aria-expanded="false"[^>]*>Usage<svg/);
    expect(html).not.toMatch(/<div[^>]*dndev-section-title-trigger/);
  });

  it('trigger is focusable; closed content is display:none (not focusable)', () => {
    const { trigger, content } = mount();
    expect(trigger.tagName).toBe('BUTTON');
    expect(trigger.disabled).toBe(false);
    act(() => trigger.focus());
    expect(document.activeElement).toBe(trigger);
    expect(content.getAttribute('data-state')).toBe('closed');
    expect(getComputedStyle(content).display).toBe('none');
  });

  it('toggles, with aria-expanded and aria-controls on the button', () => {
    const { trigger, content } = mount();
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(content.id);
    expect(getComputedStyle(content).display).not.toBe('none');
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(getComputedStyle(content).display).toBe('none');
  });

  it('is a native enabled type="button" in the tab order (Enter/Space activate it natively)', () => {
    // happy-dom does not synthesize native keyboard activation; Enter/Space -> click is
    // the platform's job for a real <button> (checked in Chromium with Playwright).
    const { trigger } = mount();
    expect(trigger).toBeInstanceOf(HTMLButtonElement);
    expect(trigger.type).toBe('button');
    expect(trigger.tabIndex).toBe(0);
    expect(trigger.hasAttribute('tabindex')).toBe(false);
  });
});
