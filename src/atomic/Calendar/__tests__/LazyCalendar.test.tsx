import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LazyCalendar, { preloadCalendar } from '../LazyCalendar';

describe('LazyCalendar', () => {
  it(
    'shows the calendar-sized placeholder, then the calendar once its chunk loads',
    { timeout: 20000 },
    async () => {
      const { container } = render(
        <LazyCalendar
          mode="single"
          defaultMonth={new Date(2026, 10, 1)}
          errorLabel="Calendar unavailable"
        />
      );
      expect(
        container.querySelector('.dndev-calendar-fallback[aria-busy="true"]')
      ).not.toBeNull();

      expect(
        await screen.findByRole('grid', {}, { timeout: 15000 })
      ).toBeTruthy();
      expect(container.querySelector('.dndev-calendar-fallback')).toBeNull();
    }
  );

  it('preloads without rendering', () => {
    expect(() => preloadCalendar()).not.toThrow();
  });
});
