// packages/components/src/atomic/PinInput/__tests__/PinInput.test.tsx

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PinInput from '../index';
import type { PinInputProps } from '../index';

afterEach(cleanup);

type Harness = Partial<PinInputProps> & { initial?: string };

/** Controlled PinInput with a "Clear" button, like a parent resetting a wrong code. */
function Controlled({ initial = '', onChange, ...props }: Harness) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PinInput
        length={6}
        mask={false}
        label="Code"
        {...props}
        value={value}
        onChange={(next) => {
          onChange?.(next);
          setValue(next);
        }}
      />
      <button type="button" onClick={() => setValue('')}>
        Clear
      </button>
    </>
  );
}

const input = () => screen.getByLabelText('Code') as HTMLInputElement;
const slots = () =>
  Array.from(document.querySelectorAll('.dndev-pin-input__slot')).map(
    (slot) => slot.textContent
  );

describe('PinInput (single input, 6 slots)', () => {
  it('is one labelled one-time-code input with 6 visual slots', () => {
    render(<Controlled />);
    expect(document.querySelectorAll('input')).toHaveLength(1);
    expect(input().autocomplete).toBe('one-time-code');
    expect(input().inputMode).toBe('numeric');
    expect(input().maxLength).toBe(6);
    expect(slots()).toEqual(['', '', '', '', '', '']);
  });

  it('typing fills the slots in order', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    fireEvent.change(input(), { target: { value: '1' } });
    fireEvent.change(input(), { target: { value: '12' } });
    expect(onChange).toHaveBeenLastCalledWith('12');
    expect(slots()).toEqual(['1', '2', '', '', '', '']);
  });

  it('filters invalid characters and clamps to length', () => {
    const onChange = vi.fn();
    render(<Controlled onChange={onChange} />);
    fireEvent.change(input(), { target: { value: 'a1 2-3b4567' } });
    expect(onChange).toHaveBeenLastCalledWith('123456');
  });

  it('pastes a full (formatted) code anywhere, replacing the selection', () => {
    const onComplete = vi.fn();
    render(<Controlled initial="99" onComplete={onComplete} />);
    input().setSelectionRange(0, 2);
    fireEvent.paste(input(), { clipboardData: { getData: () => '123 456' } });
    expect(input().value).toBe('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('a full code pasted over typed digits replaces the whole value', () => {
    const onChange = vi.fn();
    render(<Controlled initial="12" onChange={onChange} />);
    input().setSelectionRange(1, 1);
    fireEvent.paste(input(), { clipboardData: { getData: () => '654321' } });
    expect(onChange).toHaveBeenLastCalledWith('654321');
    expect(input().value).toBe('654321');
  });

  it('a shorter paste is inserted at the caret', () => {
    const onChange = vi.fn();
    render(<Controlled initial="12" onChange={onChange} />);
    input().setSelectionRange(1, 1);
    fireEvent.paste(input(), { clipboardData: { getData: () => '9-8' } });
    expect(onChange).toHaveBeenLastCalledWith('1982');
  });

  it('backspace mid-code removes only that character', () => {
    const onChange = vi.fn();
    render(<Controlled initial="123456" onChange={onChange} />);
    // The browser's native Backspace with the caret after "3"
    fireEvent.change(input(), { target: { value: '12456' } });
    expect(onChange).toHaveBeenLastCalledWith('12456');
    expect(slots()).toEqual(['1', '2', '4', '5', '6', '']);
  });

  it('onComplete fires once per complete code', () => {
    const onComplete = vi.fn();
    render(<Controlled initial="12345" onComplete={onComplete} />);
    fireEvent.change(input(), { target: { value: '123456' } });
    fireEvent.change(input(), { target: { value: '1234567' } });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('refocuses at the start when the parent clears the value', () => {
    render(<Controlled initial="123456" />);
    input().blur();
    act(() => {
      fireEvent.click(screen.getByText('Clear'));
    });
    expect(document.activeElement).toBe(input());
    expect(input().selectionStart).toBe(0);
    expect(slots()).toEqual(['', '', '', '', '', '']);
  });

  it('clicking a filled slot selects its character', () => {
    render(<Controlled initial="123456" />);
    input().getBoundingClientRect = () =>
      ({ left: 0, width: 300 }) as DOMRect;
    fireEvent.click(input(), { clientX: 160 }); // 4th of 6 slots of 50px
    expect([input().selectionStart, input().selectionEnd]).toEqual([3, 4]);
  });

  it('the active slot follows the selection on click, keyup and focus', () => {
    render(<Controlled initial="123456" />);
    const activeSlot = () =>
      Array.from(document.querySelectorAll('.dndev-pin-input__slot')).findIndex(
        (slot) => slot.getAttribute('data-active') === 'true'
      );
    input().getBoundingClientRect = () =>
      ({ left: 0, width: 300 }) as DOMRect;
    fireEvent.click(input(), { clientX: 60 }); // 2nd of 6 slots of 50px
    expect(activeSlot()).toBe(1);
    input().setSelectionRange(3, 3);
    fireEvent.keyUp(input(), { key: 'ArrowRight' });
    expect(activeSlot()).toBe(3);
    input().setSelectionRange(0, 0);
    fireEvent.focus(input());
    expect(activeSlot()).toBe(0);
  });

  it('passes ref to the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Controlled ref={ref} />);
    expect(ref.current).toBe(input());
  });

  it('masks characters with dots by default', () => {
    render(<Controlled initial="12" mask />);
    expect(slots().slice(0, 2)).toEqual(['•', '•']);
    fireEvent.click(screen.getByRole('button', { name: 'Show PIN' }));
    expect(slots().slice(0, 2)).toEqual(['1', '2']);
  });

  it('renders on the server', () => {
    const html = renderToString(
      <PinInput value="12" onChange={() => {}} length={8} label="Code" />
    );
    expect(html).toContain('one-time-code');
    expect(html.match(/dndev-pin-input__slot"/g)).toHaveLength(8);
  });
});
