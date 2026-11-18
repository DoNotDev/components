import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SwipeAction from '../index';

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let host: HTMLDivElement;
const onAction = vi.fn(() => {});

afterEach(() => {
  if (root) act(() => root.unmount());
  host?.remove(); onAction.mockClear();
});
function update(disabled = false) {
  act(() => root.render(<SwipeAction onAction={onAction} actionLabel="Remove item"
    disabled={disabled}>
    <p>Cart item</p><input aria-label="Quantity" /><a href="#item">Item</a>
  </SwipeAction>));
}
function mount(dir = 'ltr') {
  host = document.createElement('div'); host.tabIndex = -1;
  document.body.append(host); root = createRoot(host); update();
  // happy-dom has no layout/native scrolling: model geometry, test state only.
  Object.defineProperties(viewport(), { scrollWidth: { value: 388 }, clientWidth: { value: 300 } });
  viewport().style.direction = dir;
}
function viewport() { return host.querySelector<HTMLDivElement>('.dndev-swipe-action-viewport')!; }
function action() { return host.querySelector<HTMLButtonElement>('.dndev-swipe-action-delete')!; }
function click(element: HTMLElement) { act(() => element.click()); }
function scroll(offset: number) {
  act(() => { viewport().scrollLeft = offset; viewport().dispatchEvent(new Event('scroll')); });
}
function exposed(expected: boolean) {
  expect(host.querySelector('.dndev-swipe-action')!.hasAttribute('data-open')).toBe(expected);
  expect(action().getAttribute('aria-hidden')).toBe(String(!expected));
  expect(action().hasAttribute('inert')).toBe(!expected);
  expect(action().disabled).toBe(!expected);
  expect(action().tabIndex).toBe(expected ? 0 : -1);
}
describe('SwipeAction native scroll state', () => {
  it('renders SSR closed with no reveal toggle', () => {
    const html = renderToString(<SwipeAction onAction={onAction} actionLabel="Remove">Item</SwipeAction>);
    expect(html).toContain('aria-hidden="true"'); expect(html).toContain('Remove');
    expect(html).not.toContain('dndev-swipe-action-toggle');
    expect(onAction).not.toHaveBeenCalled();
  });
  for (const dir of ['ltr', 'rtl']) {
    it(`synchronizes native scroll accessibility state in ${dir}, never deleting`, () => {
      mount(dir); exposed(false);
      scroll(dir === 'rtl' ? -40 : 40); exposed(false);
      scroll(dir === 'rtl' ? -88 : 88); exposed(true);
      scroll(0); exposed(false); expect(onAction).not.toHaveBeenCalled();
    });
    it(`swipe to the end enables the trash action in ${dir}; trash closes then fires`, () => {
      mount(dir); expect(host.querySelector('.dndev-swipe-action-toggle')).toBeNull();
      scroll(dir === 'rtl' ? -88 : 88); exposed(true);
      click(action()); exposed(false); expect(viewport().scrollLeft).toBe(0);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  }
  it('closed and partially revealed actions cannot activate or enter tab order', () => {
    mount();
    for (const offset of [0, 30, 60, 0]) {
      scroll(offset); exposed(false);
      click(action());
      expect(onAction).not.toHaveBeenCalled();
    }
  });
  it('Escape closes, content focus closes without stealing it', () => {
    mount(); scroll(88); exposed(true);
    act(() => { action().focus(); action().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    exposed(false); expect(viewport().scrollLeft).toBe(0);
    scroll(88); const input = host.querySelector('input')!;
    act(() => input.focus()); exposed(false);
    expect(document.activeElement).toBe(input); expect(viewport().scrollLeft).toBe(0);
  });
  it('disabled resets scroll and does not reopen when enabled again', () => {
    mount(); scroll(88); update(true); exposed(false);
    expect(viewport().scrollLeft).toBe(0);
    click(action()); update(false); exposed(false); expect(onAction).not.toHaveBeenCalled();
  });
  it('classifies actual pointer input without measuring or capturing movement', () => {
    mount();
    for (const pointerType of ['mouse', 'pen', '', 'touch']) {
      act(() => viewport().dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType })));
      expect(viewport().hasAttribute('data-input-blocked')).toBe(pointerType !== 'touch');
      exposed(false);
    }
  });
  it('excludes horizontal wheels but leaves vertical scrolling and zoom native', () => {
    mount();
    for (const [deltaX, deltaY, shiftKey, ctrlKey, blocked] of [
      [90, 0, false, false, true], [0, 90, true, false, true],
      [0, 90, false, false, false], [90, 0, false, true, false],
    ] as const) {
      const event = new WheelEvent('wheel', { cancelable: true, deltaX, deltaY });
      // happy-dom WheelEvent does not initialize modifier keys.
      Object.defineProperties(event, { shiftKey: { value: shiftKey }, ctrlKey: { value: ctrlKey } });
      viewport().dispatchEvent(event); expect(event.defaultPrevented).toBe(blocked);
    }
  });
});
