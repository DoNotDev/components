import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import ActionButton from '../../ActionButton';
import Button, { BUTTON_INTENT } from '../index';

afterEach(cleanup);

const iconOf = (name: string) => screen.getByRole('button', { name }).querySelector('svg');

describe('Button intent', () => {
  it('gives every intent an icon', () => {
    for (const intent of Object.values(BUTTON_INTENT)) {
      render(<Button intent={intent}>{intent}</Button>);
      expect(iconOf(intent), intent).not.toBeNull();
      cleanup();
    }
  });

  it('delete is destructive unless a variant is given', () => {
    render(<><Button intent="delete">Delete</Button><Button intent="delete" variant="outline">Remove</Button></>);
    expect(screen.getByRole('button', { name: 'Delete' }).getAttribute('data-variant')).toBe('destructive');
    expect(screen.getByRole('button', { name: 'Remove' }).getAttribute('data-variant')).toBe('outline');
  });

  it('an explicit icon wins over the intent', () => {
    render(<Button intent="save" icon={<svg data-testid="own" />}>Save</Button>);
    expect(screen.getByTestId('own')).toBeTruthy();
    expect(iconOf('Save')?.getAttribute('data-testid')).toBe('own');
  });

  it('ActionButton passes the intent through', () => {
    render(<ActionButton intent="publish" action={async () => undefined}>Publish</ActionButton>);
    expect(iconOf('Publish')).not.toBeNull();
  });

  it('no intent, no icon', () => {
    render(<Button>Plain</Button>);
    expect(iconOf('Plain')).toBeNull();
  });
});
