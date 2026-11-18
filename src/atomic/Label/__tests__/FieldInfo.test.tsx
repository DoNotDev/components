import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Input from '../../Input';
import { FloatingLabel } from '../FloatingLabel';

const HELP = 'End of the page address: /routines/oily-skin';

afterEach(cleanup);

describe('field help (info)', () => {
  it('is opt-in: no info, no (i)', () => {
    render(<Input label="URL" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('legend')?.hasAttribute('data-info')).toBe(false);
  });

  it('renders an (i) in the legend, outside the label (not part of the input name)', () => {
    render(<Input label="URL" info={HELP} />);
    const button = screen.getByRole('button', { name: HELP });
    expect(button.closest('legend')).not.toBeNull();
    expect(button.closest('label')).toBeNull();
    expect(screen.getByLabelText('URL').tagName).toBe('INPUT');
  });

  it('stays usable when the field is disabled (first legend of a disabled fieldset)', () => {
    render(
      <FloatingLabel label="URL" info={HELP} disabled>
        <input disabled />
      </FloatingLabel>
    );
    expect((screen.getByRole('button', { name: HELP }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('a tap pins the text open; Escape closes it', async () => {
    render(<Input label="URL" info={HELP} />);
    const button = screen.getByRole('button', { name: HELP });
    await act(async () => { fireEvent.click(button); });
    expect(screen.getAllByText(HELP).length).toBeGreaterThan(0);
    await act(async () => { fireEvent.keyDown(button, { key: 'Escape' }); });
    expect(screen.queryAllByText(HELP)).toHaveLength(0);
  });
});
