import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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
  });
});
