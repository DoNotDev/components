import { createRef } from 'react';
import type { FocusEvent } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Input from '../index';

afterEach(cleanup);

describe('Input native focus events', () => {
  it.each([
    { mode: 'labeled', label: 'Phone', bare: undefined },
    { mode: 'bare', label: undefined, bare: true },
  ])('forwards focus and blur to the $mode input while preserving refs and attributes', ({ label, bare }) => {
    const ref = createRef<HTMLInputElement>();
    const onFocus = vi.fn((event: FocusEvent<HTMLInputElement>) => event.currentTarget);
    const onBlur = vi.fn((event: FocusEvent<HTMLInputElement>) => event.currentTarget);
    const onChange = vi.fn();
    render(
      <Input
        label={label}
        bare={bare}
        ref={ref}
        id="contact-phone"
        name="contact.phone"
        type="tel"
        required
        autoComplete="tel"
        aria-label="Phone"
        defaultValue="123"
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox', { name: 'Phone' });
    expect(ref.current).toBe(input);
    expect(input.id).toBe('contact-phone');
    expect(input.getAttribute('name')).toBe('contact.phone');
    expect(input.getAttribute('type')).toBe('tel');
    expect(input.getAttribute('autocomplete')).toBe('tel');
    expect(input.hasAttribute('required')).toBe(true);
    expect(input.getAttribute('data-bare')).toBe('true');
    expect(input).toHaveProperty('value', '123');
    expect(onFocus).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onFocus.mock.calls[0]?.[0].target).toBe(input);
    expect(onFocus.mock.results[0]?.value).toBe(input);
    expect(onBlur).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '456' } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(input).toHaveProperty('value', '456');

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(onBlur.mock.calls[0]?.[0].target).toBe(input);
    expect(onBlur.mock.results[0]?.value).toBe(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
  });
});
