import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FR_LOCALE, render } from '../../../utils/__tests__/locale';
import Tag from '../index';

afterEach(cleanup);

describe('Tag remove button label', () => {
  it('uses removeLabel', () => {
    render(
      <Tag onRemove={() => {}} removeLabel="Supprimer">
        Type: Sérum
      </Tag>
    );
    expect(screen.getByRole('button', { name: 'Supprimer' })).toBeTruthy();
  });

  it("defaults to 'Remove'", () => {
    render(<Tag onRemove={() => {}}>Type: Sérum</Tag>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy();
    cleanup();
    render(<Tag onRemove={() => {}}>Type: Sérum</Tag>, FR_LOCALE);
    expect(screen.getByRole('button', { name: 'Retirer' })).toBeTruthy();
  });
});
