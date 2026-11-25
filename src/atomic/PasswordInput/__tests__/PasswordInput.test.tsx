// packages/components/src/atomic/PasswordInput/__tests__/PasswordInput.test.tsx

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FR_LOCALE, render } from '../../../utils/__tests__/locale';
import PasswordInput from '../index';

afterEach(cleanup);

describe('PasswordInput toggle name', () => {
  it('defaults to English', () => {
    render(<PasswordInput aria-label="Password" />);
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeTruthy();
  });

  it('defaults to the UI language', () => {
    render(<PasswordInput aria-label="Mot de passe" />, FR_LOCALE);
    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }));
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toBeTruthy();
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
