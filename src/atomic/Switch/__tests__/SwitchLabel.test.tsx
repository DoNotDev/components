// packages/components/src/atomic/Switch/__tests__/SwitchLabel.test.tsx

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import Switch from '../index';

describe('Switch label', () => {
  it('renders [switch] label, the label toggles the switch', () => {
    const onCheckedChange = vi.fn();
    const { container } = render(
      <Switch
        checked={false}
        onCheckedChange={onCheckedChange}
        label="Remettre en stock"
        variant="muted"
      />
    );
    const control = screen.getByRole('switch', { name: 'Remettre en stock' });
    const label = screen.getByText('Remettre en stock');
    // Switch first, label after
    expect(
      control.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    fireEvent.click(label);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(container.querySelector('[data-variant="muted"]')).not.toBeNull();
  });

  it('keeps the on/off texts when a label is also given', () => {
    render(
      <Switch
        checked
        label="Mode"
        uncheckedLabel="Manuel"
        checkedLabel="Auto"
      />
    );
    expect(screen.getByText('Manuel')).toBeTruthy();
    expect(screen.getByText('Auto')).toBeTruthy();
    expect(screen.getByRole('switch', { name: 'Mode' })).toBeTruthy();
  });
});
