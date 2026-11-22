// packages/components/src/atomic/PasswordInput/__tests__/PasswordInput.test.tsx

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import PasswordInput from '../index';

afterEach(cleanup);

describe('PasswordInput toggle name', () => {
  it('defaults to English', () => {
    render(<PasswordInput aria-label="Password" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('uses the translated revealAriaLabel', () => {
    render(
      <PasswordInput
        aria-label="Mot de passe"
        revealAriaLabel={{ show: 'Afficher', hide: 'Masquer' }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Afficher' }));
    expect(screen.getByRole('button', { name: 'Masquer' })).toBeTruthy();
  });
});
