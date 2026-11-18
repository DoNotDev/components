// @vitest-environment jsdom
// packages/components/src/atomic/Card/__tests__/CardOnClick.test.tsx

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, it, expect, vi } from 'vitest';

import Card from '../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

let container: HTMLElement | null = null;

function mount(node: React.ReactElement): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container as HTMLElement).render(node);
  });
  return container.querySelector('[data-role="card"]') as HTMLElement;
}

function press(el: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => {
    el.dispatchEvent(event);
  });
  return event;
}

afterEach(() => {
  container?.remove();
  container = null;
});

describe('Card onClick keyboard access', () => {
  it('has role=button and tabindex=0 with onClick', () => {
    const card = mount(<Card title="P" onClick={() => {}} />);
    expect(card.getAttribute('role')).toBe('button');
    expect(card.getAttribute('tabindex')).toBe('0');
  });

  it('has neither without onClick', () => {
    const card = mount(<Card title="P" />);
    expect(card.hasAttribute('role')).toBe(false);
    expect(card.hasAttribute('tabindex')).toBe(false);
  });

  it('has neither with href', () => {
    const card = mount(<Card title="P" href="/p" onClick={() => {}} />);
    expect(card.hasAttribute('role')).toBe(false);
    expect(card.hasAttribute('tabindex')).toBe(false);
  });

  it('Enter calls onClick', () => {
    const onClick = vi.fn();
    const card = mount(<Card title="P" onClick={onClick} />);
    press(card, 'Enter');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('Space calls onClick and prevents page scroll', () => {
    const onClick = vi.fn();
    const card = mount(<Card title="P" onClick={onClick} />);
    const event = press(card, ' ');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores keys from a nested input', () => {
    const onClick = vi.fn();
    const card = mount(
      <Card title="P" onClick={onClick}>
        <input aria-label="qty" />
      </Card>
    );
    press(card.querySelector('input') as HTMLInputElement, 'Enter');
    press(card.querySelector('input') as HTMLInputElement, ' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls the consumer onKeyDown', () => {
    const onKeyDown = vi.fn();
    const onClick = vi.fn();
    const card = mount(
      <Card title="P" onClick={onClick} onKeyDown={onKeyDown} />
    );
    press(card, 'Enter');
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('skips onClick when the consumer prevents default', () => {
    const onClick = vi.fn();
    const card = mount(
      <Card title="P" onClick={onClick} onKeyDown={(e) => e.preventDefault()} />
    );
    press(card, 'Enter');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies to asChild too', () => {
    const onClick = vi.fn();
    const card = mount(
      <Card asChild onClick={onClick}>
        <section>x</section>
      </Card>
    );
    expect(card.getAttribute('role')).toBe('button');
    press(card, 'Enter');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
