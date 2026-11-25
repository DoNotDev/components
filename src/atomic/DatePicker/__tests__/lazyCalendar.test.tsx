import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import DatePicker from '../index';

describe('DatePicker calendar', () => {
  it(
    'loads the calendar when the visitor opens it',
    { timeout: 20000 },
    async () => {
      render(<DatePicker value="2026-11-19" onChange={() => {}} />);
      expect(screen.queryByRole('grid')).toBeNull();

      const trigger = screen.getByRole('button', {
        name: 'datePicker.openCalendar',
      });
      fireEvent.pointerEnter(trigger);
      fireEvent.click(trigger);

      expect(
        await screen.findByRole('grid', {}, { timeout: 15000 })
      ).toBeTruthy();
    }
  );
});
