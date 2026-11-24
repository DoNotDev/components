import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import QuantityStepper from '../index';
import type { QuantityStepperProps } from '../index';

const events: string[] = [];
const cancel = vi.fn();
const flyTo = vi.fn((_source: Element, _target: string | Element) => {
  events.push('fly');
  return { cancel } as unknown as Animation;
});
vi.mock('../../../utils/flyTo', () => ({ flyTo: (source: Element, target: string | Element) => flyTo(source, target) }));

// DOM from the vitest environment (happy-dom); act() without testing-library needs the flag.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: ReturnType<typeof createRoot>[] = [];
const labels = { 'aria-label': 'Quantity of paper', decrementLabel: 'Remove a lot', incrementLabel: 'Add a lot' };
const image = document.createElement('img');
const flyFrom = { current: image };

function mount(props: Partial<QuantityStepperProps> = {}) {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  act(() => root.render(<QuantityStepper {...labels} value={0} allowZero flyFrom={flyFrom} flyTo="cart" {...props} />));
  return container;
}
const plusOf = (container: Element) => container.querySelector<HTMLButtonElement>('.dndev-quantity-stepper-increment')!;
const minusOf = (container: Element) => container.querySelector<HTMLButtonElement>('.dndev-quantity-stepper-decrement')!;
const press = (button: HTMLButtonElement, type: string) =>
  act(() => { button.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0 })); });
const wait = (ms: number) => act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)));

beforeEach(() => {
  events.length = 0;
  flyTo.mockClear();
  cancel.mockClear();
});
afterEach(() => {
  act(() => { for (const root of roots.splice(0)) root.unmount(); });
  document.body.replaceChildren();
});

describe('QuantityStepper fly to cart', () => {
  it('flies the source onto the target before calling onChange', () => {
    const onChange = vi.fn((_: number) => { events.push('change'); });
    const container = mount({ onChange });
    act(() => plusOf(container).click());
    expect(flyTo).toHaveBeenCalledWith(image, 'cart');
    expect(events).toEqual(['fly', 'change']);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('a hold of many ticks flies once, on release', async () => {
    const onChange = vi.fn((_: number) => {});
    const container = mount({ onChange, value: 1, max: 99, flyEveryAdd: true });
    const plus = plusOf(container);
    press(plus, 'pointerdown');
    await wait(800);
    expect(flyTo).not.toHaveBeenCalled();
    press(plus, 'pointerup');
    act(() => plus.click());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(flyTo).toHaveBeenCalledTimes(1);
  });

  it('flies only on the first add by default, on every increase with flyEveryAdd, never on a decrease', () => {
    const onChange = vi.fn((_: number) => {});
    let container = mount({ onChange, value: 2, max: 9 });
    act(() => plusOf(container).click());
    expect(onChange).toHaveBeenLastCalledWith(3);
    expect(flyTo).not.toHaveBeenCalled();

    container = mount({ onChange, value: 2, max: 9, flyEveryAdd: true });
    act(() => plusOf(container).click());
    expect(flyTo).toHaveBeenCalledTimes(1);
    act(() => minusOf(container).click());
    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(flyTo).toHaveBeenCalledTimes(1);
  });

  it('flies a typed higher value', () => {
    const onChange = vi.fn((_: number) => {});
    const container = mount({ onChange, value: 2, max: 9, flyEveryAdd: true });
    const input = container.querySelector('input')!;
    act(() => input.focus());
    input.value = '5';
    act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    expect(onChange).toHaveBeenCalledWith(5);
    expect(flyTo).toHaveBeenCalledTimes(1);
  });

  it('needs both flyFrom and flyTo', () => {
    const onChange = vi.fn((_: number) => {});
    for (const props of [{ flyTo: undefined }, { flyFrom: undefined }, { flyFrom: { current: null } }]) {
      const container = mount({ onChange, ...props });
      act(() => plusOf(container).click());
    }
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(flyTo).not.toHaveBeenCalled();
  });

  it('never flies in legacy mode (per-tick writes)', async () => {
    const onIncrement = vi.fn(() => {});
    const container = mount({ onIncrement, onDecrement: () => {}, flyEveryAdd: true });
    act(() => plusOf(container).click());
    const plus = plusOf(container);
    press(plus, 'pointerdown');
    await wait(800);
    press(plus, 'pointerup');
    expect(onIncrement.mock.calls.length).toBeGreaterThan(1);
    expect(flyTo).not.toHaveBeenCalled();
  });

  it('cancels the flight when the returned write rejects, without an unhandled rejection', async () => {
    const container = mount({ onChange: () => Promise.reject(new Error('write failed')) });
    await act(async () => plusOf(container).click());
    expect(flyTo).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('keeps the flight when the returned write resolves', async () => {
    const container = mount({ onChange: () => Promise.resolve() });
    await act(async () => plusOf(container).click());
    expect(flyTo).toHaveBeenCalledTimes(1);
    expect(cancel).not.toHaveBeenCalled();
  });
});
