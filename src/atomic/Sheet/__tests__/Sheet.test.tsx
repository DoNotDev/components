// packages/components/src/atomic/Sheet/__tests__/Sheet.test.tsx

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Sheet from '../index';

afterEach(cleanup);

describe('Sheet close button name', () => {
  it('defaults to English', () => {
    render(<Sheet open title="Panel" />);
    expect(screen.getByRole('button', { name: 'Close sheet' })).toBeTruthy();
  });

  it('uses the translated closeLabel', () => {
    render(<Sheet open title="Panel" closeLabel="Fermer le panneau" />);
    expect(screen.getByRole('button', { name: 'Fermer le panneau' })).toBeTruthy();
  });
});
