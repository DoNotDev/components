import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Combobox from '../../Combobox';
import Input from '../../Input';
import Select from '../../Select';
import { FieldMessage, fieldMessageAria } from '../FieldMessage';

afterEach(cleanup);

const ID = 'email-message';

function Field({ error, helperText }: { error?: string; helperText?: string }) {
  return (
    <>
      <Input
        label="Email"
        {...fieldMessageAria({ id: ID, error, helperText })}
      />
      <FieldMessage id={ID} error={error} helperText={helperText} />
    </>
  );
}

const slot = () => document.getElementById(ID)!;
const input = () => document.querySelector('input')!;

describe('FieldMessage', () => {
  it('shows the helper text in the slot, the control described by it', () => {
    render(<Field helperText="We never share it" />);
    expect(slot().textContent).toBe('We never share it');
    expect(slot().dataset.state).toBe('helper');
    expect(input().getAttribute('aria-describedby')).toBe(ID);
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('the error replaces the helper text in the same node, with an icon, announced', () => {
    const { rerender } = render(<Field helperText="We never share it" />);
    const before = slot();
    const live = before.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe('');

    rerender(<Field helperText="We never share it" error="Invalid email" />);
    expect(slot()).toBe(before);
    expect(slot().textContent).toBe('Invalid email');
    expect(slot().dataset.state).toBe('error');
    // Same live region, mounted before the message (ARIA19)
    expect(slot().querySelector('[aria-live="polite"]')).toBe(live);
    expect(live?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(input().getAttribute('aria-describedby')).toBe(ID);

    rerender(<Field helperText="We never share it" />);
    expect(slot().textContent).toBe('We never share it');
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('without helper text: mounted but visually hidden and undescribed until an error', () => {
    const { rerender } = render(<Field />);
    expect(slot().dataset.state).toBe('empty');
    expect(slot().classList.contains('dndev-sr-only')).toBe(true);
    expect(slot().textContent).toBe('');
    expect(input().hasAttribute('aria-describedby')).toBe(false);

    rerender(<Field error="Required" />);
    expect(slot().classList.contains('dndev-sr-only')).toBe(false);
    expect(slot().textContent).toBe('Required');
    expect(input().getAttribute('aria-describedby')).toBe(ID);
  });

  it('fieldMessageAria keeps other description ids after the slot', () => {
    expect(
      fieldMessageAria({ id: ID, error: 'Too long', describedBy: 'count' })
    ).toEqual({ 'aria-invalid': true, 'aria-describedby': `${ID} count` });
    expect(fieldMessageAria({ id: ID, describedBy: 'count' })).toEqual({
      'aria-describedby': 'count',
    });
    expect(fieldMessageAria({ id: ID })).toEqual({});
  });

  it('Select and Combobox put the wiring on their focusable control', () => {
    const aria = fieldMessageAria({ id: ID, error: 'Required' });
    render(
      <>
        <Select
          label="Country"
          options={[{ value: 'fr', label: 'France' }]}
          {...aria}
        />
        <Combobox label="City" options={[]} {...aria} />
      </>
    );
    for (const control of screen.getAllByRole('combobox')) {
      expect(control.getAttribute('aria-invalid')).toBe('true');
      expect(control.getAttribute('aria-describedby')).toBe(ID);
    }
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
  });
});
