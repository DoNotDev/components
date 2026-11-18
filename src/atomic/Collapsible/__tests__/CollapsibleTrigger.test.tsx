// packages/components/src/atomic/Collapsible/__tests__/CollapsibleTrigger.test.tsx

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';

import Collapsible from '../index';

describe('Collapsible trigger', () => {
  it('wraps a string trigger in a <button> instead of crashing', () => {
    const html = renderToStaticMarkup(
      <Collapsible trigger="Show details">Body</Collapsible>
    );
    expect(html).toMatch(
      /<button[^>]*type="button"[^>]*class="dndev-collapsible-trigger dndev-collapsible-trigger--button"[^>]*>Show details<\/button>/
    );
  });

  it('wraps a fragment trigger in a <button>', () => {
    const html = renderToStaticMarkup(
      <Collapsible trigger={<>A B</>}>Body</Collapsible>
    );
    expect(html).toMatch(/<button[^>]*>A B<\/button>/);
  });

  it('uses a single element trigger as the trigger itself', () => {
    const html = renderToStaticMarkup(
      <Collapsible trigger={<a href="#x">Open</a>}>Body</Collapsible>
    );
    expect(html).toMatch(/<a[^>]*href="#x"[^>]*aria-expanded="false"[^>]*>Open<\/a>/);
    expect(html).not.toContain('<button');
  });
});

describe('Collapsible trigger with showIcon', () => {
  it('renders a keyboard-reachable <button> around the label and icon', () => {
    const html = renderToStaticMarkup(
      <Collapsible trigger={<span>Details</span>} showIcon iconStyle="chevron">
        Body
      </Collapsible>
    );
    expect(html).toMatch(/<button[^>]*type="button"[^>]*aria-expanded="false"/);
    expect(html).toMatch(/<button[^>]*>.*<span>Details<\/span>.*<svg/);
    expect(html).not.toMatch(/<div[^>]*dndev-collapsible-trigger/);
  });
});
