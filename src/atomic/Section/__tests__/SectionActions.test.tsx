// packages/components/src/atomic/Section/__tests__/SectionActions.test.tsx

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import Section from '../index';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];

afterEach(() => {
  act(() => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.replaceChildren();
});

describe('Section actions', () => {
  it('absent: no header row or actions wrapper', () => {
    const html = renderToString(<Section title="Usage">Body</Section>);
    expect(html).not.toContain('dndev-section-header');
    expect(html).not.toContain('dndev-section-actions');
  });

  it('present: rendered after the heading in the title row', () => {
    const html = renderToString(
      <Section title="Usage" titleAs="h3" actions={<a href="#all">All</a>}>
        Body
      </Section>
    );
    expect(html).toMatch(
      /<div class="dndev-section-header"[^>]*><h3[^>]*dndev-section-title[^>]*>Usage<\/h3><div class="dndev-section-actions"><a href="#all">All<\/a><\/div><\/div>/
    );
  });

  it('without title: the row holds only the actions', () => {
    const html = renderToString(
      <Section actions={<a href="#all">All</a>}>Body</Section>
    );
    expect(html).toMatch(
      /<div class="dndev-section-header"[^>]*><div class="dndev-section-actions"><a href="#all">All<\/a><\/div><\/div>/
    );
    expect(html).not.toContain('dndev-section-title');
  });

  it('collapsible: the action is outside the trigger, does not toggle, aria-expanded kept', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    roots.push(root);
    act(() =>
      root.render(
        <Section title="Usage" collapsible actions={<a href="#all">All</a>}>
          Body
        </Section>
      )
    );
    const trigger = container.querySelector<HTMLButtonElement>('.dndev-section-title-trigger')!;
    const action = container.querySelector<HTMLAnchorElement>('.dndev-section-actions a')!;
    expect(trigger.contains(action)).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    act(() => action.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    act(() => trigger.click());
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});
