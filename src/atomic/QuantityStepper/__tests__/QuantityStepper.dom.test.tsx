import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import QuantityStepper from '../index';
import type { QuantityStepperProps } from '../index';

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
const labels = { 'aria-label': 'Quantity of paper', decrementLabel: 'Remove a lot', incrementLabel: 'Add a lot' };

function mount(props: Partial<QuantityStepperProps> = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  let current = { ...labels, value: 3, ...props };
  const render = (next: Partial<QuantityStepperProps>) => {
    current = { ...current, ...next };
    act(() => root.render(<QuantityStepper {...current} />));
  };
  render({});
  return { container, render };
}

function element<T extends Element>(container: Element, selector: string): T {
  const node = container.querySelector<T>(selector);
  if (!node) throw new Error(`Missing ${selector}`);
  return node;
}
const inputOf = (container: Element) => element<HTMLInputElement>(container, 'input');
const plusOf = (container: Element) => element<HTMLButtonElement>(container, '.dndev-quantity-stepper-increment');
const minusOf = (container: Element) => element<HTMLButtonElement>(container, '.dndev-quantity-stepper-decrement');
function type(input: HTMLInputElement, text: string) {
  input.value = text;
  act(() => input.dispatchEvent(new Event('input', { bubbles: true })));
}
function key(input: HTMLInputElement, key: string) {
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));
}

afterEach(() => {
  act(() => { for (const root of roots.splice(0)) root.unmount(); });
  document.body.replaceChildren();
});

describe('QuantityStepper DOM', () => {
  it('preserves legacy callbacks, output, value click, and disabled directions', () => {
    const onIncrement = vi.fn(() => {});
    const onDecrement = vi.fn(() => {});
    const onValueClick = vi.fn(() => {});
    const { container, render } = mount({ onIncrement, onDecrement });
    expect(element(container, 'output').textContent).toBe('3');
    act(() => { plusOf(container).click(); minusOf(container).click(); });
    expect(onIncrement).toHaveBeenCalledTimes(1);
    expect(onDecrement).toHaveBeenCalledTimes(1);
    render({ onValueClick, valueLabel: 'Open cart' });
    act(() => element<HTMLButtonElement>(container, '[aria-label="Open cart"]').click());
    expect(onValueClick).toHaveBeenCalledTimes(1);
    render({ disabled: true });
    expect(plusOf(container).disabled).toBe(true);
    expect(minusOf(container).disabled).toBe(true);
    render({ disabled: false, onIncrement: undefined, onDecrement: undefined });
    expect(plusOf(container).disabled).toBe(true);
    expect(minusOf(container).disabled).toBe(true);
  });

  it('uses an uncontrolled named text spinbutton; typing never calls onChange', () => {
    const onChange = vi.fn((value: number) => value);
    const { container, render } = mount({ onChange, min: 3, step: 4, max: 14 });
    const input = inputOf(container);
    expect(input.type).toBe('text');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('role')).toBe('spinbutton');
    expect(input.getAttribute('aria-label')).toBe(labels['aria-label']);
    expect(input.getAttribute('aria-valuemin')).toBe('3');
    expect(input.getAttribute('aria-valuemax')).toBe('11');
    act(() => input.focus());
    type(input, '8');
    render({ className: 'unrelated-render' });
    expect(input.value).toBe('8');
    expect(onChange).not.toHaveBeenCalled();
    act(() => input.blur());
    expect(onChange).toHaveBeenCalledWith(11);
    render({ value: 11 });
    expect(input.value).toBe('11');
    expect(input.getAttribute('aria-valuenow')).toBe('11');
  });

  it('exposes the displayed draft to assistive technology without committing each keystroke', () => {
    const onChange = vi.fn((value: number) => value);
    const { container } = mount({ onChange, min: 3, step: 3, max: 30 });
    const input = inputOf(container);
    act(() => input.focus());
    type(input, '12');
    expect(input.getAttribute('aria-valuenow')).toBe('12');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
    type(input, '10');
    expect(input.getAttribute('aria-valuenow')).toBe('10');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    type(input, 'invalid');
    expect(input.hasAttribute('aria-valuenow')).toBe(false);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    key(input, 'Escape');
    expect(input.value).toBe('3');
    expect(input.getAttribute('aria-valuenow')).toBe('3');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    type(input, '999');
    key(input, 'Enter');
    expect(onChange).toHaveBeenCalledWith(30);
    expect(input.getAttribute('aria-valuenow')).toBe('3');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
  });

  it('commits Enter once, Escape reverts, malformed drafts never commit', () => {
    const onChange = vi.fn((value: number) => value);
    const { container } = mount({ onChange });
    const input = inputOf(container);
    act(() => input.focus());
    type(input, '25');
    key(input, 'Enter');
    act(() => input.blur());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(25);
    type(input, '99');
    key(input, 'Escape');
    expect(input.value).toBe('3');
    for (const text of ['', '-2', '1.5', '1e3', 'NaN', 'Infinity', '9007199254740992']) {
      type(input, text);
      key(input, 'Enter');
      expect(input.value).toBe('3');
    }
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  for (const direction of ['plus', 'minus'] as const) {
    it(`consumes a draft and ${direction} as one write before an asynchronous parent update`, () => {
      const onChange = vi.fn((value: number) => value);
      const { container, render } = mount({ onChange, min: 3, step: 3, max: 30 });
      const input = inputOf(container);
      const button = direction === 'plus' ? plusOf(container) : minusOf(container);
      act(() => input.focus());
      type(input, '12');
      // Keyboard navigation within the group must preserve, not commit, the draft.
      act(() => button.focus());
      expect(onChange).not.toHaveBeenCalled();
      expect(input.value).toBe('12');
      act(() => button.click());
      expect(onChange.mock.calls).toEqual([[direction === 'plus' ? 15 : 9]]);
      act(() => button.blur());
      expect(onChange).toHaveBeenCalledTimes(1);
      render({ value: direction === 'plus' ? 15 : 9 });
      expect(input.value).toBe(String(direction === 'plus' ? 15 : 9));
    });
  }

  it('keeps bound directions reachable while editing a replacement draft', () => {
    const onChange = vi.fn((value: number) => value);
    const { container } = mount({ onChange, value: 30, min: 3, step: 3, max: 30 });
    expect(plusOf(container).disabled).toBe(true);
    act(() => inputOf(container).focus());
    type(inputOf(container), '12');
    expect(plusOf(container).disabled).toBe(false);
    act(() => plusOf(container).click());
    expect(onChange.mock.calls).toEqual([[15]]);
  });

  it('supports arrows, pages, Home/End and editable callbacks take precedence', () => {
    const onIncrement = vi.fn(() => {});
    const onDecrement = vi.fn(() => {});
    const onValueClick = vi.fn(() => {});
    const onChange = vi.fn((value: number) => value);
    const { container, render } = mount({ onChange, onIncrement, onDecrement, onValueClick, min: 3, step: 4, max: 100, allowZero: true });
    const input = inputOf(container);
    for (const [name, expected] of [['ArrowUp', 7], ['ArrowDown', 0], ['PageUp', 43], ['PageDown', 0], ['Home', 0], ['End', 99]] as const) {
      key(input, name);
      expect(onChange).toHaveBeenLastCalledWith(expected);
    }
    act(() => plusOf(container).click());
    expect(onChange).toHaveBeenLastCalledWith(7);
    act(() => minusOf(container).click());
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(onIncrement).not.toHaveBeenCalled();
    expect(onDecrement).not.toHaveBeenCalled();
    expect(onValueClick).not.toHaveBeenCalled();
    render({ value: 99 });
    expect(plusOf(container).disabled).toBe(true);
    render({ value: 0 });
    expect(minusOf(container).disabled).toBe(true);
    act(() => plusOf(container).click());
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('keeps the plus node and focus stable when expanding/collapsing at zero', () => {
    const onChange = vi.fn((value: number) => value);
    const { container, render } = mount({ value: 0, onChange, allowZero: true, collapseWhenZero: true });
    const plus = plusOf(container);
    expect(plus.getAttribute('aria-label')).toBe('Add a lot');
    expect(inputOf(container).tabIndex).toBe(-1);
    expect(inputOf(container).getAttribute('aria-hidden')).toBe('true');
    act(() => plus.focus());
    render({ value: 3 });
    expect(plusOf(container)).toBe(plus);
    expect(document.activeElement).toBe(plus);
    expect(inputOf(container).tabIndex).toBe(0);
    expect(minusOf(container).tabIndex).toBe(0);
    act(() => inputOf(container).focus());
    render({ value: 0 });
    expect(document.activeElement).toBe(plus);
    expect(plusOf(container)).toBe(plus);
    expect(onChange).not.toHaveBeenCalled();
    render({ value: 3 });
    act(() => minusOf(container).focus());
    render({ value: 0 });
    expect(document.activeElement).toBe(plus);
  });

  for (const vertical of [false, true]) {
    it(`preserves legacy value-button focus through ${vertical ? 'vertical' : 'horizontal'} collapse and expansion`, () => {
      const onValueClick = vi.fn(() => {});
      const { container, render } = mount({
        vertical, fullWidth: true, collapseWhenZero: true,
        onIncrement: () => {}, onDecrement: () => {}, onValueClick, valueLabel: 'Open cart',
      });
      const valueButton = element<HTMLButtonElement>(container, '[aria-label="Open cart"]');
      const plus = plusOf(container);
      act(() => valueButton.focus());
      expect(document.activeElement).toBe(valueButton);
      render({ value: 0 });
      expect(document.activeElement).toBe(plus);
      expect(valueButton.tabIndex).toBe(-1);
      render({ value: 3 });
      expect(document.activeElement).toBe(plus);
      expect(element(container, '[aria-label="Open cart"]')).toBe(valueButton);
      expect(valueButton.tabIndex).toBe(0);
      act(() => { valueButton.focus(); valueButton.click(); });
      expect(document.activeElement).toBe(valueButton);
      expect(onValueClick).toHaveBeenCalledTimes(1);
    });
  }

  it('accepts parent updates through zero expansion and Enter removal without duplicate callbacks', () => {
    const calls: number[] = [];
    let update: (props: Partial<QuantityStepperProps>) => void = () => {};
    const { container, render } = mount({ value: 0, min: 3, step: 4, max: 14, allowZero: true, collapseWhenZero: true, onChange: (value) => { calls.push(value); update({ value }); } });
    update = render;
    const plus = plusOf(container);
    act(() => { plus.focus(); plus.click(); });
    expect(calls).toEqual([3]);
    expect(inputOf(container).value).toBe('3');
    expect(document.activeElement).toBe(plus);
    act(() => inputOf(container).focus());
    type(inputOf(container), '0');
    key(inputOf(container), 'Enter');
    expect(calls).toEqual([3, 0]);
    expect(document.activeElement).toBe(plus);
    expect(element(container, '[role="group"]').hasAttribute('data-collapsed')).toBe(true);
  });

  for (const collapseWhenZero of [false, true]) {
    it(`starts the plus button at the first lot from zero with collapse=${collapseWhenZero}`, () => {
      const onChange = vi.fn((value: number) => value);
      const { container } = mount({ value: 0, min: 3, step: 4, onChange, collapseWhenZero });
      act(() => plusOf(container).click());
      expect(onChange.mock.calls).toEqual([[3]]);
    });
  }

  it('starts keyboard increments at min from an initial zero without allowing removal', () => {
    const onChange = vi.fn((value: number) => value);
    const { container } = mount({ value: 0, min: 3, step: 4, onChange });
    const input = inputOf(container);
    act(() => { input.focus(); input.blur(); });
    expect(onChange).not.toHaveBeenCalled();
    key(input, 'ArrowDown');
    expect(onChange).not.toHaveBeenCalled();
    key(input, 'ArrowUp');
    expect(onChange).toHaveBeenLastCalledWith(3);
  });

  it('rejects controlled values outside the integer lot contract', () => {
    for (const value of [NaN, Infinity, -1, 1.5, 4, 15, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => renderToString(<QuantityStepper {...labels} value={value} min={3} step={4} max={14} onChange={() => {}} />)).toThrow(RangeError);
    }
  });

  it('sizes cells at the touch target, reserves rows and animates only the inline size in CSS', async () => {
    const css = readFileSync(resolve(__dirname, '../QuantityStepper.css'), 'utf-8');
    expect(css).toContain('--quantity-target: var(--touch-target);');
    // The cell is the target; only enlarged text grows it (padding fits inside).
    expect(css).toContain('--quantity-cell: max(var(--quantity-target), calc(1lh + 2 * var(--gap-sm)));');
    expect(css).toContain('--quantity-field: calc(3ch + var(--gap-sm));');
    expect(css).not.toMatch(/\d+px/);
    // − and the quantity shrink to nothing while collapsed; + is always one cell.
    expect(css).toContain('grid-template-columns: minmax(0, var(--quantity-cell)) minmax(0, var(--quantity-field)) var(--quantity-cell)');
    expect(css).toContain('grid-template-columns: minmax(0, var(--quantity-cell)) minmax(0, 1fr) var(--quantity-cell)');
    // State-independent rows: the larger collapsed icon or enlarged inherited text never
    // changes the block size between states. Auto rows would let content change it.
    expect(css).toContain('grid-template-rows: var(--quantity-cell)');
    expect(css).toContain('grid-template-rows: repeat(3, var(--quantity-cell))');
    expect(css).not.toMatch(/grid-template-rows:[^;]*auto/);
    // Collapsed: one square at the inline end; only inline size (and fades) transition.
    expect(css).toContain('inline-size: var(--quantity-square)');
    expect(css).toContain('margin-inline-start: auto');
    expect(css).toContain('inline-size var(--dur-normal) var(--ease-in-out)');
    expect(css).toContain('background-color var(--dur-fast) var(--ease-in-out)');
    expect(css).not.toMatch(/transition:[^;]*\ball\b/);
    expect(css).not.toMatch(/\b(left|right)\b/);
    expect(css).toContain('&:focus-visible');
    expect(css).toContain('box-shadow: var(--shadow-focus)');
    expect(css).toContain('&:hover:not(:disabled)');
    expect(css).toContain('background: var(--muted)');
    expect(css).toContain('visibility: hidden');
    expect(css).not.toContain('display: none');
    expect(css).toContain('grid-area: 1 / 1 / -1 / -1');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('orders vertical cart controls plus, quantity, minus in the DOM and tab order', () => {
    const { container } = mount({ onChange: () => {}, vertical: true, fullWidth: true });
    const group = element(container, '[role="group"]');
    expect(group.children[0]).toBe(plusOf(container));
    expect(group.children[1]).toBe(inputOf(container));
    expect(group.children[2]).toBe(minusOf(container));
    expect(group.getAttribute('data-vertical')).toBe('true');
    expect(group.getAttribute('data-full-width')).toBe('true');
    expect(plusOf(container).tabIndex).toBe(0);
  });


  it('disables editing and never submits the surrounding form', () => {
    const onChange = vi.fn((value: number) => value);
    const { container } = mount({ onChange, disabled: true });
    expect(inputOf(container).disabled).toBe(true);
    type(inputOf(container), '7');
    key(inputOf(container), 'Enter');
    expect(onChange).not.toHaveBeenCalled();
    expect(plusOf(container).type).toBe('button');
    expect(minusOf(container).type).toBe('button');
  });

  it('renders with no browser globals (SSR)', () => {
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'document');
    try {
      const html = renderToString(<QuantityStepper {...labels} value={0} onChange={() => {}} collapseWhenZero />);
      expect(html).toContain('role="spinbutton"');
      expect(html).toContain('data-collapsed="true"');
    } finally {
      Object.assign(globalThis, { window: previousWindow, document: previousDocument });
    }
  });
});

describe('QuantityStepper press and hold', () => {
  const press = (button: HTMLButtonElement, type: string) =>
    act(() => { button.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 })); });
  const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

  it('repeats while held and commits once on release, without a second step from the click', async () => {
    const onChange = vi.fn((_: number) => {});
    const { container } = mount({ onChange, value: 1, max: 99 });
    const plus = plusOf(container);
    press(plus, 'pointerdown');
    await wait(800);
    expect(onChange).not.toHaveBeenCalled();
    expect(Number(inputOf(container).value)).toBeGreaterThan(2);
    press(plus, 'pointerup');
    act(() => plus.click());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBeGreaterThan(2);
  });

  it('a short press is a single step', async () => {
    const onChange = vi.fn((_: number) => {});
    const { container } = mount({ onChange, value: 1 });
    const plus = plusOf(container);
    press(plus, 'pointerdown');
    await wait(100);
    press(plus, 'pointerup');
    act(() => plus.click());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toBe(2);
  });

  it('legacy mode calls the callback on every repeat', async () => {
    const onIncrement = vi.fn(() => {});
    const { container } = mount({ onIncrement, onDecrement: () => {} });
    const plus = plusOf(container);
    press(plus, 'pointerdown');
    await wait(800);
    press(plus, 'pointerup');
    act(() => plus.click());
    expect(onIncrement.mock.calls.length).toBeGreaterThan(1);
  });
});
